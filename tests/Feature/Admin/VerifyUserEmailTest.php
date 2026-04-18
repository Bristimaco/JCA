<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class VerifyUserEmailTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create([
            'role' => UserRole::Admin,
            'email_verified_at' => now(),
        ]);
    }

    public function test_admin_can_manually_verify_user_email(): void
    {
        $admin = $this->admin();

        $unverifiedUser = User::factory()->create([
            'role' => null,
            'email_verified_at' => null,
        ]);

        $response = $this->actingAs($admin)
            ->patch("/admin/users/{$unverifiedUser->id}/verify-email");

        $response->assertRedirect();
        $this->assertNotNull($unverifiedUser->fresh()->email_verified_at);
    }

    public function test_admin_cannot_verify_already_verified_email(): void
    {
        $admin = $this->admin();

        $verifiedUser = User::factory()->create([
            'role' => null,
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($admin)
            ->patch("/admin/users/{$verifiedUser->id}/verify-email");

        $response->assertRedirect();
        $response->assertSessionHas('status', 'Dit e-mailadres is al geverifieerd.');
    }

    public function test_admin_can_resend_verification_email(): void
    {
        Notification::fake();

        $admin = $this->admin();

        $unverifiedUser = User::factory()->create([
            'role' => null,
            'email_verified_at' => null,
        ]);

        $response = $this->actingAs($admin)
            ->post("/admin/users/{$unverifiedUser->id}/resend-verification");

        $response->assertRedirect();
        Notification::assertSentTo($unverifiedUser, VerifyEmail::class);
    }

    public function test_admin_cannot_resend_verification_for_verified_user(): void
    {
        Notification::fake();

        $admin = $this->admin();

        $verifiedUser = User::factory()->create([
            'role' => null,
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($admin)
            ->post("/admin/users/{$verifiedUser->id}/resend-verification");

        $response->assertRedirect();
        $response->assertSessionHas('status', 'Dit e-mailadres is al geverifieerd.');
        Notification::assertNotSentTo($verifiedUser, VerifyEmail::class);
    }

    public function test_non_admin_cannot_verify_user_email(): void
    {
        $member = User::factory()->create([
            'role' => UserRole::Member,
            'email_verified_at' => now(),
        ]);

        $unverifiedUser = User::factory()->create([
            'role' => null,
            'email_verified_at' => null,
        ]);

        $response = $this->actingAs($member)
            ->patch("/admin/users/{$unverifiedUser->id}/verify-email");

        $response->assertForbidden();
        $this->assertNull($unverifiedUser->fresh()->email_verified_at);
    }

    public function test_non_admin_cannot_resend_verification(): void
    {
        $member = User::factory()->create([
            'role' => UserRole::Member,
            'email_verified_at' => now(),
        ]);

        $unverifiedUser = User::factory()->create([
            'role' => null,
            'email_verified_at' => null,
        ]);

        $response = $this->actingAs($member)
            ->post("/admin/users/{$unverifiedUser->id}/resend-verification");

        $response->assertForbidden();
    }
}
