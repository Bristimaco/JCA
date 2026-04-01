<?php

namespace App\Http\Controllers;

use App\Enums\InvitationStatus;
use App\Enums\TournamentStatus;
use App\Models\Announcement;
use App\Models\Club;
use App\Models\ClubSettings;
use App\Models\ExternalTrainingAttendance;
use App\Models\Member;
use App\Models\PodiumPhoto;
use App\Models\Sponsor;
use App\Models\Tournament;
use App\Models\TournamentResult;
use App\Models\TrainingAbsence;
use App\Models\TrainingAttendance;
use App\Models\TrainingSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceKioskController extends Controller
{
    public function pin(): Response|RedirectResponse
    {
        if (session('kiosk_authenticated')) {
            return redirect()->route('attendance.choose');
        }

        return Inertia::render('Attendance/Pin');
    }

    public function verifyPin(Request $request): RedirectResponse
    {
        $request->validate([
            'pin' => ['required', 'string'],
        ]);

        $settings = ClubSettings::current();

        if (! $settings->attendance_pin || ! hash_equals($settings->attendance_pin, $request->input('pin'))) {
            return back()->withErrors(['pin' => 'Ongeldige PIN-code.']);
        }

        session(['kiosk_authenticated' => true]);

        return redirect()->route('attendance.choose');
    }

    public function choose(): Response|RedirectResponse
    {
        if (! session('kiosk_authenticated')) {
            return redirect()->route('attendance.pin');
        }

        return Inertia::render('Attendance/KioskChoice');
    }

    public function today(): Response|RedirectResponse
    {
        if (! session('kiosk_authenticated')) {
            return redirect()->route('attendance.pin');
        }

        $sessions = TrainingSession::with([
            'trainingSchedule.trainingGroup',
            'trainingSchedule.trainingGroups',
            'trainingSchedule.trainer:id,name',
            'attendances.member:id,first_name,last_name',
        ])
            ->where('date', now()->toDateString())
            ->whereNull('closed_at')
            ->whereNotNull('opened_at')
            ->get()
            ->map(fn (TrainingSession $s) => [
                'id' => $s->id,
                'group_name' => $s->trainingSchedule->is_extra
                    ? $s->trainingSchedule->trainingGroups->pluck('name')->join(', ')
                    : ($s->trainingSchedule->trainingGroup?->name ?? 'Onbekend'),
                'is_extra' => $s->trainingSchedule->is_extra,
                'day' => $s->trainingSchedule->day,
                'start_time' => $s->trainingSchedule->start_time,
                'end_time' => $s->trainingSchedule->end_time,
                'trainer_name' => $s->trainingSchedule->trainer?->name,
                'attendance_count' => $s->attendances->count(),
            ]);

        return Inertia::render('Attendance/Today', ['sessions' => $sessions]);
    }

    public function session(TrainingSession $session): Response|RedirectResponse
    {
        if (! session('kiosk_authenticated')) {
            return redirect()->route('attendance.pin');
        }

        if (! $session->isOpen()) {
            return redirect()->route('attendance.today');
        }

        $session->load([
            'trainingSchedule.trainingGroup.members:id,first_name,last_name',
            'trainingSchedule.trainingGroups.members:id,first_name,last_name',
            'trainingSchedule.trainer:id,name',
            'attendances',
            'externalAttendances.club',
        ]);

        $schedule = $session->trainingSchedule;
        $isExtra = $schedule->is_extra;

        // For extra trainings, members come from the pivot groups
        $groupMembers = $isExtra
            ? $schedule->trainingGroups->flatMap->members->unique('id')
            : ($schedule->trainingGroup?->members ?? collect());

        $groupName = $isExtra
            ? $schedule->trainingGroups->pluck('name')->join(', ')
            : ($schedule->trainingGroup?->name ?? 'Onbekend');

        // Fetch absences for this schedule/date
        $absentMemberIds = TrainingAbsence::where('training_schedule_id', $session->training_schedule_id)
            ->where('date', $session->date->toDateString())
            ->pluck('member_id')
            ->all();

        $members = $groupMembers->map(fn ($m) => [
            'id' => $m->id,
            'name' => $m->fullName(),
            'attending' => $session->attendances->contains('member_id', $m->id),
            'absent' => in_array($m->id, $absentMemberIds),
            'is_external' => false,
        ])->sortBy('name')->values()->all();

        // Add external attendances
        $externalMembers = $session->externalAttendances->map(fn ($ext) => [
            'id' => 'ext_'.$ext->id,
            'name' => $ext->name,
            'belt_color' => $ext->belt_color,
            'club_name' => $ext->club->name,
            'attending' => true,
            'is_external' => true,
        ])->sortBy('name')->values()->all();

        $allMembers = array_merge($members, $externalMembers);

        $clubs = Club::orderBy('name')->get(['id', 'name', 'club_number']);
        $allowExternal = $isExtra
            ? $schedule->trainingGroups->contains('allow_external_members', true)
            : ($schedule->trainingGroup?->allow_external_members ?? false);

        return Inertia::render('Attendance/Session', [
            'session' => [
                'id' => $session->id,
                'group_name' => $groupName,
                'is_extra' => $isExtra,
                'day' => $schedule->day,
                'start_time' => $schedule->start_time,
                'end_time' => $schedule->end_time,
                'trainer_name' => $schedule->trainer?->name,
                'allow_external_members' => $allowExternal,
            ],
            'members' => $allMembers,
            'clubs' => $clubs,
        ]);
    }

    public function toggle(Request $request, TrainingSession $session, $member): RedirectResponse
    {
        if (! session('kiosk_authenticated')) {
            return redirect()->route('attendance.pin');
        }

        if (! $session->isOpen()) {
            return back()->withErrors(['session' => 'Trainingsmoment is niet meer open.']);
        }

        // Handle external member (ID prefixed with 'ext_')
        if (str_starts_with($member, 'ext_')) {
            $extId = (int) str_replace('ext_', '', $member);
            $external = ExternalTrainingAttendance::findOrFail($extId);

            // For external members, we only delete (they're always "checked in")
            // No toggle needed - they stay in attendances
            return back();
        }

        // Regular member toggle
        $isAbsent = TrainingAbsence::where('training_schedule_id', $session->training_schedule_id)
            ->where('date', $session->date->toDateString())
            ->where('member_id', $member)
            ->exists();

        if ($isAbsent) {
            return back()->withErrors(['member' => 'Dit lid heeft zich afwezig gemeld.']);
        }

        $existing = TrainingAttendance::where('training_session_id', $session->id)
            ->where('member_id', $member)
            ->first();

        if ($existing) {
            $existing->delete();
        } else {
            TrainingAttendance::create([
                'training_session_id' => $session->id,
                'member_id' => $member,
                'confirmed_at' => now(),
            ]);
        }

        return back();
    }

    public function results(): Response|RedirectResponse
    {
        if (! session('kiosk_authenticated')) {
            return redirect()->route('attendance.pin');
        }

        $tournaments = Tournament::whereIn('status', [TournamentStatus::Finished, TournamentStatus::Archived])
            ->orderByDesc('tournament_date')
            ->take(5)
            ->get();

        $tournaments->load(['members.weightCategory.ageCategory']);

        $tournamentData = [];

        foreach ($tournaments as $tournament) {
            $participants = $tournament->members->filter(
                fn (Member $m) => $m->pivot->invitation_status === InvitationStatus::Accepted->value
                && $m->pivot->registration_status === 'registered'
            );

            $existingResults = TournamentResult::where('tournament_id', $tournament->id)
                ->get()
                ->keyBy('member_id');

            $grouped = [];
            foreach ($participants as $member) {
                $ageCategory = $member->calculateAgeCategory($tournament->country_code, $tournament->tournament_date);
                $ageName = $ageCategory?->name ?? 'Onbekend';
                $ageOrder = $ageCategory?->display_order ?? 999;

                $weightCat = $member->weightCategory;
                $weightName = $weightCat ? $weightCat->name : 'Geen gewichtscategorie';
                $weightOrder = $weightCat?->display_order ?? 999;

                if (! isset($grouped[$ageName])) {
                    $grouped[$ageName] = [
                        'name' => $ageName,
                        'order' => $ageOrder,
                        'weights' => [],
                    ];
                }

                if (! isset($grouped[$ageName]['weights'][$weightName])) {
                    $grouped[$ageName]['weights'][$weightName] = [
                        'name' => $weightName,
                        'order' => $weightOrder,
                        'members' => [],
                    ];
                }

                $result = $existingResults->get($member->id);

                $grouped[$ageName]['weights'][$weightName]['members'][] = [
                    'id' => $member->id,
                    'name' => $member->fullName(),
                    'result' => $result?->result,
                ];
            }

            $resultRank = ['1e plaats' => 1, '2e plaats' => 2, '3e plaats' => 3, '5e plaats' => 5, '7e plaats' => 7];

            usort($grouped, fn ($a, $b) => $a['order'] <=> $b['order']);
            foreach ($grouped as &$ageGroup) {
                $weights = array_values($ageGroup['weights']);
                usort($weights, fn ($a, $b) => $a['order'] <=> $b['order']);
                foreach ($weights as &$weight) {
                    usort($weight['members'], fn ($a, $b) => ($resultRank[$a['result']] ?? 99) <=> ($resultRank[$b['result']] ?? 99));
                }
                unset($weight);
                $ageGroup['weights'] = $weights;
            }
            unset($ageGroup);

            // Load podium photos as inline data URIs (avoids separate HTTP requests from kiosk)
            $podiumPhotos = PodiumPhoto::where('tournament_id', $tournament->id)
                ->get(['id', 'tournament_id', 'age_category_name', 'weight_category_name', 'photo_data', 'photo_mime'])
                ->mapWithKeys(fn (PodiumPhoto $p) => [
                    $p->age_category_name.'|'.$p->weight_category_name => 'data:'.$p->photo_mime.';base64,'.$p->photo_data,
                ])
                ->all();

            $tournamentData[] = [
                'id' => $tournament->id,
                'name' => $tournament->name,
                'tournament_date' => $tournament->tournament_date->toDateString(),
                'address_city' => $tournament->address_city,
                'country_code' => $tournament->country_code,
                'participantGroups' => array_values($grouped),
                'totalParticipants' => $participants->count(),
                'podiumPhotos' => $podiumPhotos,
            ];
        }

        $activeAnnouncements = Announcement::active()->ordered()->get()
            ->map(fn (Announcement $a) => [
                'id' => $a->id,
                'title' => $a->title,
                'content' => $a->content,
                'start_date' => $a->start_date->toDateString(),
                'end_date' => $a->end_date->toDateString(),
                'photo' => $a->photo_data ? 'data:'.$a->photo_mime.';base64,'.$a->photo_data : null,
            ])
            ->all();

        $settings = ClubSettings::current();

        $activeSponsors = Sponsor::active()->get()
            ->map(fn (Sponsor $s) => [
                'id' => $s->id,
                'name' => $s->name,
                'tier' => $s->tier->value,
                'logo' => $s->logoDataUri(),
            ])
            ->filter(fn ($s) => $s['logo'] !== null)
            ->values()
            ->all();

        return Inertia::render('Attendance/Results', [
            'tournaments' => $tournamentData,
            'announcements' => $activeAnnouncements,
            'sponsors' => $activeSponsors,
            'sponsorFrequencies' => [
                'bronze' => $settings->sponsor_frequency_bronze ?? 60,
                'silver' => $settings->sponsor_frequency_silver ?? 30,
                'gold' => $settings->sponsor_frequency_gold ?? 15,
            ],
            'slideDurations' => [
                'results' => $settings->slide_duration_results ?? 15,
                'announcements' => $settings->slide_duration_announcements ?? 15,
            ],
        ]);
    }

    public function exitToChoice(Request $request): RedirectResponse
    {
        $settings = ClubSettings::current();

        if (! $settings->attendance_pin || ! hash_equals($settings->attendance_pin, $request->input('pin', ''))) {
            return back()->withErrors(['pin' => 'Ongeldige PIN-code.']);
        }

        return redirect()->route('attendance.choose');
    }

    public function logout(Request $request): RedirectResponse
    {
        $settings = ClubSettings::current();

        if (! $settings->attendance_pin || ! hash_equals($settings->attendance_pin, $request->input('pin', ''))) {
            return back()->withErrors(['pin' => 'Ongeldige PIN-code.']);
        }

        session()->forget('kiosk_authenticated');

        return redirect()->route('login');
    }

    public function registerExternalMember(Request $request, TrainingSession $session): RedirectResponse
    {
        if (! session('kiosk_authenticated')) {
            return redirect()->route('attendance.pin');
        }

        if (! $session->isOpen()) {
            return back()->withErrors(['session' => 'Trainingsmoment is niet meer open.']);
        }

        $schedule = $session->trainingSchedule;
        $allowExternal = $schedule->is_extra
            ? $schedule->trainingGroups()->where('allow_external_members', true)->exists()
            : ($schedule->trainingGroup?->allow_external_members ?? false);

        if (! $allowExternal) {
            return back()->withErrors(['external' => 'Externe leden zijn niet toegelaten voor deze groep.']);
        }

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'belt_color' => ['required', 'in:wit,geel,oranje,groen,blauw,bruin,zwart'],
            'club_id' => ['required', 'exists:clubs,id'],
        ]);

        ExternalTrainingAttendance::firstOrCreate([
            'training_session_id' => $session->id,
            'name' => $request->input('name'),
            'club_id' => $request->input('club_id'),
        ], [
            'belt_color' => $request->input('belt_color'),
            'confirmed_at' => now(),
        ]);

        return back();
    }

    public function listClubs(): Response
    {
        $clubs = Club::orderBy('name')->get();

        return response()->json(['clubs' => $clubs]);
    }

    public function createClub(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'club_number' => ['required', 'string', 'unique:clubs'],
        ]);

        $club = Club::create($request->only(['name', 'club_number']));

        return back();
    }
}
