<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $tournament_id
 * @property string $file_path
 * @property string $original_name
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class TournamentAttachment extends Model
{
    protected $guarded = ['id'];

    public function tournament(): BelongsTo
    {
        return $this->belongsTo(Tournament::class);
    }
}
