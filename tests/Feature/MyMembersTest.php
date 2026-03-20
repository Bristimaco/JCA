<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Member;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MyMembersTest extends TestCase
{
    use RefreshDatabase;

    private function parentUser(): User
    {
        return User::factory()->create([
            'role' => UserRole::Parent,
            'email_verified_at' => now(),
        ]);
    }

    private function memberUser(): User
    {
        return User::factory()->create([
            'role' => UserRole::Member,
            'email_verified_at' => now(),
        ]);
    }

    public function test_user_can_view_my_members_page(): void
    {
        $user = $this->parentUser();
        Member::factory()->create(['user_id' => $user->id]);
        Member::factory()->create(['user_id' => $user->id]);
        Member::factory()->create(); // unlinked

        $response = $this->actingAs($user)->get('/mijn-leden');

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('MyMembers')
                ->has('members', 2)
                ->has('ageCategories')
                ->has('weightCategories')
        );
    }

    public function test_user_can_update_own_linked_member_contact_info(): void
    {
        $user = $this->parentUser();
        $member = Member::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->patch("/mijn-leden/{$member->id}", [
            'email' => 'new@example.com',
            'phone' => '0499999999',
            'address_street' => 'Nieuwstraat 10',
            'address_city' => 'Brussel',
            'address_postal_code' => '1000',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('members', [
            'id' => $member->id,
            'email' => 'new@example.com',
            'phone' => '0499999999',
            'address_street' => 'Nieuwstraat 10',
            'address_city' => 'Brussel',
            'address_postal_code' => '1000',
        ]);
    }

    public function test_user_cannot_update_restricted_fields(): void
    {
        $user = $this->parentUser();
        $member = Member::factory()->create([
            'user_id' => $user->id,
            'first_name' => 'Jan',
            'license_number' => 'JCA-111111',
            'membership_status' => 'active',
        ]);

        $this->actingAs($user)->patch("/mijn-leden/{$member->id}", [
            'first_name' => 'Changed',
            'last_name' => 'Changed',
            'license_number' => 'JCA-999999',
            'membership_status' => 'inactive',
            'is_competition' => true,
            'belt_rank' => 'yellow',
        ]);

        $member->refresh();
        $this->assertEquals('Jan', $member->first_name);
        $this->assertEquals('JCA-111111', $member->license_number);
        $this->assertEquals('active', $member->membership_status->value);
    }

    public function test_user_cannot_update_unlinked_member(): void
    {
        $user = $this->parentUser();
        $otherMember = Member::factory()->create(); // not linked to user

        $response = $this->actingAs($user)->patch("/mijn-leden/{$otherMember->id}", [
            'email' => 'hack@example.com',
        ]);

        $response->assertStatus(403);
    }

    public function test_user_cannot_update_other_users_member(): void
    {
        $user = $this->parentUser();
        $otherUser = $this->parentUser();
        $member = Member::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->actingAs($user)->patch("/mijn-leden/{$member->id}", [
            'email' => 'hack@example.com',
        ]);

        $response->assertStatus(403);
    }

    public function test_user_can_upload_photo_for_linked_member(): void
    {
        Storage::fake('public');

        $user = $this->parentUser();
        $member = Member::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->patch("/mijn-leden/{$member->id}", [
            'photo' => UploadedFile::fake()->image('photo.jpg', 200, 200),
        ]);

        $response->assertRedirect();
        $member->refresh();
        $this->assertNotNull($member->photo_path);
        Storage::disk('public')->assertExists($member->photo_path);
    }

    public function test_unauthenticated_user_cannot_access_my_members(): void
    {
        $response = $this->get('/mijn-leden');
        $response->assertRedirect('/login');
    }

    public function test_dashboard_shows_my_member_count(): void
    {
        $user = $this->parentUser();
        Member::factory()->count(2)->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->get('/');

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('Dashboard')
                ->where('myMemberCount', 2)
        );
    }

    public function test_admin_can_link_member_to_user(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin,
            'email_verified_at' => now(),
        ]);
        $parentUser = $this->parentUser();

        $response = $this->actingAs($admin)->post('/admin/members', [
            'first_name' => 'Jan',
            'last_name' => 'Peeters',
            'date_of_birth' => '2010-05-15',
            'gender' => 'male',
            'membership_status' => 'active',
            'is_competition' => false,
            'user_id' => $parentUser->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('members', [
            'first_name' => 'Jan',
            'user_id' => $parentUser->id,
        ]);
    }
}
