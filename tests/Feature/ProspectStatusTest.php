<?php

namespace Tests\Feature;

use App\Enums\ProspectStatus;
use App\Enums\UserRole;
use App\Models\Prospect;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProspectStatusTest extends TestCase
{
    use RefreshDatabase;

    private function adminUser(): User
    {
        return User::factory()->create([
            'role' => UserRole::Admin,
            'email_verified_at' => now(),
        ]);
    }

    private function createProspect(array $attrs = []): Prospect
    {
        return Prospect::create(array_merge([
            'vat_number' => '0123456789',
            'company_name' => 'Test BV',
        ], $attrs));
    }

    public function test_new_prospect_defaults_to_inactief(): void
    {
        $prospect = $this->createProspect();
        $prospect->refresh();

        $this->assertEquals(ProspectStatus::Inactief, $prospect->status);
    }

    public function test_can_activate_prospect(): void
    {
        $user = $this->adminUser();
        $prospect = $this->createProspect();

        $response = $this->actingAs($user)->post("/admin/prospectie/{$prospect->id}/activate");

        $response->assertRedirect();
        $prospect->refresh();
        $this->assertEquals(ProspectStatus::Actief, $prospect->status);
    }

    public function test_can_deactivate_prospect(): void
    {
        $user = $this->adminUser();
        $prospect = $this->createProspect(['status' => 'actief']);

        $response = $this->actingAs($user)->post("/admin/prospectie/{$prospect->id}/deactivate");

        $response->assertRedirect();
        $prospect->refresh();
        $this->assertEquals(ProspectStatus::Inactief, $prospect->status);
    }

    public function test_archive_sets_gearchiveerd_status(): void
    {
        $user = $this->adminUser();
        $prospect = $this->createProspect(['status' => 'actief']);

        $response = $this->actingAs($user)->post("/admin/prospectie/{$prospect->id}/archive");

        $response->assertRedirect();
        $prospect->refresh();
        $this->assertEquals(ProspectStatus::Gearchiveerd, $prospect->status);
        $this->assertEquals('no_sponsor', $prospect->archived_reason);
    }

    public function test_unarchive_sets_inactief_status(): void
    {
        $user = $this->adminUser();
        $prospect = $this->createProspect(['status' => 'gearchiveerd', 'archived_reason' => 'no_sponsor']);

        $response = $this->actingAs($user)->post("/admin/prospectie/{$prospect->id}/unarchive");

        $response->assertRedirect();
        $prospect->refresh();
        $this->assertEquals(ProspectStatus::Inactief, $prospect->status);
        $this->assertNull($prospect->archived_reason);
    }

    public function test_convert_to_sponsor_archives_prospect(): void
    {
        $user = $this->adminUser();
        $prospect = $this->createProspect([
            'status' => 'actief',
            'sponsor_start_date' => now()->toDateString(),
            'sponsor_renewal_months' => 12,
        ]);

        $response = $this->actingAs($user)->post("/admin/prospectie/{$prospect->id}/convert");

        $response->assertRedirect();
        $prospect->refresh();
        $this->assertEquals(ProspectStatus::Gearchiveerd, $prospect->status);
        $this->assertEquals('converted', $prospect->archived_reason);
    }

    public function test_filter_actief_only_returns_active_prospects(): void
    {
        $user = $this->adminUser();
        $this->createProspect(['vat_number' => '0000000001', 'company_name' => 'Actief BV', 'status' => 'actief']);
        $this->createProspect(['vat_number' => '0000000002', 'company_name' => 'Inactief BV', 'status' => 'inactief']);
        $this->createProspect(['vat_number' => '0000000003', 'company_name' => 'Archief BV', 'status' => 'gearchiveerd']);

        $response = $this->actingAs($user)->get('/admin/prospectie?filter=actief');

        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Prospectie')
            ->has('prospects', 1)
            ->where('prospects.0.company_name', 'Actief BV')
        );
    }

    public function test_filter_inactief_only_returns_inactive_prospects(): void
    {
        $user = $this->adminUser();
        $this->createProspect(['vat_number' => '0000000001', 'company_name' => 'Actief BV', 'status' => 'actief']);
        $this->createProspect(['vat_number' => '0000000002', 'company_name' => 'Inactief BV', 'status' => 'inactief']);

        $response = $this->actingAs($user)->get('/admin/prospectie?filter=inactief');

        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Prospectie')
            ->has('prospects', 1)
            ->where('prospects.0.company_name', 'Inactief BV')
        );
    }

    public function test_filter_gearchiveerd_only_returns_archived_prospects(): void
    {
        $user = $this->adminUser();
        $this->createProspect(['vat_number' => '0000000001', 'company_name' => 'Actief BV', 'status' => 'actief']);
        $this->createProspect(['vat_number' => '0000000002', 'company_name' => 'Archief BV', 'status' => 'gearchiveerd']);

        $response = $this->actingAs($user)->get('/admin/prospectie?filter=gearchiveerd');

        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Prospectie')
            ->has('prospects', 1)
            ->where('prospects.0.company_name', 'Archief BV')
        );
    }

    public function test_default_filter_is_actief(): void
    {
        $user = $this->adminUser();
        $this->createProspect(['vat_number' => '0000000001', 'company_name' => 'Actief BV', 'status' => 'actief']);
        $this->createProspect(['vat_number' => '0000000002', 'company_name' => 'Inactief BV', 'status' => 'inactief']);

        $response = $this->actingAs($user)->get('/admin/prospectie');

        $response->assertInertia(fn ($page) => $page
            ->where('filter', 'actief')
            ->has('prospects', 1)
            ->where('prospects.0.company_name', 'Actief BV')
        );
    }
}
