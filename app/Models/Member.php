<?php

namespace App\Models;

use App\Enums\BeltRank;
use App\Enums\Gender;
use App\Enums\MembershipStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

class Member extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'gender' => Gender::class,
            'membership_status' => MembershipStatus::class,
            'membership_start_date' => 'date',
            'membership_end_date' => 'date',
            'current_weight_kg' => 'decimal:1',
            'photo_consent' => 'boolean',
            'is_competition' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function guardians(): HasMany
    {
        return $this->hasMany(Guardian::class);
    }

    public function primaryGuardian(): ?Guardian
    {
        return $this->guardians()->where('is_primary', true)->first();
    }

    public function beltHistories(): HasMany
    {
        return $this->hasMany(BeltHistory::class)->orderByDesc('achieved_date');
    }

    public function currentBelt(): ?BeltRank
    {
        return $this->beltHistories()->first()?->belt_rank;
    }

    public function isMinor(?Carbon $referenceDate = null): bool
    {
        $date = $referenceDate ?? Carbon::today();

        return $this->date_of_birth->diffInYears($date) < 18;
    }

    public function age(?Carbon $referenceDate = null): int
    {
        $date = $referenceDate ?? Carbon::today();

        return (int) $this->date_of_birth->diffInYears($date);
    }

    public function fullName(): string
    {
        return $this->first_name.' '.$this->last_name;
    }

    public function isActive(): bool
    {
        return $this->membership_status === MembershipStatus::Active;
    }

    public function ageCategory(string $countryCode = 'BE'): ?AgeCategory
    {
        return AgeCategory::forBirthDate($this->date_of_birth, $countryCode);
    }

    public function weightCategory(string $countryCode = 'BE'): ?WeightCategory
    {
        $ageCat = $this->ageCategory($countryCode);

        if (! $ageCat || ! $this->gender) {
            return null;
        }

        return WeightCategory::active()
            ->where('age_category_id', $ageCat->id)
            ->forGender($this->gender)
            ->where('max_weight_kg', '>=', $this->current_weight_kg ?? 0)
            ->ordered()
            ->first();
    }
}
