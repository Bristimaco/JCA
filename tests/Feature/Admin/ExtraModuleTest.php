<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExtraModuleTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_model_has_extra_module(): void
    {
        $user = User::factory()->create([
            'role' => UserRole::Member,
            'extra_modules' => ['sponsors', 'bar'],
        ]);

        $this->assertTrue($user->hasExtraModule('sponsors'));
        $this->assertTrue($user->hasExtraModule('bar'));
        $this->assertFalse($user->hasExtraModule('members'));
    }

    public function test_user_without_extra_modules(): void
    {
        $user = User::factory()->create([
            'role' => UserRole::Member,
            'extra_modules' => null,
        ]);

        $this->assertFalse($user->hasExtraModule('sponsors'));
    }

    public function test_admin_can_approve_user_with_extra_modules(): void
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
            'role' => 'parent',
            'extra_modules' => ['sponsors', 'bar'],
        ]);

        $response->assertRedirect();
        $pendingUser->refresh();
        $this->assertEquals('parent', $pendingUser->role->value);
        $this->assertEquals(['sponsors', 'bar'], $pendingUser->extra_modules);
    }

    public function test_admin_can_update_user_extra_modules(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin,
            'email_verified_at' => now(),
        ]);

        $user = User::factory()->create([
            'role' => UserRole::Member,
            'email_verified_at' => now(),
            'extra_modules' => null,
        ]);

        $response = $this->actingAs($admin)->patch("/admin/users/{$user->id}", [
            'name' => $user->name,
            'email' => $user->email,
            'role' => 'member',
            'extra_modules' => ['sponsors', 'events'],
        ]);

        $response->assertRedirect();
        $user->refresh();
        $this->assertEquals(['sponsors', 'events'], $user->extra_modules);
    }

    public function test_user_with_extra_module_can_access_protected_route(): void
    {
        $user = User::factory()->create([
            'role' => UserRole::Member,
            'email_verified_at' => now(),
            'extra_modules' => ['sponsors'],
        ]);

        $response = $this->actingAs($user)->get('/admin/sponsors');
        $response->assertStatus(200);
    }

    public function test_user_without_extra_module_cannot_access_protected_route(): void
    {
        $user = User::factory()->create([
            'role' => UserRole::Member,
            'email_verified_at' => now(),
            'extra_modules' => ['bar'],
        ]);

        $response = $this->actingAs($user)->get('/admin/sponsors');
        $response->assertStatus(403);
    }

    public function test_admin_can_access_any_module_route_without_extra_modules(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin,
            'email_verified_at' => now(),
            'extra_modules' => null,
        ]);

        $response = $this->actingAs($admin)->get('/admin/sponsors');
        $response->assertStatus(200);
    }

    public function test_invalid_extra_module_rejected(): void
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
            'name' => $user->name,
            'email' => $user->email,
            'role' => 'member',
            'extra_modules' => ['invalid_module'],
        ]);

        $response->assertSessionHasErrors('extra_modules.0');
    }
}
