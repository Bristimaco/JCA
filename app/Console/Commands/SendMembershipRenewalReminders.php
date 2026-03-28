<?php

namespace App\Console\Commands;

use App\Mail\MembershipRenewalReminder;
use App\Models\Member;
use App\Notifications\MembershipRenewalNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Mail;

class SendMembershipRenewalReminders extends Command
{
    protected $signature = 'membership:send-renewal-reminders';

    protected $description = 'Send reminders to members whose membership renewal date is within 30 days';

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
            ->with('users', 'guardians.user')
            ->get();

        $sent = 0;

        foreach ($members as $member) {
            $notified = $this->notifyMember($member);

            if (! $notified) {
                $this->warn("Geen e-mail gevonden voor {$member->fullName()} (ID: {$member->id})");

                continue;
            }

            $member->update(['membership_fee_reminded_at' => now()]);
            $sent++;

            $this->info("Herinnering verstuurd voor {$member->fullName()}");
        }

        $this->info("Klaar: {$sent} herinnering(en) verstuurd.");

        return self::SUCCESS;
    }

    private function notifyMember(Member $member): bool
    {
        $users = $this->resolveUsers($member);

        if ($users->isNotEmpty()) {
            foreach ($users as $user) {
                $user->notify(new MembershipRenewalNotification($member));
            }

            return true;
        }

        // Fallback: no linked users, send email directly
        $email = $member->resolveEmail();

        if (! $email) {
            return false;
        }

        Mail::to($email)->send(new MembershipRenewalReminder($member));

        return true;
    }

    private function resolveUsers(Member $member): Collection
    {
        // Direct linked users
        if ($member->users->isNotEmpty()) {
            return $member->users;
        }

        // Guardian users (for minors)
        $guardianUsers = $member->guardians
            ->filter(fn ($g) => $g->user_id !== null)
            ->map(fn ($g) => $g->user)
            ->filter();

        return $guardianUsers;
    }
}
