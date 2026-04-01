<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainingAbsence extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_id',
        'training_schedule_id',
        'date',
        'reason',
    ];

    public function member()
    {
        return $this->belongsTo(Member::class);
    }

    public function trainingSchedule()
    {
        return $this->belongsTo(TrainingSchedule::class);
    }
}
