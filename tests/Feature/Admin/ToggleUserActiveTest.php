<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ToggleUserActiveTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_deactivate_user(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin,
            'email_verified_at' => now(),
        ]);

        $user = User::factory()->create([
            'role' => UserRole::Member,
            'email_verified_at' => now(),
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->patch("/admin/users/{$user->id}/toggle-active");

        $response->assertRedirect();
        $this->assertFalse($user->fresh()->is_active);
    }

    public function test_admin_can_reactivate_user(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin,
            'email_verified_at' => now(),
        ]);

        $user = User::factory()->create([
            'role' => UserRole::Member,
            'email_verified_at' => now(),
            'is_active' => false,
        ]);

        $response = $this->actingAs($admin)->patch("/admin/users/{$user->id}/toggle-active");

        $response->assertRedirect();
        $this->assertTrue($user->fresh()->is_active);
    }

    public function test_admin_cannot_deactivate_self(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin,
            'email_verified_at' => now(),
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->patch("/admin/users/{$admin->id}/toggle-active");

        $response->assertRedirect();
        $this->assertTrue($admin->fresh()->is_active);
    }

    public function test_deactivated_user_cannot_access_app(): void
    {
        $user = User::factory()->create([
            'role' => UserRole::Member,
            'email_verified_at' => now(),
            'is_active' => false,
        ]);

        $response = $this->actingAs($user)->get('/');

        $response->assertRedirect(route('approval.pending'));
    }

    public function test_non_admin_cannot_toggle_active(): void
    {
        $member = User::factory()->create([
            'role' => UserRole::Member,
            'email_verified_at' => now(),
        ]);

        $user = User::factory()->create([
            'role' => UserRole::Member,
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($member)->patch("/admin/users/{$user->id}/toggle-active");

        $response->assertStatus(403);
    }
}
