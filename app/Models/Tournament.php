<?php

namespace App\Models;

use App\Enums\TournamentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
        return $this->belongsToMany(AgeCategory::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(TournamentAttachment::class);
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(Member::class)
            ->withPivot(['id', 'invitation_status', 'registration_status', 'invited_at', 'responded_at', 'invitation_token'])
            ->withTimestamps();
    }

    public function coaches(): BelongsToMany
    {
        return $this->belongsToMany(Member::class, 'tournament_coaches')
            ->withTimestamps();
    }
}
