<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\Member;
use App\Models\MembershipInvoice;
use App\Models\TrainingGroup;
use App\Models\User;
use App\Services\MolliePaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class MembershipInvoiceTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create([
            'role' => UserRole::Admin,
            'email_verified_at' => now(),
        ]);
    }

    public function test_send_reminders_also_generates_invoices(): void
    {
        Notification::fake();

        // Mock Mollie so no real API calls are made
        $this->mock(MolliePaymentService::class, function ($mock) {
            $mock->shouldReceive('createPaymentLink')->once()->andReturnUsing(
                fn(MembershipInvoice $inv) => $inv
            );
        });

        $admin = $this->admin();

        // Create a training group with a fee
        $group = TrainingGroup::create([
            'name' => 'Beginners',
            'membership_fee' => 150.00,
            'membership_fee_discount' => 0,
        ]);

        // Create a member with renewal date within 30 days
        $member = Member::factory()->create([
            'membership_renewal_date' => Carbon::today()->addDays(10),
        ]);

        // Link member to user and training group
        $payer = User::factory()->create(['email_verified_at' => now()]);
        $payer->members()->attach($member);
        $member->trainingGroups()->attach($group);

        // Act: click the combined button
        $response = $this->actingAs($admin)->post('/admin/members/send-renewal-reminders');

        $response->assertRedirect();
        $response->assertSessionHas('status');

        // Assert invoice was created
        $this->assertDatabaseHas('membership_invoices', [
            'user_id' => $payer->id,
            'total_amount' => '150.00',
            'status' => 'pending',
            'year' => Carbon::today()->year,
        ]);

        // Assert invoice line was created
        $invoice = MembershipInvoice::where('user_id', $payer->id)->first();
        $this->assertNotNull($invoice);
        $this->assertDatabaseHas('membership_invoice_lines', [
            'invoice_id' => $invoice->id,
            'member_id' => $member->id,
            'training_group_id' => $group->id,
            'amount' => '150.00',
        ]);
    }

    public function test_no_duplicate_invoice_for_same_payer_and_year(): void
    {
        Notification::fake();

        $this->mock(MolliePaymentService::class, function ($mock) {
            $mock->shouldReceive('createPaymentLink')->never();
        });

        $admin = $this->admin();

        $group = TrainingGroup::create([
            'name' => 'Beginners',
            'membership_fee' => 150.00,
            'membership_fee_discount' => 0,
        ]);

        $member = Member::factory()->create([
            'membership_renewal_date' => Carbon::today()->addDays(10),
        ]);

        $payer = User::factory()->create(['email_verified_at' => now()]);
        $payer->members()->attach($member);
        $member->trainingGroups()->attach($group);

        // Pre-existing pending invoice for this year
        MembershipInvoice::create([
            'user_id' => $payer->id,
            'total_amount' => 150.00,
            'status' => 'pending',
            'due_date' => Carbon::today()->addDays(30),
            'year' => Carbon::today()->year,
        ]);

        $this->actingAs($admin)->post('/admin/members/send-renewal-reminders');

        // Should still be only 1 invoice
        $this->assertEquals(1, MembershipInvoice::where('user_id', $payer->id)->count());
    }

    public function test_non_admin_cannot_send_reminders(): void
    {
        $user = User::factory()->create([
            'role' => UserRole::Parent,
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($user)->post('/admin/members/send-renewal-reminders');

        $response->assertForbidden();
    }
}
