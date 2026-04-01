<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BarOrderItem extends Model
{
    protected $fillable = [
        'bar_order_id',
        'bar_product_id',
        'quantity',
        'unit_price',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'unit_price' => 'decimal:2',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(BarOrder::class, 'bar_order_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(BarProduct::class, 'bar_product_id');
    }
}
