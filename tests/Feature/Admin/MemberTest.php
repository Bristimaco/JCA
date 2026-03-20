<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\Member;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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
        Storage::fake('public');

        $response = $this->actingAs($this->admin())->post('/admin/members', $this->validData([
            'photo' => UploadedFile::fake()->image('photo.jpg', 200, 200),
        ]));

        $response->assertRedirect();

        $member = Member::first();
        $this->assertNotNull($member->photo_path);
        Storage::disk('public')->assertExists($member->photo_path);
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
        $response = $this->actingAs($this->admin())->post('/admin/members', $this->validData([
            'is_competition' => true,
            'current_weight_kg' => 45.5,
        ]));

        $response->assertRedirect();
        $this->assertDatabaseHas('members', [
            'first_name' => 'Jan',
            'is_competition' => true,
            'current_weight_kg' => 45.5,
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
        Storage::fake('public');

        $member = Member::factory()->create(['photo_path' => 'member-photos/old.jpg']);
        Storage::disk('public')->put('member-photos/old.jpg', 'old');

        $response = $this->actingAs($this->admin())->patch("/admin/members/{$member->id}", $this->validData([
            'photo' => UploadedFile::fake()->image('new.jpg', 200, 200),
        ]));

        $response->assertRedirect();

        $member->refresh();
        $this->assertNotEquals('member-photos/old.jpg', $member->photo_path);
        Storage::disk('public')->assertExists($member->photo_path);
        Storage::disk('public')->assertMissing('member-photos/old.jpg');
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
        Storage::fake('public');

        $member = Member::factory()->create(['photo_path' => 'member-photos/test.jpg']);
        Storage::disk('public')->put('member-photos/test.jpg', 'content');

        $this->actingAs($this->admin())->delete("/admin/members/{$member->id}");

        Storage::disk('public')->assertMissing('member-photos/test.jpg');
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

    public function test_admin_dashboard_includes_members(): void
    {
        Member::factory()->count(3)->create();

        $response = $this->actingAs($this->admin())->get('/admin');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Dashboard')
            ->has('members', 3)
        );
    }
}
