<?php

namespace App\Models;

use App\Enums\Gender;
use Illuminate\Database\Eloquent\Model;

class WeightCategory extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'gender' => Gender::class,
            'min_weight_kg' => 'decimal:1',
            'max_weight_kg' => 'decimal:1',
            'is_active' => 'boolean',
        ];
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
