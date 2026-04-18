<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Member;
use App\Models\TrainingType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TrainingTypeTest extends TestCase
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

    public function test_user_can_create_training_type(): void
    {
        [$user, $member] = $this->setupUserWithMember();

        $response = $this->actingAs($user)->post("/voedingsplan/{$member->id}/training-types", [
            'name' => 'Krachttraining',
            'surplus_calories' => 300,
            'surplus_protein' => 20,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('training_types', [
            'member_id' => $member->id,
            'name' => 'Krachttraining',
            'surplus_calories' => '300.0',
        ]);
    }

    public function test_user_cannot_create_duplicate_training_type(): void
    {
        [$user, $member] = $this->setupUserWithMember();

        TrainingType::create([
            'member_id' => $member->id,
            'name' => 'Cardio',
            'surplus_calories' => 200,
        ]);

        $response = $this->actingAs($user)->post("/voedingsplan/{$member->id}/training-types", [
            'name' => 'Cardio',
            'surplus_calories' => 300,
        ]);

        $response->assertRedirect();
        $this->assertCount(1, TrainingType::where('member_id', $member->id)->where('name', 'Cardio')->get());
    }

    public function test_user_can_update_training_type_surplus(): void
    {
        [$user, $member] = $this->setupUserWithMember();

        $tt = TrainingType::create([
            'member_id' => $member->id,
            'name' => 'Cardio',
            'surplus_calories' => 200,
        ]);

        $response = $this->actingAs($user)->patch("/voedingsplan/{$member->id}/training-types/{$tt->id}", [
            'surplus_calories' => 500,
            'surplus_protein' => 30,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('training_types', [
            'id' => $tt->id,
            'surplus_calories' => '500.0',
            'surplus_protein' => '30.0',
        ]);
    }

    public function test_user_can_delete_non_default_training_type(): void
    {
        [$user, $member] = $this->setupUserWithMember();

        $tt = TrainingType::create([
            'member_id' => $member->id,
            'name' => 'Cardio',
            'surplus_calories' => 200,
            'is_default' => false,
        ]);

        $response = $this->actingAs($user)->delete("/voedingsplan/{$member->id}/training-types/{$tt->id}");

        $response->assertRedirect();
        $this->assertDatabaseMissing('training_types', ['id' => $tt->id]);
    }

    public function test_user_cannot_delete_default_training_type(): void
    {
        [$user, $member] = $this->setupUserWithMember();

        $tt = TrainingType::create([
            'member_id' => $member->id,
            'name' => 'Judo',
            'surplus_calories' => 400,
            'is_default' => true,
        ]);

        $response = $this->actingAs($user)->delete("/voedingsplan/{$member->id}/training-types/{$tt->id}");

        $response->assertRedirect();
        $this->assertDatabaseHas('training_types', ['id' => $tt->id]);
    }

    public function test_user_cannot_manage_other_members_training_types(): void
    {
        [$user] = $this->setupUserWithMember();
        $otherMember = Member::factory()->create();

        $response = $this->actingAs($user)->post("/voedingsplan/{$otherMember->id}/training-types", [
            'name' => 'Hack',
            'surplus_calories' => 999,
        ]);

        $response->assertForbidden();
    }

    public function test_voedingsplan_auto_creates_judo_training_type(): void
    {
        [$user, $member] = $this->setupUserWithMember();

        $this->assertDatabaseMissing('training_types', ['member_id' => $member->id]);

        $response = $this->actingAs($user)->get('/voedingsplan');

        $response->assertOk();
        $this->assertDatabaseHas('training_types', [
            'member_id' => $member->id,
            'name' => 'Judo',
            'is_default' => true,
        ]);
    }
}
