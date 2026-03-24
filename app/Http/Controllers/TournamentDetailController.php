<?php

namespace App\Http\Controllers;

use App\Enums\InvitationStatus;
use App\Enums\TournamentStatus;
use App\Models\Member;
use App\Models\Tournament;
use Inertia\Inertia;
use Inertia\Response;

class TournamentDetailController extends Controller
{
    public function __invoke(Tournament $tournament): Response
    {
        $tournament->load(['ageCategories.weightCategories', 'attachments', 'coaches', 'members.weightCategory.ageCategory']);

        // Only show participants who are effectively participating
        $isLive = in_array($tournament->status, [TournamentStatus::Started, TournamentStatus::Finished], true);

        $participants = $tournament->members->filter(function (Member $m) use ($isLive) {
            if ($isLive) {
                return $m->pivot->invitation_status === InvitationStatus::Accepted->value
                    && $m->pivot->registration_status === 'registered';
            }

            return $m->pivot->invitation_status === InvitationStatus::Accepted->value;
        });

        // Group participants by age category, then by weight category
        $grouped = [];
        foreach ($participants as $member) {
            $ageCategory = $member->calculateAgeCategory($tournament->country_code, $tournament->tournament_date);
            $ageName = $ageCategory?->name ?? 'Onbekend';
            $ageOrder = $ageCategory?->display_order ?? 999;

            $weightCat = $member->weightCategory;
            $weightName = $weightCat
                ? $weightCat->max_weight_kg.'kg'
                : 'Geen gewichtscategorie';
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

            $grouped[$ageName]['weights'][$weightName]['members'][] = [
                'id' => $member->id,
                'name' => $member->fullName(),
                'date_of_birth' => $member->date_of_birth->toDateString(),
            ];
        }

        // Sort age categories by display_order, and weight categories within each
        usort($grouped, fn ($a, $b) => $a['order'] <=> $b['order']);
        foreach ($grouped as &$ageGroup) {
            $weights = array_values($ageGroup['weights']);
            usort($weights, fn ($a, $b) => $a['order'] <=> $b['order']);
            $ageGroup['weights'] = $weights;
        }
        unset($ageGroup);

        return Inertia::render('TournamentDetail', [
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
                'attachments' => $tournament->attachments->map(fn ($a) => [
                    'id' => $a->id,
                    'original_name' => $a->original_name,
                    'url' => asset('storage/'.$a->file_path),
                ])->values()->all(),
                'coaches' => $tournament->coaches->map(fn (Member $m) => [
                    'id' => $m->id,
                    'name' => $m->fullName(),
                ])->values()->all(),
            ],
            'participantGroups' => array_values($grouped),
            'totalParticipants' => $participants->count(),
        ]);
    }
}
