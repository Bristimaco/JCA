<?php

namespace App\Models;

use App\Enums\EventStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property string|null $address_street
 * @property string|null $address_city
 * @property string|null $address_postal_code
 * @property Carbon $event_date
 * @property string|null $event_time
 * @property string|null $image_data
 * @property string|null $image_mime
 * @property float $price_adult
 * @property float $price_child
 * @property EventStatus $status
 */
class Event extends Model
{
    protected $guarded = ['id'];

    protected $hidden = ['image_data'];

    protected function casts(): array
    {
        return [
            'status' => EventStatus::class,
            'event_date' => 'date',
            'price_adult' => 'decimal:2',
            'price_child' => 'decimal:2',
        ];
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(EventRegistration::class);
    }

    public function paidRegistrations(): HasMany
    {
        return $this->registrations()->where('payment_status', 'paid');
    }

    public function scopePublished($query)
    {
        return $query->where('status', EventStatus::Published);
    }

    public function scopeNotArchived($query)
    {
        return $query->whereNot('status', EventStatus::Archived);
    }

    public function hasImage(): bool
    {
        return (bool) $this->image_mime;
    }
}
