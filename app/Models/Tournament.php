<?php

namespace App\Models;

use App\Enums\TournamentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string|null $address_street
 * @property string|null $address_city
 * @property string|null $address_postal_code
 * @property string $country_code
 * @property float|null $latitude
 * @property float|null $longitude
 * @property Carbon $tournament_date
 * @property Carbon|null $invitation_deadline
 * @property Carbon|null $registration_deadline
 * @property TournamentStatus $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Tournament extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'status' => TournamentStatus::class,
            'tournament_date' => 'date',
            'invitation_deadline' => 'date',
            'registration_deadline' => 'date',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
        ];
    }

    public function ageCategories(): BelongsToMany
    {
        return $this->belongsToMany(AgeCategory::class)->withPivot('entry_fee');
    }

    public function isPaid(): bool
    {
        return $this->ageCategories->contains(fn ($cat) => $cat->pivot->entry_fee > 0);
    }

    public function feeForAgeCategory(AgeCategory $category): ?float
    {
        $pivot = $this->ageCategories->firstWhere('id', $category->id)?->pivot;

        return $pivot?->entry_fee;
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(TournamentAttachment::class);
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(Member::class)
            ->withPivot(['id', 'invitation_status', 'registration_status', 'invited_at', 'responded_at', 'invitation_token', 'mollie_payment_id', 'mollie_payment_url', 'payment_status'])
            ->withTimestamps();
    }

    public function coaches(): BelongsToMany
    {
        return $this->belongsToMany(Member::class, 'tournament_coaches')
            ->withTimestamps();
    }

    public function results(): HasMany
    {
        return $this->hasMany(TournamentResult::class);
    }
}
