<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $event_id
 * @property int $user_id
 * @property int $adult_count
 * @property int $child_count
 * @property float $total_amount
 * @property string|null $mollie_payment_id
 * @property string|null $mollie_payment_url
 * @property string $payment_status
 * @property string $rsvp_token
 * @property Carbon|null $paid_at
 */
class EventRegistration extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'total_amount' => 'decimal:2',
            'paid_at' => 'datetime',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isPaid(): bool
    {
        return $this->payment_status === 'paid';
    }
}
