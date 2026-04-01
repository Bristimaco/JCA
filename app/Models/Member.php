<?php

namespace App\Models;

use App\Enums\BeltRank;
use App\Enums\Gender;
use App\Enums\MembershipStatus;
use App\Enums\VoucherStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $first_name
 * @property string $last_name
 * @property Carbon $date_of_birth
 * @property string $gender
 * @property string|null $nationality
 * @property string|null $national_member_id
 * @property string|null $license_number
 * @property string|null $email
 * @property string|null $phone
 * @property string|null $address_street
 * @property string|null $address_city
 * @property string|null $address_postal_code
 * @property string $address_country
 * @property string|null $photo_path
 * @property string|null $photo_data
 * @property string|null $medical_notes
 * @property string|null $emergency_contact_name
 * @property string|null $emergency_contact_phone
 * @property MembershipStatus $membership_status
 * @property Carbon|null $membership_start_date
 * @property Carbon|null $membership_end_date
 * @property Carbon $membership_renewal_date
 * @property Carbon|null $membership_fee_reminded_at
 * @property bool $photo_consent
 * @property bool $is_competition
 * @property bool $is_trainer
 * @property int|null $weight_category_id
 * @property int|null $age_category_id
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
class Member extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = ['id'];

    protected $hidden = ['photo_data'];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'gender' => Gender::class,
            'membership_status' => MembershipStatus::class,
            'membership_start_date' => 'date',
            'membership_end_date' => 'date',
            'membership_renewal_date' => 'date',
            'membership_fee_reminded_at' => 'datetime',
            'photo_consent' => 'boolean',
            'is_competition' => 'boolean',
            'is_trainer' => 'boolean',
        ];
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }

    public function guardians(): HasMany
    {
        return $this->hasMany(Guardian::class);
    }

    public function primaryGuardian(): ?Guardian
    {
        return $this->guardians()->where('is_primary', true)->first();
    }

    public function beltHistories(): HasMany
    {
        return $this->hasMany(BeltHistory::class)->orderByDesc('achieved_date');
    }

    public function currentBelt(): ?BeltRank
    {
        return $this->beltHistories()->first()?->belt_rank;
    }

    public function isMinor(?Carbon $referenceDate = null): bool
    {
        $date = $referenceDate ?? Carbon::today();

        return $this->date_of_birth->diffInYears($date) < 18;
    }

    public function age(?Carbon $referenceDate = null): int
    {
        $date = $referenceDate ?? Carbon::today();

        return (int) $this->date_of_birth->diffInYears($date);
    }

    public function fullName(): string
    {
        return $this->first_name.' '.$this->last_name;
    }

    public function isActive(): bool
    {
        return $this->membership_status === MembershipStatus::Active;
    }

    public function weightCategory(): BelongsTo
    {
        return $this->belongsTo(WeightCategory::class);
    }

    public function ageCategory(): BelongsTo
    {
        return $this->belongsTo(AgeCategory::class);
    }

    public function tournamentResults(): HasMany
    {
        return $this->hasMany(TournamentResult::class)->orderByDesc('created_at');
    }

    public function vouchers(): HasMany
    {
        return $this->hasMany(Voucher::class);
    }

    public function activeVoucher(): ?Voucher
    {
        return $this->vouchers()
            ->where('status', VoucherStatus::Active)
            ->where('expires_at', '>=', Carbon::today())
            ->latest()
            ->first();
    }

    public function calculateAgeCategory(string $countryCode = 'BE', ?Carbon $referenceDate = null): ?AgeCategory
    {
        return AgeCategory::forBirthDate($this->date_of_birth, $countryCode, $referenceDate);
    }

    /**
     * Resolve the best email address for this member.
     * Minors: use primary guardian's user email, or guardian email.
     * Adults: use member's own email, or linked user email.
     */
    public function trainingGroups(): BelongsToMany
    {
        return $this->belongsToMany(TrainingGroup::class)->withTimestamps();
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(TrainingAttendance::class);
    }

    public function trainingAbsences()
    {
        return $this->hasMany(TrainingAbsence::class);
    }

    public function resolveEmail(?Carbon $referenceDate = null): ?string
    {
        if ($this->isMinor($referenceDate)) {
            $guardian = $this->primaryGuardian();
            if ($guardian?->user?->email) {
                return $guardian->user->email;
            }
        }

        if ($this->email) {
            return $this->email;
        }

        return $this->users()->first()?->email;
    }
}
