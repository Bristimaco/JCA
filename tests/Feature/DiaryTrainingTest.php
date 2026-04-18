<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\DiaryTraining;
use App\Models\Member;
use App\Models\TrainingType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DiaryTrainingTest extends TestCase
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

    public function test_user_can_toggle_training_on(): void
    {
        [$user, $member] = $this->setupUserWithMember();

        $tt = TrainingType::create([
            'member_id' => $member->id,
            'name' => 'Judo',
            'surplus_calories' => 400,
            'is_default' => true,
        ]);

        $response = $this->actingAs($user)->post("/voeding-dagboek/{$member->id}/trainingen", [
            'training_type_id' => $tt->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('diary_trainings', [
            'member_id' => $member->id,
            'training_type_id' => $tt->id,
        ]);
    }

    public function test_user_can_toggle_training_off(): void
    {
        [$user, $member] = $this->setupUserWithMember();

        $tt = TrainingType::create([
            'member_id' => $member->id,
            'name' => 'Judo',
            'surplus_calories' => 400,
            'is_default' => true,
        ]);

        DiaryTraining::create([
            'member_id' => $member->id,
            'training_type_id' => $tt->id,
            'date' => now()->toDateString(),
        ]);

        $response = $this->actingAs($user)->post("/voeding-dagboek/{$member->id}/trainingen", [
            'training_type_id' => $tt->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseMissing('diary_trainings', [
            'member_id' => $member->id,
            'training_type_id' => $tt->id,
            'date' => now()->toDateString(),
        ]);
    }

    public function test_user_can_update_actual_calories(): void
    {
        [$user, $member] = $this->setupUserWithMember();

        $tt = TrainingType::create([
            'member_id' => $member->id,
            'name' => 'Judo',
            'surplus_calories' => 400,
            'is_default' => true,
        ]);

        $dt = DiaryTraining::create([
            'member_id' => $member->id,
            'training_type_id' => $tt->id,
            'date' => now()->toDateString(),
        ]);

        $response = $this->actingAs($user)->patch("/voeding-dagboek/trainingen/{$dt->id}", [
            'actual_calories' => 550,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('diary_trainings', [
            'id' => $dt->id,
            'actual_calories' => '550.0',
        ]);
    }

    public function test_user_can_clear_actual_calories(): void
    {
        [$user, $member] = $this->setupUserWithMember();

        $tt = TrainingType::create([
            'member_id' => $member->id,
            'name' => 'Judo',
            'surplus_calories' => 400,
            'is_default' => true,
        ]);

        $dt = DiaryTraining::create([
            'member_id' => $member->id,
            'training_type_id' => $tt->id,
            'date' => now()->toDateString(),
            'actual_calories' => 550,
        ]);

        $response = $this->actingAs($user)->patch("/voeding-dagboek/trainingen/{$dt->id}", [
            'actual_calories' => null,
        ]);

        $response->assertRedirect();
        $this->assertNull($dt->fresh()->actual_calories);
    }

    public function test_user_cannot_toggle_other_members_training(): void
    {
        [$user] = $this->setupUserWithMember();
        $otherMember = Member::factory()->create();

        $tt = TrainingType::create([
            'member_id' => $otherMember->id,
            'name' => 'Judo',
            'surplus_calories' => 400,
            'is_default' => true,
        ]);

        $response = $this->actingAs($user)->post("/voeding-dagboek/{$otherMember->id}/trainingen", [
            'training_type_id' => $tt->id,
        ]);

        $response->assertForbidden();
    }
}
