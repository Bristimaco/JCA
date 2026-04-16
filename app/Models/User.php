<?php

namespace App\Models;

use App\Enums\NotificationPreference;
use App\Enums\UserRole;
use App\Mail\PasswordResetMail;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Mail;

/**
 * @property int $id
 * @property string $name
 * @property UserRole|null $role
 * @property string $email
 * @property string|null $phone
 * @property bool $is_active
 * @property bool $results_interest
 * @property NotificationPreference $notification_preference
 * @property array|null $extra_modules
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property Carbon|null $last_active_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'password', 'role', 'phone', 'is_active', 'results_interest', 'notification_preference', 'last_active_at', 'extra_modules'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            'is_active' => 'boolean',
            'results_interest' => 'boolean',
            'notification_preference' => NotificationPreference::class,
            'last_active_at' => 'datetime',
            'extra_modules' => 'array',
        ];
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(Member::class);
    }

    public function foodProducts(): BelongsToMany
    {
        return $this->belongsToMany(FoodProduct::class);
    }

    public function guardedMembers(): HasMany
    {
        return $this->hasMany(Guardian::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin;
    }

    public function isCoach(): bool
    {
        return $this->role === UserRole::Coach;
    }

    public function isBarmedewerker(): bool
    {
        return $this->role === UserRole::Barmedewerker;
    }

    public function hasExtraModule(string $module): bool
    {
        return in_array($module, $this->extra_modules ?? []);
    }

    public function isApproved(): bool
    {
        return $this->role !== null && $this->is_active;
    }

    public function isActive(): bool
    {
        return $this->is_active;
    }

    public function trainedSchedules(): HasMany
    {
        return $this->hasMany(TrainingSchedule::class, 'trainer_id');
    }

    public function membershipInvoices(): HasMany
    {
        return $this->hasMany(MembershipInvoice::class);
    }

    public function pushSubscriptions(): HasMany
    {
        return $this->hasMany(PushSubscription::class);
    }

    public function eventRegistrations(): HasMany
    {
        return $this->hasMany(EventRegistration::class);
    }

    public function loginLogs(): HasMany
    {
        return $this->hasMany(LoginLog::class);
    }

    public function sendPasswordResetNotification($token): void
    {
        $url = url('/wachtwoord-reset/'.$token.'?email='.urlencode($this->email));

        Mail::to($this->email)->send(new PasswordResetMail($this, $url));
    }
}
