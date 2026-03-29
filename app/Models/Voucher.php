<?php

namespace App\Models;

use App\Enums\VoucherStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property int $member_id
 * @property int|null $invoice_id
 * @property string $code
 * @property VoucherStatus $status
 * @property Carbon $expires_at
 * @property Carbon|null $redeemed_at
 * @property int|null $redeemed_by
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Voucher extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'status' => VoucherStatus::class,
            'expires_at' => 'date',
            'redeemed_at' => 'datetime',
        ];
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(MembershipInvoice::class, 'invoice_id');
    }

    public function redeemedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'redeemed_by');
    }

    public function isActive(): bool
    {
        return $this->status === VoucherStatus::Active && !$this->isExpired();
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function redeem(User $user): void
    {
        $this->update([
            'status' => VoucherStatus::Redeemed,
            'redeemed_at' => now(),
            'redeemed_by' => $user->id,
        ]);
    }

    public static function generateCode(): string
    {
        do {
            $code = 'VCH-' . strtoupper(Str::random(6));
        } while (static::where('code', $code)->exists());

        return $code;
    }
}
