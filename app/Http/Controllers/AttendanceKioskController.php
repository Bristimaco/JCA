<?php

namespace App\Http\Controllers;

use App\Models\ClubSettings;
use App\Models\TrainingAttendance;
use App\Models\TrainingSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceKioskController extends Controller
{
    public function pin(): Response
    {
        if (session('kiosk_authenticated')) {
            return Inertia::render('Attendance/Today');
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

        return redirect()->route('attendance.today');
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
