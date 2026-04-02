<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TestModeLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'type',
        'recipient',
        'subject',
        'body',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }
}
