<?php

namespace App\Models;

use App\Enums\Gender;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WeightCategory extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'gender' => Gender::class,
            'min_weight_kg' => 'decimal:1',
            'max_weight_kg' => 'decimal:1',
            'display_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function ageCategory(): BelongsTo
    {
        return $this->belongsTo(AgeCategory::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForGender($query, Gender $gender)
    {
        return $query->where('gender', $gender);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order');
    }
}
