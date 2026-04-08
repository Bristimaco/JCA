<?php

namespace App\Models;

use App\Enums\StageStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Stage extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'status' => StageStatus::class,
            'start_date' => 'date',
            'end_date' => 'date',
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
        return $this->hasMany(StageAttachment::class);
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(Member::class)
            ->withPivot(['id', 'invitation_status', 'registration_status', 'invited_at', 'responded_at', 'invitation_token', 'mollie_payment_id', 'mollie_payment_url', 'payment_status'])
            ->withTimestamps();
    }

    public function coaches(): BelongsToMany
    {
        return $this->belongsToMany(Member::class, 'stage_coaches')
            ->withTimestamps();
    }
}
