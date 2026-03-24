<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClubSettings extends Model
{
    protected $guarded = ['id'];

    public static function current(): self
    {
        return self::first() ?? new self(['name' => 'JCA']);
    }

    public function hasLogo(): bool
    {
        return $this->logo_data !== null;
    }

    public function logoDataUri(): ?string
    {
        if (! $this->hasLogo()) {
            return null;
        }

        return 'data:'.$this->logo_mime_type.';base64,'.$this->logo_data;
    }
}
