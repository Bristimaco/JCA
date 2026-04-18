<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DiaryTraining extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'actual_calories' => 'decimal:1',
        ];
    }

    public function scopeForToday(Builder $query): Builder
    {
        return $query->whereDate('date', now());
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function trainingType(): BelongsTo
    {
        return $this->belongsTo(TrainingType::class);
    }
}
