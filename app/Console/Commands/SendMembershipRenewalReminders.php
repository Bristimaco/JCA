<?php

namespace App\Console\Commands;

use App\Mail\MembershipRenewalReminder;
use App\Models\Member;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Mail;

class SendMembershipRenewalReminders extends Command
{
    protected $signature = 'membership:send-renewal-reminders';

    protected $description = 'Send email reminders to members whose membership renewal date is within 30 days';

    public function handle(): int
    {
        $today = Carbon::today();
        $thirtyDaysFromNow = $today->copy()->addDays(30);
        $elevenMonthsAgo = $today->copy()->subMonths(11);

        $members = Member::query()
            ->whereBetween('membership_renewal_date', [$today, $thirtyDaysFromNow])
            ->where(function ($query) use ($elevenMonthsAgo) {
                $query->whereNull('membership_fee_reminded_at')
                    ->orWhere('membership_fee_reminded_at', '<', $elevenMonthsAgo);
            })
            ->get();

        $sent = 0;

        foreach ($members as $member) {
            $email = $member->resolveEmail();

            if (!$email) {
                $this->warn("Geen e-mail gevonden voor {$member->fullName()} (ID: {$member->id})");

                continue;
            }

            Mail::to($email)->send(new MembershipRenewalReminder($member));

            $member->update(['membership_fee_reminded_at' => now()]);
            $sent++;

            $this->info("Herinnering verstuurd naar {$member->fullName()} ({$email})");
        }

        $this->info("Klaar: {$sent} herinnering(en) verstuurd.");

        return self::SUCCESS;
    }
}
