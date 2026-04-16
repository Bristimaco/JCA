<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FoodDiaryEntry extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'grams' => 'decimal:1',
        ];
    }

    public function scopeForToday(Builder $query): Builder
    {
        return $query->where('date', now()->toDateString());
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function foodProduct(): BelongsTo
    {
        return $this->belongsTo(FoodProduct::class);
    }
}
