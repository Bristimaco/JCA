<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TrainingAbsence extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'date' => 'date',
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
