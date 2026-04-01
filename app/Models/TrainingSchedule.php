<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int|null $training_group_id
 * @property string|null $day
 * @property string $start_time
 * @property string|null $end_time
 * @property int|null $trainer_id
 * @property bool $is_extra
 * @property Carbon|null $date
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class TrainingSchedule extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'is_extra' => 'boolean',
            'date' => 'date',
        ];
    }

    public function trainingGroup(): BelongsTo
    {
        return $this->belongsTo(TrainingGroup::class);
    }

    public function trainingGroups(): BelongsToMany
    {
        return $this->belongsToMany(TrainingGroup::class, 'extra_schedule_training_group')->withTimestamps();
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(TrainingSession::class);
    }

    public function trainer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'trainer_id');
    }
}
