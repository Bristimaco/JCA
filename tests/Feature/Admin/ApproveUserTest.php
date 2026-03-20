<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApproveUserTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_approve_user_with_role(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin,
            'email_verified_at' => now(),
        ]);

        $pendingUser = User::factory()->create([
            'role' => null,
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($admin)->patch("/admin/users/{$pendingUser->id}/approve", [
            'role' => 'member',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'id' => $pendingUser->id,
            'role' => 'member',
        ]);
    }

    public function test_admin_cannot_approve_without_role(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin,
            'email_verified_at' => now(),
        ]);

        $pendingUser = User::factory()->create([
            'role' => null,
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($admin)->patch("/admin/users/{$pendingUser->id}/approve", [
            'role' => '',
        ]);

        $response->assertSessionHasErrors('role');
        $this->assertNull($pendingUser->fresh()->role);
    }

    public function test_admin_cannot_approve_with_invalid_role(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin,
            'email_verified_at' => now(),
        ]);

        $pendingUser = User::factory()->create([
            'role' => null,
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($admin)->patch("/admin/users/{$pendingUser->id}/approve", [
            'role' => 'superadmin',
        ]);

        $response->assertSessionHasErrors('role');
        $this->assertNull($pendingUser->fresh()->role);
    }

    public function test_admin_cannot_approve_already_approved_user(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin,
            'email_verified_at' => now(),
        ]);

        $approvedUser = User::factory()->create([
            'role' => UserRole::Member,
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($admin)->patch("/admin/users/{$approvedUser->id}/approve", [
            'role' => 'coach',
        ]);

        $response->assertRedirect();
        $this->assertEquals(UserRole::Member, $approvedUser->fresh()->role);
    }

    public function test_non_admin_cannot_approve_users(): void
    {
        $member = User::factory()->create([
            'role' => UserRole::Member,
            'email_verified_at' => now(),
        ]);

        $pendingUser = User::factory()->create([
            'role' => null,
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($member)->patch("/admin/users/{$pendingUser->id}/approve", [
            'role' => 'member',
        ]);

        $response->assertStatus(403);
        $this->assertNull($pendingUser->fresh()->role);
    }

    public function test_unauthenticated_user_cannot_approve(): void
    {
        $pendingUser = User::factory()->create([
            'role' => null,
            'email_verified_at' => now(),
        ]);

        $response = $this->patch("/admin/users/{$pendingUser->id}/approve", [
            'role' => 'member',
        ]);

        $response->assertRedirect('/login');
    }
}
