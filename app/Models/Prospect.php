<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Prospect extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'cbe_data' => 'array',
            'cbe_fetched_at' => 'datetime',
        ];
    }

    public function notes(): HasMany
    {
        return $this->hasMany(ProspectNote::class);
    }
}
