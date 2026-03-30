<?php

namespace App\Http\Controllers;

use App\Enums\InvitationStatus;
use App\Enums\TournamentStatus;
use App\Models\ClubSettings;
use App\Models\Member;
use App\Models\PodiumPhoto;
use App\Models\Tournament;
use App\Models\TournamentResult;
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
            'trainingSchedule.trainer:id,name',
            'attendances.member:id,first_name,last_name',
        ])
            ->where('date', now()->toDateString())
            ->whereNull('closed_at')
            ->whereNotNull('opened_at')
            ->get()
            ->map(fn (TrainingSession $s) => [
                'id' => $s->id,
                'group_name' => $s->trainingSchedule->trainingGroup->name,
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
            'trainingSchedule.trainer:id,name',
            'attendances',
        ]);

        $members = $session->trainingSchedule->trainingGroup->members->map(fn ($m) => [
            'id' => $m->id,
            'name' => $m->fullName(),
            'attending' => $session->attendances->contains('member_id', $m->id),
        ])->sortBy('name')->values()->all();

        return Inertia::render('Attendance/Session', [
            'session' => [
                'id' => $session->id,
                'group_name' => $session->trainingSchedule->trainingGroup->name,
                'day' => $session->trainingSchedule->day,
                'start_time' => $session->trainingSchedule->start_time,
                'end_time' => $session->trainingSchedule->end_time,
                'trainer_name' => $session->trainingSchedule->trainer?->name,
            ],
            'members' => $members,
        ]);
    }

    public function toggle(Request $request, TrainingSession $session, int $memberId): RedirectResponse
    {
        if (! session('kiosk_authenticated')) {
            return redirect()->route('attendance.pin');
        }

        if (! $session->isOpen()) {
            return back()->withErrors(['session' => 'Trainingsmoment is niet meer open.']);
        }

        $existing = TrainingAttendance::where('training_session_id', $session->id)
            ->where('member_id', $memberId)
            ->first();

        if ($existing) {
            $existing->delete();
        } else {
            TrainingAttendance::create([
                'training_session_id' => $session->id,
                'member_id' => $memberId,
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

        return Inertia::render('Attendance/Results', [
            'tournaments' => $tournamentData,
        ]);
    }

    public function logout(Request $request): RedirectResponse
    {
        $settings = ClubSettings::current();

        if (! $settings->attendance_pin || ! hash_equals($settings->attendance_pin, $request->input('pin', ''))) {
            return back()->withErrors(['pin' => 'Ongeldige PIN-code.']);
        }

        session()->forget('kiosk_authenticated');

        return redirect()->route('attendance.pin');
    }
}
