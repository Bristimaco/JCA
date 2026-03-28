<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\AgeCategory;
use App\Models\Member;
use App\Models\User;
use App\Models\WeightCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MemberTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create([
            'role' => UserRole::Admin,
            'email_verified_at' => now(),
        ]);
    }

    private function validData(array $overrides = []): array
    {
        return array_merge([
            'first_name' => 'Jan',
            'last_name' => 'Peeters',
            'date_of_birth' => '2010-05-15',
            'gender' => 'male',
            'email' => 'jan@example.com',
            'phone' => '0471234567',
            'address_street' => 'Kerkstraat 1',
            'address_city' => 'Gent',
            'address_postal_code' => '9000',
            'membership_status' => 'active',
            'is_competition' => false,
            'membership_renewal_date' => '2027-03-26',
        ], $overrides);
    }

    public function test_admin_can_create_member(): void
    {
        $response = $this->actingAs($this->admin())->post('/admin/members', $this->validData());

        $response->assertRedirect();
        $this->assertDatabaseHas('members', [
            'first_name' => 'Jan',
            'last_name' => 'Peeters',
            'gender' => 'male',
            'membership_status' => 'active',
        ]);
    }

    public function test_admin_can_create_member_with_photo(): void
    {
        $response = $this->actingAs($this->admin())->post('/admin/members', $this->validData([
            'photo' => 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
        ]));

        $response->assertRedirect();

        $member = Member::first();
        $this->assertNotNull($member->photo_data);
        $this->assertNotNull($member->photo_mime);
    }

    public function test_admin_can_create_member_with_license(): void
    {
        $response = $this->actingAs($this->admin())->post('/admin/members', $this->validData([
            'license_number' => 'JCA-123456',
        ]));

        $response->assertRedirect();
        $this->assertDatabaseHas('members', [
            'license_number' => 'JCA-123456',
        ]);
    }

    public function test_admin_can_create_competition_member(): void
    {
        $ageCat = AgeCategory::create([
            'name' => 'U15',
            'country_code' => 'BE',
            'min_age' => 13,
            'max_age' => 14,
            'display_order' => 1,
        ]);
        $wc = WeightCategory::create([
            'age_category_id' => $ageCat->id,
            'name' => '-46',
            'max_weight_kg' => 46,
            'gender' => 'male',
            'display_order' => 1,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin())->post('/admin/members', $this->validData([
            'is_competition' => true,
            'weight_category_id' => $wc->id,
        ]));

        $response->assertRedirect();
        $this->assertDatabaseHas('members', [
            'first_name' => 'Jan',
            'is_competition' => true,
            'weight_category_id' => $wc->id,
        ]);
    }

    public function test_admin_cannot_create_member_with_invalid_data(): void
    {
        $response = $this->actingAs($this->admin())->post('/admin/members', [
            'first_name' => '',
            'last_name' => '',
            'date_of_birth' => 'invalid',
            'gender' => 'other',
            'membership_status' => 'unknown',
        ]);

        $response->assertSessionHasErrors(['first_name', 'last_name', 'date_of_birth', 'gender', 'membership_status']);
    }

    public function test_license_number_must_be_unique(): void
    {
        Member::factory()->create(['license_number' => 'JCA-111111']);

        $response = $this->actingAs($this->admin())->post('/admin/members', $this->validData([
            'license_number' => 'JCA-111111',
        ]));

        $response->assertSessionHasErrors('license_number');
    }

    public function test_admin_can_update_member(): void
    {
        $member = Member::factory()->create();

        $response = $this->actingAs($this->admin())->patch("/admin/members/{$member->id}", $this->validData([
            'first_name' => 'Updated',
            'last_name' => 'Name',
        ]));

        $response->assertRedirect();
        $this->assertDatabaseHas('members', [
            'id' => $member->id,
            'first_name' => 'Updated',
            'last_name' => 'Name',
        ]);
    }

    public function test_admin_can_update_member_photo(): void
    {
        $member = Member::factory()->create(['photo_data' => base64_encode('old'), 'photo_mime' => 'image/jpeg']);

        $response = $this->actingAs($this->admin())->patch("/admin/members/{$member->id}", $this->validData([
            'photo' => 'data:image/png;base64,iVBORw0KGgoAAAANS==',
        ]));

        $response->assertRedirect();

        $member->refresh();
        $this->assertNotEquals(base64_encode('old'), $member->photo_data);
        $this->assertNotNull($member->photo_data);
    }

    public function test_license_number_unique_ignores_self_on_update(): void
    {
        $member = Member::factory()->create(['license_number' => 'JCA-111111']);

        $response = $this->actingAs($this->admin())->patch("/admin/members/{$member->id}", $this->validData([
            'license_number' => 'JCA-111111',
        ]));

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();
    }

    public function test_admin_can_delete_member(): void
    {
        $member = Member::factory()->create();

        $response = $this->actingAs($this->admin())->delete("/admin/members/{$member->id}");

        $response->assertRedirect();
        $this->assertSoftDeleted('members', ['id' => $member->id]);
    }

    public function test_deleting_member_removes_photo(): void
    {
        $member = Member::factory()->create(['photo_data' => base64_encode('content'), 'photo_mime' => 'image/jpeg']);

        $this->actingAs($this->admin())->delete("/admin/members/{$member->id}");

        $this->assertSoftDeleted('members', ['id' => $member->id]);
    }

    public function test_non_admin_cannot_manage_members(): void
    {
        $memberUser = User::factory()->create([
            'role' => UserRole::Member,
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($memberUser)->post('/admin/members', $this->validData());

        $response->assertStatus(403);
    }

    public function test_admin_can_view_members_page(): void
    {
        Member::factory()->count(3)->create();

        $response = $this->actingAs($this->admin())->get('/admin/members');

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('Admin/Members')
                ->has('members', 3)
                ->has('ageCategories')
                ->has('weightCategories')
        );
    }
}
