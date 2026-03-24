<?php

namespace App\Http\Controllers\Trainer;

use App\Enums\InvitationStatus;
use App\Enums\TournamentStatus;
use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Models\Tournament;
use App\Models\TournamentResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class TrainerTournamentController extends Controller
{
    public function show(Request $request, Tournament $tournament): Response
    {
        $tournament->load(['ageCategories.weightCategories', 'attachments', 'coaches', 'members.weightCategory.ageCategory']);

        // Only show participants who accepted & registered (for live/finished tournaments)
        $isLive = in_array($tournament->status, [TournamentStatus::Started, TournamentStatus::Finished], true);

        $participants = $tournament->members->filter(function (Member $m) use ($isLive) {
            if ($isLive) {
                return $m->pivot->invitation_status === InvitationStatus::Accepted->value
                    && $m->pivot->registration_status === 'registered';
            }

            return $m->pivot->invitation_status === InvitationStatus::Accepted->value;
        });

        // Load existing results for this tournament
        $existingResults = TournamentResult::where('tournament_id', $tournament->id)
            ->get()
            ->keyBy('member_id');

        // Group participants by age category, then by weight category
        $grouped = [];
        foreach ($participants as $member) {
            $ageCategory = $member->calculateAgeCategory($tournament->country_code, $tournament->tournament_date);
            $ageName = $ageCategory?->name ?? 'Onbekend';
            $ageOrder = $ageCategory?->display_order ?? 999;

            $weightCat = $member->weightCategory;
            $weightName = $weightCat
                ? $weightCat->max_weight_kg . 'kg'
                : 'Geen gewichtscategorie';
            $weightOrder = $weightCat?->display_order ?? 999;

            if (!isset($grouped[$ageName])) {
                $grouped[$ageName] = [
                    'name' => $ageName,
                    'order' => $ageOrder,
                    'weights' => [],
                ];
            }

            if (!isset($grouped[$ageName]['weights'][$weightName])) {
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
                'date_of_birth' => $member->date_of_birth->toDateString(),
                'result' => $result?->result,
                'notes' => $result?->notes,
            ];
        }

        // Sort
        usort($grouped, fn($a, $b) => $a['order'] <=> $b['order']);
        foreach ($grouped as &$ageGroup) {
            $weights = array_values($ageGroup['weights']);
            usort($weights, fn($a, $b) => $a['order'] <=> $b['order']);
            $ageGroup['weights'] = $weights;
        }
        unset($ageGroup);

        return Inertia::render('Trainer/TournamentDetail', [
            'tournament' => [
                'id' => $tournament->id,
                'name' => $tournament->name,
                'tournament_date' => $tournament->tournament_date->toDateString(),
                'address_street' => $tournament->address_street,
                'address_postal_code' => $tournament->address_postal_code,
                'address_city' => $tournament->address_city,
                'country_code' => $tournament->country_code,
                'latitude' => $tournament->latitude,
                'longitude' => $tournament->longitude,
                'status' => $tournament->status->value,
                'status_label' => $tournament->status->label(),
                'attachments' => $tournament->attachments->map(fn($a) => [
                    'id' => $a->id,
                    'original_name' => $a->original_name,
                    'url' => asset('storage/' . $a->file_path),
                ])->values()->all(),
                'coaches' => $tournament->coaches->map(fn(Member $m) => [
                    'id' => $m->id,
                    'name' => $m->fullName(),
                ])->values()->all(),
            ],
            'participantGroups' => array_values($grouped),
            'totalParticipants' => $participants->count(),
        ]);
    }

    public function storeResults(Request $request, Tournament $tournament)
    {
        $validated = Validator::make($request->all(), [
            'results' => ['required', 'array'],
            'results.*.member_id' => ['required', 'integer', 'exists:members,id'],
            'results.*.result' => ['required', 'string', 'max:100'],
            'results.*.notes' => ['nullable', 'string', 'max:500'],
        ])->validate();

        // Verify all members belong to the tournament
        $tournamentMemberIds = $tournament->members()->pluck('members.id')->toArray();

        foreach ($validated['results'] as $entry) {
            if (!in_array($entry['member_id'], $tournamentMemberIds)) {
                continue;
            }

            TournamentResult::updateOrCreate(
                [
                    'tournament_id' => $tournament->id,
                    'member_id' => $entry['member_id'],
                ],
                [
                    'result' => $entry['result'],
                    'notes' => $entry['notes'] ?? null,
                    'recorded_by' => $request->user()->id,
                ]
            );
        }

        return redirect()->back()->with('status', 'Resultaten opgeslagen.');
    }
}
