<?php

namespace App\Models;

use App\Enums\SponsorTier;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Sponsor extends Model
{
    protected $guarded = ['id'];

    protected $hidden = ['logo_data'];

    protected function casts(): array
    {
        return [
            'tier' => SponsorTier::class,
            'contract_start_date' => 'date',
            'contract_end_date' => 'date',
            'is_active' => 'boolean',
        ];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)
            ->where('contract_end_date', '>=', now()->toDateString());
    }

    public function logoDataUri(): ?string
    {
        if (! $this->logo_data) {
            return null;
        }

        return 'data:'.$this->logo_mime.';base64,'.$this->logo_data;
    }

    public function renew(): void
    {
        $this->update([
            'contract_end_date' => $this->contract_end_date->addYear(),
        ]);
    }
}
