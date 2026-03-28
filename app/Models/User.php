<?php

namespace App\Models;

use App\Enums\NotificationPreference;
use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'role', 'phone', 'is_active', 'results_interest', 'notification_preference'])]
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
        ];
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(Member::class);
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

    public function isApproved(): bool
    {
        return $this->role !== null && $this->is_active;
    }

    public function isActive(): bool
    {
        return $this->is_active;
    }

    public function trainedGroups(): HasMany
    {
        return $this->hasMany(TrainingGroup::class, 'trainer_id');
    }

    public function membershipInvoices(): HasMany
    {
        return $this->hasMany(MembershipInvoice::class);
    }
}
