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
 * @property float|null $default_membership_fee
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class ClubSettings extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'attendance_threshold' => 'integer',
        'default_membership_fee' => 'decimal:2',
        'sponsor_frequency_bronze' => 'integer',
        'sponsor_frequency_silver' => 'integer',
        'sponsor_frequency_gold' => 'integer',
        'slide_duration_results' => 'integer',
        'slide_duration_announcements' => 'integer',
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
        if (! $this->hasLogo()) {
            return null;
        }

        return 'data:'.$this->logo_mime_type.';base64,'.$this->logo_data;
    }
}
