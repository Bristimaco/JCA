<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TrainingGroup extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'membership_fee' => 'decimal:2',
            'membership_fee_discount' => 'decimal:2',
        ];
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(Member::class)->withTimestamps();
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(TrainingSchedule::class);
    }
}
