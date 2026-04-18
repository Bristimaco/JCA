<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TrainingType extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
            'surplus_calories' => 'decimal:1',
            'surplus_protein' => 'decimal:1',
            'surplus_carbohydrates' => 'decimal:1',
            'surplus_fats' => 'decimal:1',
        ];
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function diaryTrainings(): HasMany
    {
        return $this->hasMany(DiaryTraining::class);
    }
}
