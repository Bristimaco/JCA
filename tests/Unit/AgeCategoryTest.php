<?php

namespace Tests\Unit;

use App\Models\AgeCategory;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AgeCategoryTest extends TestCase
{
    use RefreshDatabase;

    private function seedBelgianCategories(): void
    {
        AgeCategory::create(['name' => 'U11', 'country_code' => 'BE', 'min_age' => 0, 'max_age' => 10, 'display_order' => 1]);
        AgeCategory::create(['name' => 'U13', 'country_code' => 'BE', 'min_age' => 11, 'max_age' => 12, 'display_order' => 2]);
        AgeCategory::create(['name' => 'U15', 'country_code' => 'BE', 'min_age' => 13, 'max_age' => 14, 'display_order' => 3]);
        AgeCategory::create(['name' => 'U18', 'country_code' => 'BE', 'min_age' => 15, 'max_age' => 17, 'display_order' => 4]);
        AgeCategory::create(['name' => 'U21', 'country_code' => 'BE', 'min_age' => 18, 'max_age' => 20, 'display_order' => 5]);
        AgeCategory::create(['name' => 'Senior', 'country_code' => 'BE', 'min_age' => 21, 'max_age' => 99, 'display_order' => 6]);
    }

    private function seedFrenchCategories(): void
    {
        AgeCategory::create(['name' => 'U15', 'country_code' => 'FR', 'min_age' => 13, 'max_age' => 14, 'cutoff_date' => '07-01', 'display_order' => 1]);
        AgeCategory::create(['name' => 'U18', 'country_code' => 'FR', 'min_age' => 15, 'max_age' => 17, 'cutoff_date' => '07-01', 'display_order' => 2]);
    }

    public function test_belgium_year_based_15_this_year_falls_in_u18(): void
    {
        $this->seedBelgianCategories();

        // Born 2011, reference date 2026 → turns 15 this year
        $birthDate = Carbon::create(2011, 8, 15);
        $referenceDate = Carbon::create(2026, 3, 1);

        $category = AgeCategory::forBirthDate($birthDate, 'BE', $referenceDate);

        $this->assertNotNull($category);
        $this->assertEquals('U18', $category->name);
    }

    public function test_belgium_year_based_14_this_year_falls_in_u15(): void
    {
        $this->seedBelgianCategories();

        // Born 2012, reference date 2026 → turns 14 this year
        $birthDate = Carbon::create(2012, 6, 10);
        $referenceDate = Carbon::create(2026, 1, 15);

        $category = AgeCategory::forBirthDate($birthDate, 'BE', $referenceDate);

        $this->assertNotNull($category);
        $this->assertEquals('U15', $category->name);
    }

    public function test_belgium_year_based_10_this_year_falls_in_u11(): void
    {
        $this->seedBelgianCategories();

        $birthDate = Carbon::create(2016, 12, 1);
        $referenceDate = Carbon::create(2026, 3, 1);

        $category = AgeCategory::forBirthDate($birthDate, 'BE', $referenceDate);

        $this->assertNotNull($category);
        $this->assertEquals('U11', $category->name);
    }

    public function test_france_cutoff_before_date_still_previous_season(): void
    {
        $this->seedFrenchCategories();

        // Born 2011-07-16, reference date 2026-06-15 (before July 1st cutoff)
        // On last cutoff (2025-07-01) was 14 → U15
        $birthDate = Carbon::create(2011, 7, 16);
        $referenceDate = Carbon::create(2026, 6, 15);

        $category = AgeCategory::forBirthDate($birthDate, 'FR', $referenceDate);

        $this->assertNotNull($category);
        $this->assertEquals('U15', $category->name);
    }

    public function test_france_cutoff_after_date_new_season(): void
    {
        $this->seedFrenchCategories();

        // Born 2011-07-16, reference date 2026-07-17 (after July 1st cutoff)
        // On cutoff 2026-07-01 was 14 → still U15 (not 15 until July 16)
        $birthDate = Carbon::create(2011, 7, 16);
        $referenceDate = Carbon::create(2026, 7, 17);

        $category = AgeCategory::forBirthDate($birthDate, 'FR', $referenceDate);

        $this->assertNotNull($category);
        $this->assertEquals('U15', $category->name);
    }

    public function test_france_15_on_cutoff_date_falls_in_u18(): void
    {
        $this->seedFrenchCategories();

        // Born 2011-06-15, reference date 2026-07-02 (after cutoff)
        // On cutoff 2026-07-01 was 15 → U18
        $birthDate = Carbon::create(2011, 6, 15);
        $referenceDate = Carbon::create(2026, 7, 2);

        $category = AgeCategory::forBirthDate($birthDate, 'FR', $referenceDate);

        $this->assertNotNull($category);
        $this->assertEquals('U18', $category->name);
    }

    public function test_returns_null_for_country_without_categories(): void
    {
        $this->seedBelgianCategories();

        $birthDate = Carbon::create(2012, 5, 1);
        $category = AgeCategory::forBirthDate($birthDate, 'DE');

        $this->assertNull($category);
    }

    public function test_returns_null_when_age_not_in_any_category(): void
    {
        // Only create U15, so age 10 won't match
        AgeCategory::create(['name' => 'U15', 'country_code' => 'BE', 'min_age' => 13, 'max_age' => 14, 'display_order' => 1]);

        $birthDate = Carbon::create(2016, 1, 1);
        $referenceDate = Carbon::create(2026, 1, 1);

        $category = AgeCategory::forBirthDate($birthDate, 'BE', $referenceDate);

        $this->assertNull($category);
    }
}
