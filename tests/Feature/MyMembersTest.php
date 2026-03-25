<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Member;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
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

    private function admin(): User
    {
        return User::factory()->create([
            'role' => UserRole::Admin,
            'email_verified_at' => now(),
        ]);
    }

    public function test_user_can_view_my_members_page(): void
    {
        $user = $this->parentUser();
        $m1 = Member::factory()->create();
        $m2 = Member::factory()->create();
        Member::factory()->create(); // unlinked
        $user->members()->attach([$m1->id, $m2->id]);

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
        $member = Member::factory()->create();
        $user->members()->attach($member);

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
            'first_name' => 'Jan',
            'license_number' => 'JCA-111111',
            'membership_status' => 'active',
        ]);
        $user->members()->attach($member);

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
        $otherMember = Member::factory()->create();

        $response = $this->actingAs($user)->patch("/mijn-leden/{$otherMember->id}", [
            'email' => 'hack@example.com',
        ]);

        $response->assertStatus(403);
    }

    public function test_user_cannot_update_other_users_member(): void
    {
        $user = $this->parentUser();
        $otherUser = $this->parentUser();
        $member = Member::factory()->create();
        $otherUser->members()->attach($member);

        $response = $this->actingAs($user)->patch("/mijn-leden/{$member->id}", [
            'email' => 'hack@example.com',
        ]);

        $response->assertStatus(403);
    }

    public function test_multiple_users_can_manage_same_member(): void
    {
        $parent1 = $this->parentUser();
        $parent2 = $this->parentUser();
        $member = Member::factory()->create();
        $parent1->members()->attach($member);
        $parent2->members()->attach($member);

        $this->actingAs($parent1)->patch("/mijn-leden/{$member->id}", [
            'email' => 'parent1@example.com',
        ])->assertRedirect();

        $this->actingAs($parent2)->patch("/mijn-leden/{$member->id}", [
            'email' => 'parent2@example.com',
        ])->assertRedirect();

        $this->assertEquals('parent2@example.com', $member->fresh()->email);
    }

    public function test_user_can_upload_photo_for_linked_member(): void
    {
        $user = $this->parentUser();
        $member = Member::factory()->create();
        $user->members()->attach($member);

        $response = $this->actingAs($user)->patch("/mijn-leden/{$member->id}", [
            'photo' => UploadedFile::fake()->image('photo.jpg', 200, 200),
        ]);

        $response->assertRedirect();
        $member->refresh();
        $this->assertNotNull($member->photo_data);
        $this->assertNotNull($member->photo_mime);
    }

    public function test_unauthenticated_user_cannot_access_my_members(): void
    {
        $response = $this->get('/mijn-leden');
        $response->assertRedirect('/login');
    }

    public function test_dashboard_shows_my_member_count(): void
    {
        $user = $this->parentUser();
        $members = Member::factory()->count(2)->create();
        $user->members()->attach($members->pluck('id'));

        $response = $this->actingAs($user)->get('/');

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('Dashboard')
                ->where('myMemberCount', 2)
        );
    }

    public function test_admin_can_link_members_to_user(): void
    {
        $admin = $this->admin();
        $parentUser = $this->parentUser();
        $m1 = Member::factory()->create();
        $m2 = Member::factory()->create();

        $response = $this->actingAs($admin)->put("/admin/users/{$parentUser->id}/members", [
            'member_ids' => [$m1->id, $m2->id],
        ]);

        $response->assertRedirect();
        $this->assertCount(2, $parentUser->fresh()->members);
    }

    public function test_admin_can_unlink_members_from_user(): void
    {
        $admin = $this->admin();
        $parentUser = $this->parentUser();
        $m1 = Member::factory()->create();
        $parentUser->members()->attach($m1);

        $response = $this->actingAs($admin)->put("/admin/users/{$parentUser->id}/members", [
            'member_ids' => [],
        ]);

        $response->assertRedirect();
        $this->assertCount(0, $parentUser->fresh()->members);
    }

    public function test_non_admin_cannot_link_members_to_user(): void
    {
        $parentUser = $this->parentUser();
        $member = Member::factory()->create();

        $response = $this->actingAs($parentUser)->put("/admin/users/{$parentUser->id}/members", [
            'member_ids' => [$member->id],
        ]);

        $response->assertStatus(403);
    }
}
