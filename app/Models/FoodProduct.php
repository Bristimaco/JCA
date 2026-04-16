<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * @property int $id
 * @property string $name
 * @property float $calories
 * @property float $protein
 * @property float $carbohydrates
 * @property float $fats
 * @property int|null $created_by
 */
class FoodProduct extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'calories' => 'decimal:1',
            'protein' => 'decimal:1',
            'carbohydrates' => 'decimal:1',
            'fats' => 'decimal:1',
        ];
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('name');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }
}
