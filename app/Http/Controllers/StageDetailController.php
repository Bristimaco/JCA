<?php

namespace App\Http\Controllers;

use App\Enums\InvitationStatus;
use App\Models\Member;
use App\Models\Stage;
use Inertia\Inertia;
use Inertia\Response;

class StageDetailController extends Controller
{
    public function __invoke(Stage $stage): Response
    {
        $stage->load(['ageCategories.weightCategories', 'attachments', 'coaches', 'members.weightCategory.ageCategory']);

        $participants = $stage->members->filter(function (Member $m) {
            return $m->pivot->invitation_status === InvitationStatus::Accepted->value;
        });

        $grouped = [];
        foreach ($participants as $member) {
            $ageCategory = $member->calculateAgeCategory($stage->country_code, $stage->start_date);
            $ageName = $ageCategory?->name ?? 'Onbekend';
            $ageOrder = $ageCategory?->display_order ?? 999;

            $weightCat = $member->weightCategory;
            $weightName = $weightCat
                ? $weightCat->name
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

        usort($grouped, fn ($a, $b) => $a['order'] <=> $b['order']);
        foreach ($grouped as &$ageGroup) {
            $weights = array_values($ageGroup['weights']);
            usort($weights, fn ($a, $b) => $a['order'] <=> $b['order']);
            $ageGroup['weights'] = $weights;
        }
        unset($ageGroup);

        return Inertia::render('StageDetail', [
            'stage' => [
                'id' => $stage->id,
                'name' => $stage->name,
                'start_date' => $stage->start_date->toDateString(),
                'end_date' => $stage->end_date->toDateString(),
                'address_street' => $stage->address_street,
                'address_postal_code' => $stage->address_postal_code,
                'address_city' => $stage->address_city,
                'country_code' => $stage->country_code,
                'latitude' => $stage->latitude,
                'longitude' => $stage->longitude,
                'status' => $stage->status->value,
                'status_label' => $stage->status->label(),
                'attachments' => $stage->attachments->map(fn ($a) => [
                    'id' => $a->id,
                    'original_name' => $a->original_name,
                    'mime_type' => $a->mime_type,
                    'url' => route('stage-attachments.show', $a),
                ])->values()->all(),
                'coaches' => $stage->coaches->map(fn (Member $m) => [
                    'id' => $m->id,
                    'name' => $m->fullName(),
                ])->values()->all(),
            ],
            'participantGroups' => array_values($grouped),
            'totalParticipants' => $participants->count(),
        ]);
    }
}
