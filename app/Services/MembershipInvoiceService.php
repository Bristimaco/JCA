<?php

namespace App\Services;

use App\Models\Member;
use App\Models\MembershipInvoice;
use App\Models\MembershipInvoiceLine;
use App\Models\TrainingGroup;
use App\Models\User;
use App\Notifications\MembershipPaymentNotification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class MembershipInvoiceService
{
    public function __construct(
        protected MolliePaymentService $mollie,
    ) {}

    public function generateInvoicesForDueMembers(): int
    {
        $dueMembers = Member::where('membership_renewal_date', '<=', Carbon::today()->addDays(30))
            ->whereHas('trainingGroups')
            ->with(['trainingGroups', 'users.members.trainingGroups', 'guardians.user.members.trainingGroups'])
            ->get();

        if ($dueMembers->isEmpty()) {
            Log::info('Facturatie: geen leden met vernieuwingsdatum binnen 30 dagen gevonden.');

            return 0;
        }

        Log::info('Facturatie: '.$dueMembers->count().' lid/leden gevonden met vernieuwingsdatum binnen 30 dagen.');

        // Group due members by payer
        $membersByPayer = $dueMembers->groupBy(fn (Member $member) => $this->resolvePayerForMember($member)?->id);

        $invoiceCount = 0;

        foreach ($membersByPayer as $payerId => $members) {
            if (! $payerId) {
                $names = $members->map(fn ($m) => $m->fullName())->join(', ');
                Log::warning("Facturatie: geen betaler gevonden voor: {$names}. Overgeslagen.");

                continue;
            }

            $payer = User::find($payerId);
            if (! $payer) {
                Log::warning("Facturatie: betaler (user_id={$payerId}) niet gevonden. Overgeslagen.");

                continue;
            }

            // Check if there's already a pending invoice for this payer this year
            $year = Carbon::today()->year;
            $existing = MembershipInvoice::where('user_id', $payer->id)
                ->where('year', $year)
                ->whereIn('status', ['pending'])
                ->exists();

            if ($existing) {
                Log::info("Facturatie: betaler {$payer->name} heeft al een openstaande factuur voor {$year}. Overgeslagen.");

                continue;
            }

            $invoice = $this->createInvoiceForPayer($payer, $members, $year);
            if ($invoice) {
                $invoiceCount++;
            }
        }

        return $invoiceCount;
    }

    public function resolvePayerForMember(Member $member): ?User
    {
        // Prefer linked user with any role
        $directUser = $member->users()->first();
        if ($directUser) {
            return $directUser;
        }

        // Fallback: primary guardian's user account
        $guardian = $member->primaryGuardian();
        if ($guardian?->user) {
            return $guardian->user;
        }

        return null;
    }

    protected function createInvoiceForPayer(User $payer, Collection $members, int $year): ?MembershipInvoice
    {
        $lines = [];
        $total = 0;

        // Get all members this payer pays for (from their linked members)
        $allPayerMemberIds = $payer->members()->pluck('members.id')->all();

        // For each due member, find their most expensive training group
        foreach ($members as $member) {
            $mostExpensiveGroup = $this->getMostExpensiveGroup($member);
            if (! $mostExpensiveGroup) {
                continue;
            }

            // Count how many of this payer's members are in the same group (for discount calculation)
            $sameGroupMembers = collect($allPayerMemberIds)
                ->filter(fn ($mid) => $mostExpensiveGroup->members->pluck('id')->contains($mid))
                ->values();

            $memberPosition = $sameGroupMembers->search($member->id);
            $isDiscounted = $memberPosition > 0 && $mostExpensiveGroup->membership_fee_discount > 0;

            $amount = $isDiscounted
                ? max(0, $mostExpensiveGroup->membership_fee - $mostExpensiveGroup->membership_fee_discount)
                : $mostExpensiveGroup->membership_fee;

            $lines[] = [
                'member_id' => $member->id,
                'training_group_id' => $mostExpensiveGroup->id,
                'amount' => $amount,
                'is_discounted' => $isDiscounted,
            ];

            $total += $amount;
        }

        if (empty($lines) || $total <= 0) {
            return null;
        }

        $invoice = MembershipInvoice::create([
            'user_id' => $payer->id,
            'total_amount' => $total,
            'status' => 'pending',
            'due_date' => Carbon::today()->addDays(30),
            'year' => $year,
        ]);

        foreach ($lines as $line) {
            MembershipInvoiceLine::create([
                'invoice_id' => $invoice->id,
                ...$line,
            ]);
        }

        // Create Mollie payment link
        $memberNames = $members->map(fn ($m) => $m->fullName())->join(', ');
        $description = "Lidgeld {$year} — {$memberNames}";
        $this->mollie->createPaymentLink($invoice, $description);

        // Refresh invoice to get Mollie data (payment_url may be set now)
        $invoice->refresh();

        // Mark members as reminded
        foreach ($members as $member) {
            $member->update(['membership_fee_reminded_at' => now()]);
        }

        // Notify payer
        $invoice->load('lines.member', 'lines.trainingGroup');
        $payer->notify(new MembershipPaymentNotification($invoice));

        return $invoice;
    }

    protected function getMostExpensiveGroup(Member $member): ?TrainingGroup
    {
        return $member->trainingGroups
            ->sortByDesc('membership_fee')
            ->first();
    }
}
