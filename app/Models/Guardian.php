<?php

namespace App\Models;

use App\Enums\GuardianRelationship;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $member_id
 * @property int|null $user_id
 * @property string $first_name
 * @property string $last_name
 * @property string|null $email
 * @property string|null $phone
 * @property GuardianRelationship $relationship
 * @property bool $is_primary
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Guardian extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'relationship' => GuardianRelationship::class,
            'is_primary' => 'boolean',
        ];
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function fullName(): string
    {
        return $this->first_name.' '.$this->last_name;
    }
}
