<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property float $price
 * @property bool $is_active
 * @property int $display_order
 * @property bool $needs_refill
 * @property Carbon|null $needs_refill_at
 */
class BarProduct extends Model
{
    protected $fillable = [
        'name',
        'price',
        'is_active',
        'display_order',
        'needs_refill',
        'needs_refill_at',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'is_active' => 'boolean',
            'display_order' => 'integer',
            'needs_refill' => 'boolean',
            'needs_refill_at' => 'datetime',
        ];
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('display_order')->orderBy('name');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeNeedsRefill(Builder $query): Builder
    {
        return $query->where('needs_refill', true);
    }
}
