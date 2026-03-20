<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApprovalTest extends TestCase
{
    use RefreshDatabase;

    public function test_unapproved_user_is_redirected_to_pending(): void
    {
        $user = User::factory()->create([
            'role' => null,
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($user)->get('/');

        $response->assertRedirect(route('approval.pending'));
    }

    public function test_approved_user_can_access_app(): void
    {
        $user = User::factory()->create([
            'role' => UserRole::Member,
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($user)->get('/');

        $response->assertStatus(200);
    }

    public function test_pending_page_shows_for_unapproved_user(): void
    {
        $user = User::factory()->create([
            'role' => null,
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($user)->get(route('approval.pending'));

        $response->assertStatus(200);
    }

    public function test_approved_user_redirects_away_from_pending(): void
    {
        $user = User::factory()->create([
            'role' => UserRole::Admin,
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($user)->get(route('approval.pending'));

        $response->assertRedirect('/');
    }

    public function test_unverified_user_cannot_reach_pending_page(): void
    {
        $user = User::factory()->unverified()->create([
            'role' => null,
        ]);

        $response = $this->actingAs($user)->get(route('approval.pending'));

        $response->assertRedirect(route('verification.notice'));
    }
}
