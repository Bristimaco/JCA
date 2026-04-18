<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\AutoTrainingDismissal;
use App\Models\DiaryTraining;
use App\Models\Member;
use App\Models\NutritionPlan;
use App\Models\TrainingAbsence;
use App\Models\TrainingCancellation;
use App\Models\TrainingGroup;
use App\Models\TrainingSchedule;
use App\Models\TrainingType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class AutoCheckTrainingTest extends TestCase
{
    use RefreshDatabase;

    private function setupUserWithMember(): array
    {
        $user = User::factory()->create([
            'role' => UserRole::Member,
            'email_verified_at' => now(),
        ]);

        $member = Member::factory()->create();
        $user->members()->attach($member);

        return [$user, $member];
    }

    private function createDefaultTrainingType(Member $member): TrainingType
    {
        return TrainingType::create([
            'member_id' => $member->id,
            'name' => 'Judo',
            'is_default' => true,
            'surplus_calories' => 400,
        ]);
    }

    private function createScheduleForToday(TrainingGroup $group): TrainingSchedule
    {
        $todayDay = ucfirst(now()->locale('nl')->isoFormat('dddd'));

        return TrainingSchedule::create([
            'training_group_id' => $group->id,
            'day' => $todayDay,
            'start_time' => '18:00',
            'end_time' => '19:30',
            'is_extra' => false,
        ]);
    }

    private function createNutritionPlan(Member $member): NutritionPlan
    {
        return NutritionPlan::create([
            'member_id' => $member->id,
            'min_calories' => 2000,
            'max_calories' => 2500,
        ]);
    }

    public function test_auto_checks_judo_when_regular_training_scheduled_today(): void
    {
        [$user, $member] = $this->setupUserWithMember();
        $tt = $this->createDefaultTrainingType($member);
        $this->createNutritionPlan($member);

        $group = TrainingGroup::create(['name' => 'Judo A', 'membership_fee' => 0]);
        $group->members()->attach($member);
        $this->createScheduleForToday($group);

        $this->assertDatabaseMissing('diary_trainings', [
            'member_id' => $member->id,
            'training_type_id' => $tt->id,
        ]);

        $response = $this->actingAs($user)->get("/voeding-dagboek/{$member->id}");

        $response->assertOk();
        $this->assertDatabaseHas('diary_trainings', [
            'member_id' => $member->id,
            'training_type_id' => $tt->id,
            'date' => Carbon::today(),
        ]);
    }

    public function test_auto_checks_judo_when_extra_training_scheduled_today(): void
    {
        [$user, $member] = $this->setupUserWithMember();
        $tt = $this->createDefaultTrainingType($member);
        $this->createNutritionPlan($member);

        $group = TrainingGroup::create(['name' => 'Judo A', 'membership_fee' => 0]);
        $group->members()->attach($member);

        $schedule = TrainingSchedule::create([
            'training_group_id' => $group->id,
            'is_extra' => true,
            'date' => Carbon::today(),
            'start_time' => '10:00',
            'end_time' => '11:30',
        ]);

        $response = $this->actingAs($user)->get("/voeding-dagboek/{$member->id}");

        $response->assertOk();
        $this->assertDatabaseHas('diary_trainings', [
            'member_id' => $member->id,
            'training_type_id' => $tt->id,
            'date' => Carbon::today(),
        ]);
    }

    public function test_no_auto_check_when_member_is_absent(): void
    {
        [$user, $member] = $this->setupUserWithMember();
        $tt = $this->createDefaultTrainingType($member);
        $this->createNutritionPlan($member);

        $group = TrainingGroup::create(['name' => 'Judo A', 'membership_fee' => 0]);
        $group->members()->attach($member);
        $schedule = $this->createScheduleForToday($group);

        TrainingAbsence::create([
            'member_id' => $member->id,
            'training_schedule_id' => $schedule->id,
            'date' => Carbon::today(),
            'reason' => 'Ziek',
        ]);

        $response = $this->actingAs($user)->get("/voeding-dagboek/{$member->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('diary_trainings', [
            'member_id' => $member->id,
            'training_type_id' => $tt->id,
        ]);
    }

    public function test_no_auto_check_when_training_is_cancelled(): void
    {
        [$user, $member] = $this->setupUserWithMember();
        $tt = $this->createDefaultTrainingType($member);
        $this->createNutritionPlan($member);

        $group = TrainingGroup::create(['name' => 'Judo A', 'membership_fee' => 0]);
        $group->members()->attach($member);
        $schedule = $this->createScheduleForToday($group);

        TrainingCancellation::create([
            'training_schedule_id' => $schedule->id,
            'date' => Carbon::today(),
            'reason' => 'Feestdag',
        ]);

        $response = $this->actingAs($user)->get("/voeding-dagboek/{$member->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('diary_trainings', [
            'member_id' => $member->id,
            'training_type_id' => $tt->id,
        ]);
    }

    public function test_no_duplicate_when_diary_training_already_exists(): void
    {
        [$user, $member] = $this->setupUserWithMember();
        $tt = $this->createDefaultTrainingType($member);
        $this->createNutritionPlan($member);

        $group = TrainingGroup::create(['name' => 'Judo A', 'membership_fee' => 0]);
        $group->members()->attach($member);
        $this->createScheduleForToday($group);

        DiaryTraining::create([
            'member_id' => $member->id,
            'training_type_id' => $tt->id,
            'date' => Carbon::today(),
        ]);

        $response = $this->actingAs($user)->get("/voeding-dagboek/{$member->id}");

        $response->assertOk();
        $this->assertEquals(1, DiaryTraining::where('member_id', $member->id)
            ->where('training_type_id', $tt->id)
            ->whereDate('date', now()->toDateString())
            ->count());
    }

    public function test_no_auto_check_when_dismissed(): void
    {
        [$user, $member] = $this->setupUserWithMember();
        $tt = $this->createDefaultTrainingType($member);
        $this->createNutritionPlan($member);

        $group = TrainingGroup::create(['name' => 'Judo A', 'membership_fee' => 0]);
        $group->members()->attach($member);
        $this->createScheduleForToday($group);

        AutoTrainingDismissal::create([
            'member_id' => $member->id,
            'training_type_id' => $tt->id,
            'date' => Carbon::today(),
        ]);

        $response = $this->actingAs($user)->get("/voeding-dagboek/{$member->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('diary_trainings', [
            'member_id' => $member->id,
            'training_type_id' => $tt->id,
        ]);
    }

    public function test_no_auto_check_when_no_training_groups(): void
    {
        [$user, $member] = $this->setupUserWithMember();
        $this->createDefaultTrainingType($member);
        $this->createNutritionPlan($member);

        $response = $this->actingAs($user)->get("/voeding-dagboek/{$member->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('diary_trainings', [
            'member_id' => $member->id,
        ]);
    }

    public function test_no_auto_check_on_wrong_day(): void
    {
        [$user, $member] = $this->setupUserWithMember();
        $this->createDefaultTrainingType($member);
        $this->createNutritionPlan($member);

        $group = TrainingGroup::create(['name' => 'Judo A', 'membership_fee' => 0]);
        $group->members()->attach($member);

        $tomorrowDay = ucfirst(now()->addDay()->locale('nl')->isoFormat('dddd'));

        TrainingSchedule::create([
            'training_group_id' => $group->id,
            'day' => $tomorrowDay,
            'start_time' => '18:00',
            'end_time' => '19:30',
            'is_extra' => false,
        ]);

        $response = $this->actingAs($user)->get("/voeding-dagboek/{$member->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('diary_trainings', [
            'member_id' => $member->id,
        ]);
    }

    public function test_no_auto_check_when_no_default_training_type(): void
    {
        [$user, $member] = $this->setupUserWithMember();
        $this->createNutritionPlan($member);

        TrainingType::create([
            'member_id' => $member->id,
            'name' => 'Pilates',
            'is_default' => false,
            'surplus_calories' => 200,
        ]);

        $group = TrainingGroup::create(['name' => 'Judo A', 'membership_fee' => 0]);
        $group->members()->attach($member);
        $this->createScheduleForToday($group);

        $response = $this->actingAs($user)->get("/voeding-dagboek/{$member->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('diary_trainings', [
            'member_id' => $member->id,
        ]);
    }

    public function test_toggle_off_default_training_creates_dismissal(): void
    {
        [$user, $member] = $this->setupUserWithMember();
        $tt = $this->createDefaultTrainingType($member);

        $group = TrainingGroup::create(['name' => 'Judo A', 'membership_fee' => 0]);
        $group->members()->attach($member);
        $this->createScheduleForToday($group);

        DiaryTraining::create([
            'member_id' => $member->id,
            'training_type_id' => $tt->id,
            'date' => Carbon::today(),
        ]);

        $response = $this->actingAs($user)->post("/voeding-dagboek/{$member->id}/trainingen", [
            'training_type_id' => $tt->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseMissing('diary_trainings', [
            'member_id' => $member->id,
            'training_type_id' => $tt->id,
            'date' => Carbon::today(),
        ]);
        $this->assertDatabaseHas('auto_training_dismissals', [
            'member_id' => $member->id,
            'training_type_id' => $tt->id,
            'date' => Carbon::today(),
        ]);
    }

    public function test_toggle_on_removes_dismissal(): void
    {
        [$user, $member] = $this->setupUserWithMember();
        $tt = $this->createDefaultTrainingType($member);

        AutoTrainingDismissal::create([
            'member_id' => $member->id,
            'training_type_id' => $tt->id,
            'date' => Carbon::today(),
        ]);

        $response = $this->actingAs($user)->post("/voeding-dagboek/{$member->id}/trainingen", [
            'training_type_id' => $tt->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('diary_trainings', [
            'member_id' => $member->id,
            'training_type_id' => $tt->id,
            'date' => Carbon::today(),
        ]);
        $this->assertDatabaseMissing('auto_training_dismissals', [
            'member_id' => $member->id,
            'training_type_id' => $tt->id,
            'date' => Carbon::today(),
        ]);
    }

    public function test_toggle_off_non_default_does_not_create_dismissal(): void
    {
        [$user, $member] = $this->setupUserWithMember();

        $tt = TrainingType::create([
            'member_id' => $member->id,
            'name' => 'Pilates',
            'is_default' => false,
            'surplus_calories' => 200,
        ]);

        $group = TrainingGroup::create(['name' => 'Judo A', 'membership_fee' => 0]);
        $group->members()->attach($member);
        $this->createScheduleForToday($group);

        DiaryTraining::create([
            'member_id' => $member->id,
            'training_type_id' => $tt->id,
            'date' => Carbon::today(),
        ]);

        $response = $this->actingAs($user)->post("/voeding-dagboek/{$member->id}/trainingen", [
            'training_type_id' => $tt->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseMissing('auto_training_dismissals', [
            'member_id' => $member->id,
        ]);
    }
}
