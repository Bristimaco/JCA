<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property int $min_age
 * @property int $max_age
 * @property string $country_code
 * @property string|null $cutoff_date
 * @property int $display_order
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
class AgeCategory extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'min_age' => 'integer',
            'max_age' => 'integer',
            'display_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order');
    }

    public function scopeForCountry($query, string $countryCode)
    {
        return $query->where('country_code', $countryCode);
    }

    public function scopeForAge($query, int $age)
    {
        return $query->where('min_age', '<=', $age)->where('max_age', '>=', $age);
    }

    public function weightCategories(): HasMany
    {
        return $this->hasMany(WeightCategory::class);
    }

    /**
     * Determine the age category for a judoka based on their birth date.
     *
     * Belgium (cutoff_date = null): age the judoka will turn in the current year.
     * Other countries (cutoff_date set, e.g. "07-01"): age on the cutoff date,
     * but only applied after the cutoff date has passed.
     */
    public static function forBirthDate(Carbon $birthDate, string $countryCode = 'BE', ?Carbon $referenceDate = null): ?self
    {
        $referenceDate ??= Carbon::today();

        $categories = static::active()
            ->forCountry($countryCode)
            ->ordered()
            ->get();

        if ($categories->isEmpty()) {
            return null;
        }

        $cutoffDate = $categories->first()->cutoff_date;

        if ($cutoffDate === null) {
            // Year-based system (Belgium): age judoka turns this year
            $age = $referenceDate->year - $birthDate->year;
        } else {
            // Fixed-date system (e.g. France): age on cutoff date
            [$month, $day] = explode('-', $cutoffDate);
            $cutoff = Carbon::create($referenceDate->year, (int) $month, (int) $day);

            if ($referenceDate->lt($cutoff)) {
                // Before cutoff: use previous season's cutoff
                $cutoff = $cutoff->subYear();
            }

            $age = (int) $birthDate->diffInYears($cutoff);
        }

        return $categories->first(fn(self $cat) => $age >= $cat->min_age && $age <= $cat->max_age);
    }
}
