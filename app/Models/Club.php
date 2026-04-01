<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $club_number
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Club extends Model
{
    protected $fillable = [
        'name',
        'club_number',
    ];
}
