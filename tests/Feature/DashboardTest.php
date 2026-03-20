<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_sees_dashboard_with_pending_count(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin,
            'email_verified_at' => now(),
        ]);

        // Pending user (no role, verified)
        User::factory()->create([
            'role' => null,
            'email_verified_at' => now(),
            'name' => 'Pending User',
        ]);

        $response = $this->actingAs($admin)->get('/');

        $response->assertStatus(200);
        $response->assertInertia(
            fn($page) => $page
                ->component('Dashboard')
                ->where('pendingCount', 1)
        );
    }

    public function test_admin_pending_count_excludes_unverified(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin,
            'email_verified_at' => now(),
        ]);

        // Unverified user (should not count)
        User::factory()->unverified()->create([
            'role' => null,
        ]);

        $response = $this->actingAs($admin)->get('/');

        $response->assertInertia(
            fn($page) => $page
                ->component('Dashboard')
                ->where('pendingCount', 0)
        );
    }

    public function test_non_admin_sees_dashboard_without_pending_count(): void
    {
        $member = User::factory()->create([
            'role' => UserRole::Member,
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($member)->get('/');

        $response->assertStatus(200);
        $response->assertInertia(
            fn($page) => $page
                ->component('Dashboard')
                ->missing('pendingCount')
        );
    }

    public function test_admin_can_access_admin_module(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin,
            'email_verified_at' => now(),
        ]);

        User::factory()->create([
            'role' => null,
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($admin)->get('/admin');

        $response->assertStatus(200);
        $response->assertInertia(
            fn($page) => $page
                ->component('Admin/Dashboard')
                ->has('pendingUsers', 1)
                ->has('users')
                ->has('roles')
        );
    }

    public function test_non_admin_cannot_access_admin_module(): void
    {
        $member = User::factory()->create([
            'role' => UserRole::Member,
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($member)->get('/admin');

        $response->assertStatus(403);
    }
}
