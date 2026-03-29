<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string|null $address_street
 * @property string|null $address_city
 * @property string|null $address_postal_code
 * @property string|null $logo_data
 * @property string|null $logo_mime_type
 * @property int $attendance_threshold
 * @property string|null $attendance_pin
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class ClubSettings extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'attendance_threshold' => 'integer',
    ];

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
        if (!$this->hasLogo()) {
            return null;
        }

        return 'data:' . $this->logo_mime_type . ';base64,' . $this->logo_data;
    }
}
