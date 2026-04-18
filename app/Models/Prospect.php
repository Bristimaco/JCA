<?php

namespace App\Models;

use App\Enums\ProspectStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Prospect extends Model
{
    protected $guarded = ['id'];

    protected $hidden = ['logo_data'];

    protected function casts(): array
    {
        return [
            'cbe_data' => 'array',
            'cbe_fetched_at' => 'datetime',
            'latitude' => 'float',
            'longitude' => 'float',
            'sponsor_amount' => 'float',
            'sponsor_start_date' => 'date',
            'sponsor_renewal_months' => 'integer',
            'status' => ProspectStatus::class,
        ];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', '!=', ProspectStatus::Gearchiveerd);
    }

    public function scopeActivated(Builder $query): Builder
    {
        return $query->where('status', ProspectStatus::Actief);
    }

    public function scopeInactive(Builder $query): Builder
    {
        return $query->where('status', ProspectStatus::Inactief);
    }

    public function scopeArchived(Builder $query): Builder
    {
        return $query->where('status', ProspectStatus::Gearchiveerd);
    }

    public function logoDataUri(): ?string
    {
        if (! $this->logo_data) {
            return null;
        }

        return 'data:'.$this->logo_mime.';base64,'.$this->logo_data;
    }

    public function notes(): HasMany
    {
        return $this->hasMany(ProspectNote::class);
    }
}
