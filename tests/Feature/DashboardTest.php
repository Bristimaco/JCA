<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_sees_dashboard_with_pending_users(): void
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
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->has('pendingUsers', 1)
            ->has('roles')
        );
    }

    public function test_admin_does_not_see_unverified_users_as_pending(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin,
            'email_verified_at' => now(),
        ]);

        // Unverified user (should not appear in pending list)
        User::factory()->unverified()->create([
            'role' => null,
        ]);

        $response = $this->actingAs($admin)->get('/');

        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->has('pendingUsers', 0)
        );
    }

    public function test_non_admin_sees_dashboard_without_pending_users(): void
    {
        $member = User::factory()->create([
            'role' => UserRole::Member,
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($member)->get('/');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->missing('pendingUsers')
            ->missing('roles')
        );
    }
}
