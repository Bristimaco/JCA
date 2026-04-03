<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BarCategory extends Model
{
    protected $fillable = [
        'name',
        'display_order',
    ];

    protected function casts(): array
    {
        return [
            'display_order' => 'integer',
        ];
    }

    public function products(): HasMany
    {
        return $this->hasMany(BarProduct::class);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('display_order')->orderBy('name');
    }
}
