<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $endpoint
 * @property string $p256dh_key
 * @property string $auth_key
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class PushSubscription extends Model
{
    protected $guarded = ['id'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
