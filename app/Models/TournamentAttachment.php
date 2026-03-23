<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TournamentAttachment extends Model
{
    protected $guarded = ['id'];

    public function tournament(): BelongsTo
    {
        return $this->belongsTo(Tournament::class);
    }
}
