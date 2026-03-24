<?php

namespace App\Http\Controllers\Admin;

use App\Enums\InvitationStatus;
use App\Enums\TournamentStatus;
use App\Http\Controllers\Controller;
use App\Mail\TournamentInvitation;
use App\Mail\TournamentRegistrationNotification;
use App\Models\Member;
use App\Models\Tournament;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class TournamentMembersController extends Controller
{
    /**
     * Bulk-add all eligible competition members to the tournament.
     */
    public function populate(Tournament $tournament): RedirectResponse
    {
        if ($tournament->status !== TournamentStatus::Preparation) {
            return back()->with('status', 'Leden kunnen alleen worden toegevoegd in de voorbereidingsfase.');
        }

        $ageCategoryIds = $tournament->ageCategories()->pluck('age_categories.id');

        if ($ageCategoryIds->isEmpty()) {
            return back()->with('status', 'Voeg eerst leeftijdscategorieën toe aan het toernooi.');
        }

        $existingMemberIds = $tournament->members()->pluck('members.id');

        $eligible = Member::where('is_competition', true)
            ->whereNotIn('id', $existingMemberIds)
            ->get();

        $toAttach = $eligible->filter(function (Member $member) use ($tournament) {
            $category = $member->calculateAgeCategory(
                $tournament->country_code,
                $tournament->tournament_date,
            );

            return $category && $tournament->ageCategories->contains($category->id);
        });

        if ($toAttach->isEmpty()) {
            return back()->with('status', 'Geen nieuwe leden gevonden die aan de criteria voldoen.');
        }

        $rows = $toAttach->mapWithKeys(fn(Member $m) => [
            $m->id => [
                'invitation_status' => InvitationStatus::Pending->value,
                'invitation_token' => Str::random(64),
            ],
        ])->all();

        $tournament->members()->attach($rows);

        return back()->with('status', $toAttach->count() . ' leden toegevoegd aan het toernooi.');
    }

    /**
     * Add a single eligible member to the tournament.
     */
    public function addMember(Request $request, Tournament $tournament): RedirectResponse
    {
        if ($tournament->status !== TournamentStatus::Preparation) {
            return back()->with('status', 'Leden kunnen alleen worden toegevoegd in de voorbereidingsfase.');
        }

        $validated = $request->validate([
            'member_id' => ['required', 'integer', 'exists:members,id'],
        ]);

        if ($tournament->members()->where('members.id', $validated['member_id'])->exists()) {
            return back()->with('status', 'Dit lid staat al op de lijst.');
        }

        $member = Member::findOrFail($validated['member_id']);

        if (!$member->is_competition) {
            return back()->with('status', 'Dit lid is geen competitielid.');
        }

        $category = $member->calculateAgeCategory(
            $tournament->country_code,
            $tournament->tournament_date,
        );

        if (!$category || !$tournament->ageCategories->contains($category->id)) {
            return back()->with('status', 'Dit lid valt niet in een leeftijdscategorie van dit toernooi.');
        }

        $tournament->members()->attach($member->id, [
            'invitation_status' => InvitationStatus::Pending->value,
            'invitation_token' => Str::random(64),
        ]);

        return back()->with('status', $member->fullName() . ' is toegevoegd.');
    }

    /**
     * Remove a member from the tournament.
     */
    public function removeMember(Tournament $tournament, Member $member): RedirectResponse
    {
        if ($tournament->status !== TournamentStatus::Preparation) {
            return back()->with('status', 'Leden kunnen alleen worden verwijderd in de voorbereidingsfase.');
        }

        $tournament->members()->detach($member->id);

        return back()->with('status', $member->fullName() . ' is verwijderd van het toernooi.');
    }

    /**
     * Invite a single member (send email).
     */
    public function invite(Tournament $tournament, Member $member): RedirectResponse
    {
        $pivot = $tournament->members()->where('members.id', $member->id)->first()?->pivot;

        if (!$pivot) {
            return back()->with('status', 'Dit lid staat niet op de lijst.');
        }

        $this->sendInvitation($tournament, $member, $pivot);

        return back()->with('status', 'Uitnodiging verstuurd naar ' . $member->fullName() . '.');
    }

    /**
     * Invite all pending (not-yet-invited) members.
     */
    public function inviteAll(Tournament $tournament): RedirectResponse
    {
        $pendingMembers = $tournament->members()
            ->wherePivot('invitation_status', InvitationStatus::Pending->value)
            ->get();

        if ($pendingMembers->isEmpty()) {
            return back()->with('status', 'Geen leden om uit te nodigen.');
        }

        $count = 0;
        foreach ($pendingMembers as $member) {
            $this->sendInvitation($tournament, $member, $member->pivot);
            $count++;
        }

        return back()->with('status', $count . ' uitnodigingen verstuurd.');
    }

    /**
     * Close the invitation phase → update tournament status.
     */
    public function closeInvitations(Tournament $tournament): RedirectResponse
    {
        $tournament->update(['status' => TournamentStatus::InvitationsSent]);

        return back()->with('status', 'Uitnodigingsfase afgesloten. Status: Uitnodigingen verstuurd.');
    }

    /**
     * Open the registration phase → status to RegistrationsOpen.
     */
    public function openRegistrations(Tournament $tournament): RedirectResponse
    {
        $tournament->update(['status' => TournamentStatus::RegistrationsOpen]);

        return back()->with('status', 'Inschrijvingen gestart.');
    }

    /**
     * Register a member for the tournament (admin confirmed registration on external site).
     */
    public function register(Tournament $tournament, Member $member): RedirectResponse
    {
        $pivot = $tournament->members()->where('members.id', $member->id)->first()?->pivot;

        if (!$pivot) {
            return back()->with('status', 'Dit lid staat niet op de lijst.');
        }

        DB::table('member_tournament')
            ->where('id', $pivot->id)
            ->update(['registration_status' => 'registered']);

        $email = $this->resolveEmail($member, $tournament);
        if ($email) {
            Mail::to($email)->send(new TournamentRegistrationNotification($tournament, $member, true));
        }

        return back()->with('status', $member->fullName() . ' is ingeschreven.');
    }

    /**
     * Unregister a previously registered member.
     */
    public function unregister(Tournament $tournament, Member $member): RedirectResponse
    {
        $pivot = $tournament->members()->where('members.id', $member->id)->first()?->pivot;

        if (!$pivot || $pivot->registration_status !== 'registered') {
            return back()->with('status', 'Dit lid is niet ingeschreven.');
        }

        DB::table('member_tournament')
            ->where('id', $pivot->id)
            ->update(['registration_status' => 'unregistered']);

        $email = $this->resolveEmail($member, $tournament);
        if ($email) {
            Mail::to($email)->send(new TournamentRegistrationNotification($tournament, $member, false));
        }

        return back()->with('status', $member->fullName() . ' is uitgeschreven.');
    }

    /**
     * Close registrations → status to RegistrationsClosed.
     */
    public function closeRegistrations(Request $request, Tournament $tournament): RedirectResponse
    {
        $accepted = $tournament->members()
            ->wherePivot('invitation_status', InvitationStatus::Accepted->value)
            ->get();

        $allRegistered = $accepted->every(fn(Member $m) => $m->pivot->registration_status === 'registered');

        if (!$allRegistered && !$request->boolean('confirmed')) {
            return back()->with('status', 'NOT_ALL_REGISTERED');
        }

        $tournament->update(['status' => TournamentStatus::RegistrationsClosed]);

        return back()->with('status', 'Inschrijvingen voltooid.');
    }

    /**
     * Start the tournament → status to Started.
     */
    public function startTournament(Tournament $tournament): RedirectResponse
    {
        if ($tournament->status !== TournamentStatus::RegistrationsClosed) {
            return back()->with('status', 'Het toernooi kan alleen worden gestart vanuit de status "Inschrijvingen voltooid".');
        }

        $tournament->update(['status' => TournamentStatus::Started]);

        return back()->with('status', 'Toernooi gestart!');
    }

    /**
     * Revert tournament to the previous status.
     */
    public function revertStatus(Tournament $tournament): RedirectResponse
    {
        if (in_array($tournament->status, [TournamentStatus::Started, TournamentStatus::Finished], true)) {
            return back()->with('status', 'Een gestart of afgelopen toernooi kan niet worden teruggezet.');
        }

        $previous = $tournament->status->previous();

        if (!$previous) {
            return back()->with('status', 'Dit toernooi staat al op de eerste status.');
        }

        $tournament->update(['status' => $previous]);

        return back()->with('status', 'Status teruggezet naar: ' . $previous->label() . '.');
    }

    private function sendInvitation(Tournament $tournament, Member $member, $pivot): void
    {
        $email = $this->resolveEmail($member, $tournament);

        if (!$email) {
            return;
        }

        Mail::to($email)->send(new TournamentInvitation($tournament, $member, $pivot->invitation_token));

        DB::table('member_tournament')
            ->where('id', $pivot->id)
            ->update([
                'invitation_status' => InvitationStatus::Invited->value,
                'invited_at' => now(),
            ]);
    }

    /**
     * Resolve the best email address for a member.
     * Minors: use primary guardian's user email, or guardian email.
     * Adults: use member's own email, or linked user email.
     */
    private function resolveEmail(Member $member, Tournament $tournament): ?string
    {
        if ($member->isMinor($tournament->tournament_date)) {
            $guardian = $member->primaryGuardian();
            if ($guardian?->user?->email) {
                return $guardian->user->email;
            }
        }

        if ($member->email) {
            return $member->email;
        }

        return $member->users()->first()?->email;
    }

    public function addCoach(Request $request, Tournament $tournament): RedirectResponse
    {
        $validated = $request->validate([
            'member_id' => ['required', 'integer', 'exists:members,id'],
        ]);

        if ($tournament->coaches()->where('members.id', $validated['member_id'])->exists()) {
            return back()->with('status', 'Deze trainer is al toegevoegd.');
        }

        $member = Member::findOrFail($validated['member_id']);
        $tournament->coaches()->attach($member->id);

        return back()->with('status', $member->fullName() . ' is toegevoegd als trainer.');
    }

    public function removeCoach(Tournament $tournament, Member $member): RedirectResponse
    {
        $tournament->coaches()->detach($member->id);

        return back()->with('status', $member->fullName() . ' is verwijderd als trainer.');
    }
}
