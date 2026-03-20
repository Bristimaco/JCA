<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UpdateUserTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_update_user(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin,
            'email_verified_at' => now(),
        ]);

        $user = User::factory()->create([
            'role' => UserRole::Member,
            'email_verified_at' => now(),
            'name' => 'Old Name',
        ]);

        $response = $this->actingAs($admin)->patch("/admin/users/{$user->id}", [
            'name' => 'New Name',
            'email' => $user->email,
            'role' => 'coach',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'New Name',
            'role' => 'coach',
        ]);
    }

    public function test_admin_cannot_update_user_with_invalid_data(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin,
            'email_verified_at' => now(),
        ]);

        $user = User::factory()->create([
            'role' => UserRole::Member,
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($admin)->patch("/admin/users/{$user->id}", [
            'name' => '',
            'email' => 'not-an-email',
            'role' => 'superadmin',
        ]);

        $response->assertSessionHasErrors(['name', 'email', 'role']);
    }

    public function test_admin_cannot_update_user_with_duplicate_email(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin,
            'email_verified_at' => now(),
        ]);

        $existingUser = User::factory()->create([
            'role' => UserRole::Member,
            'email_verified_at' => now(),
            'email' => 'taken@example.com',
        ]);

        $user = User::factory()->create([
            'role' => UserRole::Member,
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($admin)->patch("/admin/users/{$user->id}", [
            'name' => $user->name,
            'email' => 'taken@example.com',
            'role' => 'member',
        ]);

        $response->assertSessionHasErrors('email');
    }

    public function test_admin_can_update_user_keeping_same_email(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin,
            'email_verified_at' => now(),
        ]);

        $user = User::factory()->create([
            'role' => UserRole::Member,
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($admin)->patch("/admin/users/{$user->id}", [
            'name' => 'Updated Name',
            'email' => $user->email,
            'role' => 'member',
        ]);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();
    }

    public function test_non_admin_cannot_update_user(): void
    {
        $member = User::factory()->create([
            'role' => UserRole::Member,
            'email_verified_at' => now(),
        ]);

        $user = User::factory()->create([
            'role' => UserRole::Member,
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($member)->patch("/admin/users/{$user->id}", [
            'name' => 'Hacked',
            'email' => $user->email,
            'role' => 'admin',
        ]);

        $response->assertStatus(403);
    }

    public function test_cannot_change_role_of_last_admin(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin,
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($admin)->patch("/admin/users/{$admin->id}", [
            'name' => $admin->name,
            'email' => $admin->email,
            'role' => 'member',
        ]);

        $response->assertRedirect();
        $this->assertEquals(UserRole::Admin, $admin->fresh()->role);
    }

    public function test_can_change_role_of_admin_when_another_exists(): void
    {
        $admin1 = User::factory()->create([
            'role' => UserRole::Admin,
            'email_verified_at' => now(),
        ]);

        $admin2 = User::factory()->create([
            'role' => UserRole::Admin,
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($admin1)->patch("/admin/users/{$admin2->id}", [
            'name' => $admin2->name,
            'email' => $admin2->email,
            'role' => 'member',
        ]);

        $response->assertRedirect();
        $this->assertEquals(UserRole::Member, $admin2->fresh()->role);
    }
}
