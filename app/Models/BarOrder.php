<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BarOrder extends Model
{
    protected $fillable = [
        'total',
        'status',
        'user_id',
        'ordered_by_user_id',
        'mollie_payment_id',
        'mollie_payment_url',
        'payment_method',
        'payment_status',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'total' => 'decimal:2',
            'paid_at' => 'datetime',
        ];
    }

    public function isPaid(): bool
    {
        return $this->payment_status === 'paid';
    }

    public function isPoef(): bool
    {
        return $this->status === 'poef';
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function orderedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ordered_by_user_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(BarOrderItem::class);
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'pending');
    }

    public function scopePoef(Builder $query): Builder
    {
        return $query->where('status', 'poef');
    }

    public function scopeUnpaidPoef(Builder $query): Builder
    {
        return $query->where('status', 'poef')->whereNull('paid_at');
    }
}
