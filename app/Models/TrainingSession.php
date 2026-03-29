<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $training_schedule_id
 * @property Carbon $date
 * @property Carbon $opened_at
 * @property Carbon|null $closed_at
 * @property string|null $remarks
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class TrainingSession extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'opened_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    public function trainingSchedule(): BelongsTo
    {
        return $this->belongsTo(TrainingSchedule::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(TrainingAttendance::class);
    }

    public function isOpen(): bool
    {
        return $this->opened_at !== null && $this->closed_at === null;
    }
}
