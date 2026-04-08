<?php

namespace App\Http\Controllers\Admin;

use App\Enums\InvitationStatus;
use App\Enums\StageStatus;
use App\Http\Controllers\Controller;
use App\Mail\StageInvitation;
use App\Mail\StageRegistrationNotification as StageRegistrationMail;
use App\Mail\StageTrainerNotification as StageTrainerMail;
use App\Models\ClubSettings;
use App\Models\Member;
use App\Models\Stage;
use App\Notifications\StageInvitationNotification;
use App\Notifications\StageRegistrationNotification;
use App\Notifications\TrainerStageNotification;
use App\Services\MolliePaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class StageMembersController extends Controller
{
    public function populate(Stage $stage): RedirectResponse
    {
        if (! request()->user()->isAdmin() && ! request()->user()->isCoach()) {
            abort(403, 'Alleen trainers mogen de deelnemerslijst beheren.');
        }

        if ($stage->status !== StageStatus::Preparation) {
            return back()->with('status', 'Leden kunnen alleen worden toegevoegd in de voorbereidingsfase.');
        }

        $ageCategoryIds = $stage->ageCategories()->pluck('age_categories.id');

        if ($ageCategoryIds->isEmpty()) {
            return back()->with('status', 'Voeg eerst leeftijdscategorieën toe aan de stage.');
        }

        $existingMemberIds = $stage->members()->pluck('members.id');

        $eligible = Member::where('is_competition', true)
            ->whereNotIn('id', $existingMemberIds)
            ->get();

        $toAttach = $eligible->filter(function (Member $member) use ($stage) {
            $category = $member->calculateAgeCategory(
                $stage->country_code,
                $stage->start_date,
            );

            return $category && $stage->ageCategories->contains($category->id);
        });

        if ($toAttach->isEmpty()) {
            return back()->with('status', 'Geen nieuwe leden gevonden die aan de criteria voldoen.');
        }

        $rows = $toAttach->mapWithKeys(fn (Member $m) => [
            $m->id => [
                'invitation_status' => InvitationStatus::Pending->value,
                'invitation_token' => Str::random(64),
            ],
        ])->all();

        $stage->members()->attach($rows);

        return back()->with('status', $toAttach->count().' leden toegevoegd aan de stage.');
    }

    public function addMember(Request $request, Stage $stage): RedirectResponse
    {
        if (! request()->user()->isAdmin() && ! request()->user()->isCoach()) {
            abort(403, 'Alleen trainers mogen de deelnemerslijst beheren.');
        }

        if ($stage->status !== StageStatus::Preparation) {
            return back()->with('status', 'Leden kunnen alleen worden toegevoegd in de voorbereidingsfase.');
        }

        $validated = $request->validate([
            'member_id' => ['required', 'integer', 'exists:members,id'],
        ]);

        if ($stage->members()->where('members.id', $validated['member_id'])->exists()) {
            return back()->with('status', 'Dit lid staat al op de lijst.');
        }

        $member = Member::findOrFail($validated['member_id']);

        if (! $member->is_competition) {
            return back()->with('status', 'Dit lid is geen competitielid.');
        }

        $category = $member->calculateAgeCategory(
            $stage->country_code,
            $stage->start_date,
        );

        if (! $category || ! $stage->ageCategories->contains($category->id)) {
            return back()->with('status', 'Dit lid valt niet in een leeftijdscategorie van deze stage.');
        }

        $stage->members()->attach($member->id, [
            'invitation_status' => InvitationStatus::Pending->value,
            'invitation_token' => Str::random(64),
        ]);

        return back()->with('status', $member->fullName().' is toegevoegd.');
    }

    public function removeMember(Stage $stage, Member $member): RedirectResponse
    {
        if (! request()->user()->isAdmin() && ! request()->user()->isCoach()) {
            abort(403, 'Alleen trainers mogen de deelnemerslijst beheren.');
        }

        if ($stage->status !== StageStatus::Preparation) {
            return back()->with('status', 'Leden kunnen alleen worden verwijderd in de voorbereidingsfase.');
        }

        $stage->members()->detach($member->id);

        return back()->with('status', $member->fullName().' is verwijderd van de stage.');
    }

    public function invite(Stage $stage, Member $member): RedirectResponse
    {
        $pivot = $stage->members()->where('members.id', $member->id)->first()?->pivot;

        if (! $pivot) {
            return back()->with('status', 'Dit lid staat niet op de lijst.');
        }

        $this->sendInvitation($stage, $member, $pivot);

        return back()->with('status', 'Uitnodiging verstuurd naar '.$member->fullName().'.');
    }

    public function inviteAll(Stage $stage): RedirectResponse
    {
        $pendingMembers = $stage->members()
            ->wherePivot('invitation_status', InvitationStatus::Pending->value)
            ->get();

        if ($pendingMembers->isEmpty()) {
            return back()->with('status', 'Geen leden om uit te nodigen.');
        }

        $count = 0;
        foreach ($pendingMembers as $member) {
            $this->sendInvitation($stage, $member, $member->pivot);
            $count++;
        }

        return back()->with('status', $count.' uitnodigingen verstuurd.');
    }

    public function closeInvitations(Stage $stage): RedirectResponse
    {
        $notInvited = $stage->members()
            ->wherePivot('invitation_status', InvitationStatus::Pending->value)
            ->count();

        if ($notInvited > 0) {
            return back()->with('status', "Kan niet afsluiten: {$notInvited} leden zijn nog niet uitgenodigd.");
        }

        if ($stage->coaches()->count() === 0) {
            return back()->with('status', 'Kan niet afsluiten: wijs eerst minstens één trainer toe.');
        }

        $stage->update(['status' => StageStatus::InvitationsSent]);

        $this->notifyCoaches($stage);

        return back()->with('status', 'Uitnodigingsfase afgesloten. Status: Uitnodigingen verstuurd.');
    }

    public function openRegistrations(Stage $stage): RedirectResponse
    {
        $stage->update(['status' => StageStatus::RegistrationsOpen]);

        return back()->with('status', 'Inschrijvingen gestart.');
    }

    public function register(Stage $stage, Member $member): RedirectResponse
    {
        $pivot = $stage->members()->where('members.id', $member->id)->first()?->pivot;

        if (! $pivot) {
            return back()->with('status', 'Dit lid staat niet op de lijst.');
        }

        if ($pivot->invitation_status !== InvitationStatus::Accepted->value) {
            return back()->with('status', 'Dit lid heeft de uitnodiging nog niet geaccepteerd.');
        }

        DB::table('member_stage')
            ->where('id', $pivot->id)
            ->update(['registration_status' => 'registered']);

        $notified = $this->notifyMemberUsers($member, new StageRegistrationNotification($stage, $member, true));
        if (! $notified) {
            $email = $this->resolveEmail($member, $stage);
            if ($email) {
                Mail::to($email)->send(new StageRegistrationMail($stage, $member, true));
            }
        }

        return back()->with('status', $member->fullName().' is ingeschreven.');
    }

    public function unregister(Stage $stage, Member $member): RedirectResponse
    {
        $pivot = $stage->members()->where('members.id', $member->id)->first()?->pivot;

        if (! $pivot || $pivot->registration_status !== 'registered') {
            return back()->with('status', 'Dit lid is niet ingeschreven.');
        }

        DB::table('member_stage')
            ->where('id', $pivot->id)
            ->update(['registration_status' => 'unregistered']);

        $notified = $this->notifyMemberUsers($member, new StageRegistrationNotification($stage, $member, false));
        if (! $notified) {
            $email = $this->resolveEmail($member, $stage);
            if ($email) {
                Mail::to($email)->send(new StageRegistrationMail($stage, $member, false));
            }
        }

        return back()->with('status', $member->fullName().' is uitgeschreven.');
    }

    public function closeRegistrations(Request $request, Stage $stage): RedirectResponse
    {
        $accepted = $stage->members()
            ->wherePivot('invitation_status', InvitationStatus::Accepted->value)
            ->get();

        $allRegistered = $accepted->every(fn (Member $m) => $m->pivot->registration_status === 'registered');

        if (! $allRegistered && ! $request->boolean('confirmed')) {
            return back()->with('status', 'NOT_ALL_REGISTERED');
        }

        $stage->update(['status' => StageStatus::RegistrationsClosed]);

        return back()->with('status', 'Inschrijvingen voltooid.');
    }

    public function revertStatus(Stage $stage): RedirectResponse
    {
        $previous = $stage->status->previous();

        if (! $previous) {
            return back()->with('status', 'Deze stage staat al op de eerste status.');
        }

        $user = request()->user();
        $isAdmin = $user->isAdmin();

        $adminOnlyReverts = [
            StageStatus::RegistrationsOpen,
            StageStatus::RegistrationsClosed,
            StageStatus::Archived,
        ];

        if (in_array($stage->status, $adminOnlyReverts, true) && ! $isAdmin) {
            return back()->with('status', 'Alleen een beheerder mag deze status terugzetten.');
        }

        $stage->update(['status' => $previous]);

        return back()->with('status', 'Status teruggezet naar: '.$previous->label().'.');
    }

    private function notifyCoaches(Stage $stage): void
    {
        $coaches = $stage->coaches()->with('users')->get();

        if ($coaches->isEmpty()) {
            return;
        }

        $participants = $stage->members()->with('weightCategory')->get()->map(fn (Member $m) => [
            'name' => $m->fullName(),
            'date_of_birth' => $m->date_of_birth->format('d/m/Y'),
            'age_category' => $m->calculateAgeCategory($stage->country_code, $stage->start_date)?->name,
            'weight_category' => $m->weightCategory?->name,
            'invitation_status' => InvitationStatus::tryFrom($m->pivot->invitation_status)?->label() ?? $m->pivot->invitation_status,
        ]);

        $notification = new TrainerStageNotification($stage, $participants);

        foreach ($coaches as $coach) {
            $user = $coach->users->first();

            if ($user) {
                $user->notify($notification);
            } else {
                $email = $coach->email;
                if ($email) {
                    Mail::to($email)->send(new StageTrainerMail($stage, $participants));
                }
            }
        }
    }

    private function sendInvitation(Stage $stage, Member $member, $pivot): void
    {
        $paymentUrl = null;
        $entryFee = null;
        $ageCategory = $member->calculateAgeCategory($stage->country_code, $stage->start_date);

        if ($ageCategory) {
            $fee = $stage->feeForAgeCategory($ageCategory);
            if ($fee && $fee > 0) {
                $entryFee = $fee;
                $club = ClubSettings::current();
                $description = collect([$club->name, $stage->name, $member->fullName()])->filter()->implode(' — ');

                app(MolliePaymentService::class)->createStagePaymentLink(
                    $pivot->id,
                    $fee,
                    $description,
                    url("/stages/rsvp/{$pivot->invitation_token}/accept"),
                );

                $pivot = DB::table('member_stage')->where('id', $pivot->id)->first();
                $paymentUrl = $pivot->mollie_payment_url;
            }
        }

        $notification = new StageInvitationNotification($stage, $member, $pivot->invitation_token, $paymentUrl, $entryFee);
        $notified = $this->notifyMemberUsers($member, $notification);

        if (! $notified) {
            $email = $this->resolveEmail($member, $stage);
            if ($email) {
                Mail::to($email)->send(new StageInvitation($stage, $member, $pivot->invitation_token, $paymentUrl, $entryFee));
            }
        }

        DB::table('member_stage')
            ->where('id', $pivot->id)
            ->update([
                'invitation_status' => InvitationStatus::Invited->value,
                'invited_at' => now(),
            ]);
    }

    private function resolveEmail(Member $member, Stage $stage): ?string
    {
        return $member->resolveEmail($stage->start_date);
    }

    private function notifyMemberUsers(Member $member, $notification): bool
    {
        $member->loadMissing('users', 'guardians.user');

        $users = $member->users;

        if ($users->isEmpty()) {
            $users = $member->guardians
                ->filter(fn ($g) => $g->user_id !== null)
                ->map(fn ($g) => $g->user)
                ->filter();
        }

        if ($users->isEmpty()) {
            return false;
        }

        foreach ($users as $user) {
            $user->notify($notification);
        }

        return true;
    }

    public function addCoach(Request $request, Stage $stage): RedirectResponse
    {
        $validated = $request->validate([
            'member_id' => ['required', 'integer', 'exists:members,id'],
        ]);

        if ($stage->coaches()->where('members.id', $validated['member_id'])->exists()) {
            return back()->with('status', 'Deze trainer is al toegevoegd.');
        }

        $member = Member::findOrFail($validated['member_id']);
        $stage->coaches()->attach($member->id);

        return back()->with('status', $member->fullName().' is toegevoegd als trainer.');
    }

    public function removeCoach(Stage $stage, Member $member): RedirectResponse
    {
        $stage->coaches()->detach($member->id);

        return back()->with('status', $member->fullName().' is verwijderd als trainer.');
    }

    public function adminAccept(Stage $stage, Member $member): RedirectResponse
    {
        $pivot = $stage->members()->where('members.id', $member->id)->first()?->pivot;

        if (! $pivot) {
            return back()->with('status', 'Dit lid staat niet op de lijst.');
        }

        DB::table('member_stage')
            ->where('id', $pivot->id)
            ->update([
                'invitation_status' => InvitationStatus::Accepted->value,
                'responded_at' => now(),
            ]);

        return back()->with('status', $member->fullName().' is geaccepteerd.');
    }

    public function adminDecline(Stage $stage, Member $member): RedirectResponse
    {
        $pivot = $stage->members()->where('members.id', $member->id)->first()?->pivot;

        if (! $pivot) {
            return back()->with('status', 'Dit lid staat niet op de lijst.');
        }

        DB::table('member_stage')
            ->where('id', $pivot->id)
            ->update([
                'invitation_status' => InvitationStatus::Declined->value,
                'responded_at' => now(),
            ]);

        return back()->with('status', $member->fullName().' is afgeslagen.');
    }

    public function markPaid(Stage $stage, Member $member): RedirectResponse
    {
        $pivot = $stage->members()->where('members.id', $member->id)->first()?->pivot;

        if (! $pivot) {
            return back()->with('status', 'Dit lid staat niet op de lijst.');
        }

        DB::table('member_stage')
            ->where('id', $pivot->id)
            ->update([
                'payment_status' => 'paid',
                'invitation_status' => InvitationStatus::Accepted->value,
                'responded_at' => now(),
            ]);

        return back()->with('status', $member->fullName().' is als betaald gemarkeerd.');
    }

    public function checkPaymentStatus(Stage $stage, Member $member, MolliePaymentService $mollieService): RedirectResponse
    {
        $pivot = $stage->members()->where('members.id', $member->id)->first()?->pivot;

        if (! $pivot || ! $pivot->mollie_payment_id) {
            return back()->with('status', 'Geen betaallink gevonden voor dit lid.');
        }

        $status = $mollieService->syncStagePaymentStatus($pivot->id);

        $label = match ($status) {
            'paid' => 'Betaald',
            'expired' => 'Verlopen',
            default => 'In afwachting',
        };

        return back()->with('status', $member->fullName().': '.$label.'.');
    }
}
