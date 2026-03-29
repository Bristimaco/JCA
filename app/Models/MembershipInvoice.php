<?php

namespace App\Models;

use App\Enums\InvoiceStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property float $total_amount
 * @property Carbon|null $paid_at
 * @property Carbon|null $due_date
 */
class MembershipInvoice extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'total_amount' => 'decimal:2',
            'status' => InvoiceStatus::class,
            'paid_at' => 'datetime',
            'due_date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function lines(): HasMany
    {
        return $this->hasMany(MembershipInvoiceLine::class, 'invoice_id');
    }

    public function isPaid(): bool
    {
        return $this->status === InvoiceStatus::Paid;
    }

    public function isPending(): bool
    {
        return $this->status === InvoiceStatus::Pending;
    }
}
