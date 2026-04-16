<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $member_id
 * @property float $min_calories
 * @property float $max_calories
 * @property float $min_protein
 * @property float $max_protein
 * @property float $min_carbohydrates
 * @property float $max_carbohydrates
 * @property float $min_fats
 * @property float $max_fats
 */
class NutritionPlan extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'min_calories' => 'decimal:1',
            'max_calories' => 'decimal:1',
            'min_protein' => 'decimal:1',
            'max_protein' => 'decimal:1',
            'min_carbohydrates' => 'decimal:1',
            'max_carbohydrates' => 'decimal:1',
            'min_fats' => 'decimal:1',
            'max_fats' => 'decimal:1',
        ];
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }
}
