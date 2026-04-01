<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\AgeCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AgeCategoryTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create([
            'role' => UserRole::Admin,
            'email_verified_at' => now(),
        ]);
    }

    public function test_admin_can_create_age_category(): void
    {
        $response = $this->actingAs($this->admin())->post('/admin/age-categories', [
            'name' => 'U15',
            'country_code' => 'BE',
            'min_age' => 13,
            'max_age' => 14,
            'cutoff_date' => null,
            'display_order' => 1,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('age_categories', [
            'name' => 'U15',
            'country_code' => 'BE',
            'min_age' => 13,
            'max_age' => 14,
            'cutoff_date' => null,
        ]);
    }

    public function test_admin_can_create_age_category_with_cutoff_date(): void
    {
        $response = $this->actingAs($this->admin())->post('/admin/age-categories', [
            'name' => 'U15',
            'country_code' => 'FR',
            'min_age' => 13,
            'max_age' => 14,
            'cutoff_date' => '07-01',
            'display_order' => 1,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('age_categories', [
            'name' => 'U15',
            'country_code' => 'FR',
            'cutoff_date' => '07-01',
        ]);
    }

    public function test_admin_cannot_create_with_invalid_data(): void
    {
        $response = $this->actingAs($this->admin())->post('/admin/age-categories', [
            'name' => '',
            'country_code' => 'BEL',
            'min_age' => -1,
            'max_age' => 5,
            'cutoff_date' => 'invalid',
            'display_order' => 0,
        ]);

        $response->assertSessionHasErrors(['name', 'country_code', 'min_age', 'cutoff_date']);
    }

    public function test_max_age_must_be_gte_min_age(): void
    {
        $response = $this->actingAs($this->admin())->post('/admin/age-categories', [
            'name' => 'U15',
            'country_code' => 'BE',
            'min_age' => 15,
            'max_age' => 10,
            'cutoff_date' => null,
            'display_order' => 1,
        ]);

        $response->assertSessionHasErrors('max_age');
    }

    public function test_admin_can_update_age_category(): void
    {
        $category = AgeCategory::create([
            'name' => 'U15',
            'country_code' => 'BE',
            'min_age' => 13,
            'max_age' => 14,
            'display_order' => 1,
        ]);

        $response = $this->actingAs($this->admin())->patch("/admin/age-categories/{$category->id}", [
            'name' => 'U16',
            'min_age' => 14,
            'max_age' => 15,
            'cutoff_date' => null,
            'display_order' => 2,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('age_categories', [
            'id' => $category->id,
            'name' => 'U16',
            'min_age' => 14,
            'max_age' => 15,
        ]);
    }

    public function test_admin_can_delete_age_category(): void
    {
        $category = AgeCategory::create([
            'name' => 'U15',
            'country_code' => 'BE',
            'min_age' => 13,
            'max_age' => 14,
            'display_order' => 1,
        ]);

        $response = $this->actingAs($this->admin())->delete("/admin/age-categories/{$category->id}");

        $response->assertRedirect();
        $this->assertDatabaseMissing('age_categories', ['id' => $category->id]);
    }

    public function test_non_admin_cannot_manage_age_categories(): void
    {
        $member = User::factory()->create([
            'role' => UserRole::Member,
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($member)->post('/admin/age-categories', [
            'name' => 'U15',
            'country_code' => 'BE',
            'min_age' => 13,
            'max_age' => 14,
            'cutoff_date' => null,
            'display_order' => 1,
        ]);

        $response->assertStatus(403);
    }

    public function test_admin_dashboard_includes_age_categories(): void
    {
        AgeCategory::create([
            'name' => 'U15',
            'country_code' => 'BE',
            'min_age' => 13,
            'max_age' => 14,
            'display_order' => 1,
        ]);

        $response = $this->actingAs($this->admin())->get('/admin');

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('Admin/Dashboard')
                ->has('ageCategories', 1)
        );
    }
}
