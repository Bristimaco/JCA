<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property float $membership_fee
 * @property float $membership_fee_discount
 * @property string|null $location
 * @property bool $allow_external_members
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class TrainingGroup extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'membership_fee' => 'decimal:2',
            'membership_fee_discount' => 'decimal:2',
        ];
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(Member::class)->withTimestamps();
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(TrainingSchedule::class);
    }
}
