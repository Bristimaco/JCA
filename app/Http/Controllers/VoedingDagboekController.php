<?php

namespace App\Http\Controllers;

use App\Models\DiaryTraining;
use App\Models\FoodDiaryEntry;
use App\Models\FoodProduct;
use App\Models\Member;
use App\Models\TrainingAbsence;
use App\Models\TrainingCancellation;
use App\Models\TrainingSchedule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VoedingDagboekController extends Controller
{
    public function show(Request $request, Member $member): Response
    {
        $this->authorizeMember($request, $member);

        $entries = $member->foodDiaryEntries()
            ->forToday()
            ->with('foodProduct:id,name,calories,protein,carbohydrates,fats')
            ->get()
            ->map(fn (FoodDiaryEntry $e) => [
                'id' => $e->id,
                'food_product_id' => $e->food_product_id,
                'name' => $e->foodProduct->name,
                'category' => $e->category,
                'grams' => $e->grams,
                'calories' => round((float) $e->grams / 100 * (float) $e->foodProduct->calories, 1),
                'protein' => round((float) $e->grams / 100 * (float) $e->foodProduct->protein, 1),
                'carbohydrates' => round((float) $e->grams / 100 * (float) $e->foodProduct->carbohydrates, 1),
                'fats' => round((float) $e->grams / 100 * (float) $e->foodProduct->fats, 1),
            ]);

        $myProducts = $request->user()->foodProducts()
            ->orderBy('name')
            ->get(['food_products.id', 'name', 'calories', 'protein', 'carbohydrates', 'fats']);

        $catalog = FoodProduct::orderBy('name')
            ->get(['id', 'name', 'calories', 'protein', 'carbohydrates', 'fats']);

        $trainingTypes = $member->trainingTypes()
            ->orderByDesc('is_default')
            ->orderBy('name')
            ->get(['id', 'name', 'is_default', 'surplus_calories', 'surplus_protein', 'surplus_carbohydrates', 'surplus_fats']);

        $this->autoCheckDefaultTraining($member, $trainingTypes);

        $todayTrainings = $member->diaryTrainings()
            ->forToday()
            ->get()
            ->map(fn (DiaryTraining $dt) => [
                'id' => $dt->id,
                'training_type_id' => $dt->training_type_id,
                'actual_calories' => $dt->actual_calories,
            ]);

        return Inertia::render('VoedingDagboek', [
            'member' => [
                'id' => $member->id,
                'name' => $member->fullName(),
                'nutrition_plan' => $member->nutritionPlan,
            ],
            'entries' => $entries,
            'myProducts' => $myProducts,
            'catalog' => $catalog,
            'trainingTypes' => $trainingTypes,
            'todayTrainings' => $todayTrainings,
        ]);
    }

    public function store(Request $request, Member $member): RedirectResponse
    {
        $this->authorizeMember($request, $member);

        $validated = $request->validate([
            'food_product_id' => ['required', 'exists:food_products,id'],
            'category' => ['required', 'in:ontbijt,middagmaal,avondmaal,tussendoortjes'],
            'grams' => ['required', 'numeric', 'min:1', 'max:9999'],
        ]);

        $member->foodDiaryEntries()->create([
            ...$validated,
            'date' => now()->toDateString(),
        ]);

        $product = FoodProduct::find($validated['food_product_id']);

        return back()->with('status', "{$product->name} ({$validated['grams']}g) toegevoegd.");
    }

    public function destroy(Request $request, FoodDiaryEntry $foodDiaryEntry): RedirectResponse
    {
        $this->authorizeMember($request, $foodDiaryEntry->member);

        $name = $foodDiaryEntry->foodProduct->name;
        $foodDiaryEntry->delete();

        return back()->with('status', "{$name} verwijderd.");
    }

    public function addProduct(Request $request, Member $member): RedirectResponse
    {
        $this->authorizeMember($request, $member);

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $request->validate([
            'default_portion' => ['nullable', 'numeric', 'min:1', 'max:9999'],
        ]);

        $portion = $request->input('default_portion', 100);
        $existing = FoodProduct::where('name', $request->input('name'))->first();

        if ($existing) {
            $request->user()->foodProducts()->syncWithoutDetaching([$existing->id => ['default_portion' => $portion]]);

            return back()->with('status', "'{$existing->name}' toegevoegd aan je productenlijst.")
                ->with('added_product_id', $existing->id);
        }

        $request->validate([
            'calories' => ['required', 'numeric', 'min:0', 'max:99999'],
            'protein' => ['required', 'numeric', 'min:0', 'max:99999'],
            'carbohydrates' => ['required', 'numeric', 'min:0', 'max:99999'],
            'fats' => ['required', 'numeric', 'min:0', 'max:99999'],
        ]);

        $product = FoodProduct::create([
            'name' => $request->input('name'),
            'calories' => $request->input('calories'),
            'protein' => $request->input('protein'),
            'carbohydrates' => $request->input('carbohydrates'),
            'fats' => $request->input('fats'),
            'created_by' => $request->user()->id,
        ]);

        $request->user()->foodProducts()->attach($product, ['default_portion' => $portion]);

        return back()->with('status', "'{$product->name}' aangemaakt en toegevoegd aan je productenlijst.")
            ->with('added_product_id', $product->id);
    }

    private function authorizeMember(Request $request, Member $member): void
    {
        if (! $request->user()->members()->where('members.id', $member->id)->exists()) {
            abort(403);
        }
    }

    private function autoCheckDefaultTraining(Member $member, $trainingTypes): void
    {
        $defaultType = $trainingTypes->firstWhere('is_default', true);

        if (! $defaultType) {
            return;
        }

        $today = now()->toDateString();
        $todayDay = ucfirst(now()->locale('nl')->isoFormat('dddd'));
        $groupIds = $member->trainingGroups()->pluck('training_groups.id');

        if ($groupIds->isEmpty()) {
            return;
        }

        $scheduleIds = TrainingSchedule::where(function ($q) use ($groupIds, $todayDay) {
            $q->where('is_extra', false)
                ->whereIn('training_group_id', $groupIds)
                ->where('day', $todayDay);
        })->orWhere(function ($q) use ($groupIds, $today) {
            $q->where('is_extra', true)
                ->whereDate('date', $today)
                ->where(function ($q2) use ($groupIds) {
                    $q2->whereIn('training_group_id', $groupIds)
                        ->orWhereHas('trainingGroups', fn ($q3) => $q3->whereIn('training_groups.id', $groupIds));
                });
        })->pluck('id');

        if ($scheduleIds->isEmpty()) {
            return;
        }

        $cancelledIds = TrainingCancellation::whereIn('training_schedule_id', $scheduleIds)
            ->whereDate('date', $today)
            ->pluck('training_schedule_id');

        $activeScheduleIds = $scheduleIds->diff($cancelledIds);

        if ($activeScheduleIds->isEmpty()) {
            return;
        }

        $absentScheduleIds = TrainingAbsence::where('member_id', $member->id)
            ->whereIn('training_schedule_id', $activeScheduleIds)
            ->whereDate('date', $today)
            ->pluck('training_schedule_id');

        $validScheduleIds = $activeScheduleIds->diff($absentScheduleIds);

        if ($validScheduleIds->isEmpty()) {
            return;
        }

        $alreadyLogged = $member->diaryTrainings()
            ->where('training_type_id', $defaultType->id)
            ->whereDate('date', $today)
            ->exists();

        if ($alreadyLogged) {
            return;
        }

        $dismissed = $member->autoTrainingDismissals()
            ->where('training_type_id', $defaultType->id)
            ->whereDate('date', $today)
            ->exists();

        if ($dismissed) {
            return;
        }

        $member->diaryTrainings()->create([
            'training_type_id' => $defaultType->id,
            'date' => $today,
        ]);
    }
}
