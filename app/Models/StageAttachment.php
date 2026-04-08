<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StageAttachment extends Model
{
    protected $guarded = ['id'];

    public function stage(): BelongsTo
    {
        return $this->belongsTo(Stage::class);
    }
}
