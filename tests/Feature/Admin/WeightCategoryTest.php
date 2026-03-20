<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\AgeCategory;
use App\Models\User;
use App\Models\WeightCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WeightCategoryTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create([
            'role' => UserRole::Admin,
            'email_verified_at' => now(),
        ]);
    }

    private function ageCategory(): AgeCategory
    {
        return AgeCategory::create([
            'name' => 'U15',
            'country_code' => 'BE',
            'min_age' => 13,
            'max_age' => 14,
            'display_order' => 1,
        ]);
    }

    public function test_admin_can_create_weight_category(): void
    {
        $ageCat = $this->ageCategory();

        $response = $this->actingAs($this->admin())->post('/admin/weight-categories', [
            'age_category_id' => $ageCat->id,
            'name' => '-60',
            'gender' => 'male',
            'max_weight_kg' => 60.0,
            'display_order' => 1,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('weight_categories', [
            'age_category_id' => $ageCat->id,
            'name' => '-60',
            'gender' => 'male',
            'max_weight_kg' => 60.0,
        ]);
    }

    public function test_admin_cannot_create_with_invalid_data(): void
    {
        $response = $this->actingAs($this->admin())->post('/admin/weight-categories', [
            'age_category_id' => 999,
            'name' => '',
            'gender' => 'invalid',
            'max_weight_kg' => 'abc',
            'display_order' => -1,
        ]);

        $response->assertSessionHasErrors(['age_category_id', 'name', 'gender', 'max_weight_kg', 'display_order']);
    }

    public function test_admin_can_update_weight_category(): void
    {
        $ageCat = $this->ageCategory();
        $weight = WeightCategory::create([
            'age_category_id' => $ageCat->id,
            'name' => '-60',
            'gender' => 'male',
            'max_weight_kg' => 60.0,
            'display_order' => 1,
        ]);

        $response = $this->actingAs($this->admin())->patch("/admin/weight-categories/{$weight->id}", [
            'name' => '-66',
            'gender' => 'male',
            'max_weight_kg' => 66.0,
            'display_order' => 2,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('weight_categories', [
            'id' => $weight->id,
            'name' => '-66',
            'max_weight_kg' => 66.0,
        ]);
    }

    public function test_admin_can_delete_weight_category(): void
    {
        $ageCat = $this->ageCategory();
        $weight = WeightCategory::create([
            'age_category_id' => $ageCat->id,
            'name' => '-60',
            'gender' => 'male',
            'max_weight_kg' => 60.0,
            'display_order' => 1,
        ]);

        $response = $this->actingAs($this->admin())->delete("/admin/weight-categories/{$weight->id}");

        $response->assertRedirect();
        $this->assertDatabaseMissing('weight_categories', ['id' => $weight->id]);
    }

    public function test_non_admin_cannot_manage_weight_categories(): void
    {
        $user = User::factory()->create([
            'role' => UserRole::Member,
            'email_verified_at' => now(),
        ]);
        $ageCat = $this->ageCategory();

        $response = $this->actingAs($user)->post('/admin/weight-categories', [
            'age_category_id' => $ageCat->id,
            'name' => '-60',
            'gender' => 'male',
            'max_weight_kg' => 60.0,
            'display_order' => 1,
        ]);

        $response->assertStatus(403);
    }

    public function test_deleting_age_category_cascades_weight_categories(): void
    {
        $ageCat = $this->ageCategory();
        WeightCategory::create([
            'age_category_id' => $ageCat->id,
            'name' => '-60',
            'gender' => 'male',
            'max_weight_kg' => 60.0,
            'display_order' => 1,
        ]);

        $this->assertDatabaseCount('weight_categories', 1);
        $ageCat->delete();
        $this->assertDatabaseCount('weight_categories', 0);
    }

    public function test_admin_dashboard_includes_weight_categories(): void
    {
        $ageCat = $this->ageCategory();
        WeightCategory::create([
            'age_category_id' => $ageCat->id,
            'name' => '-60',
            'gender' => 'male',
            'max_weight_kg' => 60.0,
            'display_order' => 1,
        ]);

        $response = $this->actingAs($this->admin())->get('/admin');

        $response->assertOk();
        $response->assertInertia(
            fn($page) => $page
                ->has('weightCategories', 1)
                ->where('weightCategories.0.name', '-60')
        );
    }
}
