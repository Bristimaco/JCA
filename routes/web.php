<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AgeCategoryController;
use App\Http\Controllers\Admin\ApproveUserController;
use App\Http\Controllers\Admin\CategoryExcelController;
use App\Http\Controllers\Admin\ClubSettingsController;
use App\Http\Controllers\Admin\InvoiceController;
use App\Http\Controllers\Admin\MemberController;
use App\Http\Controllers\Admin\MemberExcelController;
use App\Http\Controllers\Admin\MemberIndexController;
use App\Http\Controllers\Admin\RecalculateAgeCategoriesController;
use App\Http\Controllers\Admin\ToggleUserActiveController;
use App\Http\Controllers\Admin\TournamentController;
use App\Http\Controllers\Admin\TournamentIndexController;
use App\Http\Controllers\Admin\TournamentMembersController;
use App\Http\Controllers\Admin\TrainingGroupController;
use App\Http\Controllers\Admin\TrainingGroupMemberController;
use App\Http\Controllers\Admin\UpdateUserController;
use App\Http\Controllers\Admin\UserMembersController;
use App\Http\Controllers\Admin\WeightCategoryController;
use App\Http\Controllers\ArchivedTournamentsController;
use App\Http\Controllers\AttendanceKioskController;
use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\ClubLogoController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MemberAttendanceController;
use App\Http\Controllers\MemberPhotoController;
use App\Http\Controllers\MollieWebhookController;
use App\Http\Controllers\MyMembersController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\TournamentAttachmentController;
use App\Http\Controllers\TournamentDetailController;
use App\Http\Controllers\TournamentRsvpController;
use App\Http\Controllers\Trainer\TrainerAttendanceController;
use App\Http\Controllers\Trainer\TrainerTournamentController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public RSVP route (no auth required)
Route::get('/tournaments/rsvp/{token}/{response}', TournamentRsvpController::class)->name('tournament.rsvp');

// Public club logo (for favicon/emails)
Route::get('/club-logo', ClubLogoController::class)->name('club.logo');

// Mollie webhook (no auth, CSRF excluded in bootstrap/app.php)
Route::post('/webhooks/mollie', MollieWebhookController::class)->name('webhooks.mollie');

// Attendance kiosk (PIN-protected, no auth)
Route::get('/attendance', [AttendanceKioskController::class, 'pin'])->name('attendance.pin');
Route::post('/attendance/verify', [AttendanceKioskController::class, 'verifyPin'])->name('attendance.verify');
Route::get('/attendance/today', [AttendanceKioskController::class, 'today'])->name('attendance.today');
Route::get('/attendance/session/{session}', [AttendanceKioskController::class, 'session'])->name('attendance.session');
Route::post('/attendance/session/{session}/toggle/{member}', [AttendanceKioskController::class, 'toggle'])->name('attendance.toggle');
Route::post('/attendance/logout', [AttendanceKioskController::class, 'logout'])->name('attendance.logout');

// Guest routes (unauthenticated only)
Route::middleware('guest')->group(function () {
    Route::get('/register', [RegisterController::class, 'create'])->name('register');
    Route::post('/register', [RegisterController::class, 'store']);
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store']);
});

// Authenticated routes (any logged-in user)
Route::middleware('auth')->group(function () {
    Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');

    // Email verification
    Route::get('/email/verify', [EmailVerificationController::class, 'notice'])->name('verification.notice');
    Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
        ->name('verification.verify');
    Route::post('/email/verification-notification', [EmailVerificationController::class, 'resend'])
        ->middleware('throttle:6,1')->name('verification.send');

    // Awaiting approval (verified but no role yet)
    Route::get('/approval/pending', function () {
        if (request()->user()->isApproved()) {
            return redirect('/');
        }

        return Inertia::render('Auth/AwaitingApproval');
    })->middleware('verified')->name('approval.pending');
});

// Protected routes (authenticated + verified + approved)
Route::middleware(['auth', 'verified', 'approved'])->group(function () {
    Route::get('/', DashboardController::class)->name('dashboard');

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::patch('/notifications/preference', [NotificationController::class, 'updatePreference'])->name('notifications.preference');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');

    // My members (for ouder/lid roles)
    Route::get('/mijn-leden', [MyMembersController::class, 'index'])->name('my-members.index');
    Route::patch('/mijn-leden/{member}', [MyMembersController::class, 'update'])->name('my-members.update');

    // Tournament detail (any authenticated user)

    // Member photo
    Route::get('/leden-foto/{member}', MemberPhotoController::class)->name('member-photo');

    // Tournament attachment download
    Route::get('/bijlagen/{attachment}', TournamentAttachmentController::class)->name('attachments.show');
    Route::get('/toernooien/{tournament}', TournamentDetailController::class)->name('tournament.detail');

    // Archived tournaments (any authenticated user)
    Route::get('/archief', ArchivedTournamentsController::class)->name('archived.tournaments');

    // Trainer routes
    Route::middleware('coach')->prefix('trainer')->group(function () {
        Route::get('/toernooien/{tournament}', [TrainerTournamentController::class, 'show'])->name('trainer.tournament.show');
        Route::post('/toernooien/{tournament}/resultaten', [TrainerTournamentController::class, 'storeResults'])->name('trainer.tournament.results');
        Route::post('/toernooien/{tournament}/afsluiten', [TrainerTournamentController::class, 'closeTournament'])->name('trainer.tournament.close');

        // Training group member assignment (trainer)
        Route::put('/training-groups/{trainingGroup}/members', [TrainingGroupMemberController::class, 'update'])->name('trainer.training-groups.members');

        // Trainer attendance management
        Route::post('/sessions/open', [TrainerAttendanceController::class, 'open'])->name('trainer.sessions.open');
        Route::patch('/sessions/{session}/close', [TrainerAttendanceController::class, 'close'])->name('trainer.sessions.close');
    });

    // Personal attendance toggle
    Route::post('/attendance/session/{session}/toggle', [MemberAttendanceController::class, 'toggle'])->name('member.attendance.toggle');

    // Admin routes
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/', AdminDashboardController::class)->name('admin.dashboard');
        Route::patch('/club-settings', [ClubSettingsController::class, 'update'])->name('admin.club-settings.update');
        Route::patch('/users/{user}/approve', ApproveUserController::class)->name('admin.users.approve');
        Route::patch('/users/{user}/toggle-active', ToggleUserActiveController::class)->name('admin.users.toggle-active');
        Route::patch('/users/{user}', UpdateUserController::class)->name('admin.users.update');
        Route::put('/users/{user}/members', [UserMembersController::class, 'update'])->name('admin.users.members');

        // Age categories
        Route::post('/age-categories', [AgeCategoryController::class, 'store'])->name('admin.age-categories.store');
        Route::patch('/age-categories/{ageCategory}', [AgeCategoryController::class, 'update'])->name('admin.age-categories.update');
        Route::delete('/age-categories/{ageCategory}', [AgeCategoryController::class, 'destroy'])->name('admin.age-categories.destroy');
        Route::post('/age-categories/recalculate', RecalculateAgeCategoriesController::class)->name('admin.age-categories.recalculate');

        // Weight categories
        Route::post('/weight-categories', [WeightCategoryController::class, 'store'])->name('admin.weight-categories.store');
        Route::patch('/weight-categories/{weightCategory}', [WeightCategoryController::class, 'update'])->name('admin.weight-categories.update');
        Route::delete('/weight-categories/{weightCategory}', [WeightCategoryController::class, 'destroy'])->name('admin.weight-categories.destroy');

        // Training groups
        Route::post('/training-groups', [TrainingGroupController::class, 'store'])->name('admin.training-groups.store');
        Route::patch('/training-groups/{trainingGroup}', [TrainingGroupController::class, 'update'])->name('admin.training-groups.update');
        Route::delete('/training-groups/{trainingGroup}', [TrainingGroupController::class, 'destroy'])->name('admin.training-groups.destroy');
        Route::put('/training-groups/{trainingGroup}/members', [TrainingGroupMemberController::class, 'update'])->name('admin.training-groups.members');

        // Members
        Route::get('/members', MemberIndexController::class)->name('admin.members.index');
        Route::post('/members', [MemberController::class, 'store'])->name('admin.members.store');
        Route::patch('/members/{member}', [MemberController::class, 'update'])->name('admin.members.update');
        Route::post('/members/{member}/mark-paid', [MemberController::class, 'markAsPaid'])->name('admin.members.mark-paid');
        Route::post('/members/send-renewal-reminders', [MemberController::class, 'sendRenewalReminders'])->name('admin.members.send-renewal-reminders');

        // Invoices
        Route::post('/invoices/generate', [InvoiceController::class, 'generate'])->name('admin.invoices.generate');
        Route::post('/invoices/{invoice}/retry-payment', [InvoiceController::class, 'retryPayment'])->name('admin.invoices.retry-payment');
        Route::delete('/members/{member}', [MemberController::class, 'destroy'])->name('admin.members.destroy');

        // Excel import/export leden
        Route::get('/members/export', [MemberExcelController::class, 'export'])->name('admin.members.export');
        Route::post('/members/import', [MemberExcelController::class, 'import'])->name('admin.members.import');

        // Excel import/export categorieën
        Route::get('/age-categories/export', [CategoryExcelController::class, 'exportAgeCategories'])->name('admin.age-categories.export');
        Route::post('/age-categories/import', [CategoryExcelController::class, 'importAgeCategories'])->name('admin.age-categories.import');
        Route::get('/weight-categories/export', [CategoryExcelController::class, 'exportWeightCategories'])->name('admin.weight-categories.export');
        Route::post('/weight-categories/import', [CategoryExcelController::class, 'importWeightCategories'])->name('admin.weight-categories.import');

        // Tournaments
        Route::post('/tournaments', [TournamentController::class, 'store'])->name('admin.tournaments.store');
        Route::delete('/tournaments/{tournament}', [TournamentController::class, 'destroy'])->name('admin.tournaments.destroy');

        // Tournament registrations (admin-only)
        Route::post('/tournaments/{tournament}/open-registrations', [TournamentMembersController::class, 'openRegistrations'])->name('admin.tournaments.open-registrations');
        Route::post('/tournaments/{tournament}/register/{member}', [TournamentMembersController::class, 'register'])->name('admin.tournaments.register');
        Route::post('/tournaments/{tournament}/unregister/{member}', [TournamentMembersController::class, 'unregister'])->name('admin.tournaments.unregister');
        Route::post('/tournaments/{tournament}/close-registrations', [TournamentMembersController::class, 'closeRegistrations'])->name('admin.tournaments.close-registrations');
        Route::post('/tournaments/{tournament}/archive', [TournamentController::class, 'archive'])->name('admin.tournaments.archive');

        // Tournament coaches (admin-only)
        Route::post('/tournaments/{tournament}/coaches', [TournamentMembersController::class, 'addCoach'])->name('admin.tournaments.add-coach');
        Route::delete('/tournaments/{tournament}/coaches/{member}', [TournamentMembersController::class, 'removeCoach'])->name('admin.tournaments.remove-coach');
    });

    // Tournament routes (shared: admin + coach)
    Route::middleware('coach')->prefix('admin')->group(function () {
        Route::get('/tournaments', TournamentIndexController::class)->name('admin.tournaments.index');
        Route::post('/tournaments/{tournament}', [TournamentController::class, 'update'])->name('admin.tournaments.update');

        // Member list management (coach-only, enforced in controller)
        Route::post('/tournaments/{tournament}/populate', [TournamentMembersController::class, 'populate'])->name('admin.tournaments.populate');
        Route::post('/tournaments/{tournament}/members', [TournamentMembersController::class, 'addMember'])->name('admin.tournaments.add-member');
        Route::delete('/tournaments/{tournament}/members/{member}', [TournamentMembersController::class, 'removeMember'])->name('admin.tournaments.remove-member');

        // Invitations (both admin + coach)
        Route::post('/tournaments/{tournament}/invite-all', [TournamentMembersController::class, 'inviteAll'])->name('admin.tournaments.invite-all');
        Route::post('/tournaments/{tournament}/invite/{member}', [TournamentMembersController::class, 'invite'])->name('admin.tournaments.invite');
        Route::post('/tournaments/{tournament}/close-invitations', [TournamentMembersController::class, 'closeInvitations'])->name('admin.tournaments.close-invitations');
        Route::post('/tournaments/{tournament}/revert-status', [TournamentMembersController::class, 'revertStatus'])->name('admin.tournaments.revert-status');

        // RSVP management (both admin + coach)
        Route::post('/tournaments/{tournament}/accept/{member}', [TournamentMembersController::class, 'adminAccept'])->name('admin.tournaments.accept');
        Route::post('/tournaments/{tournament}/decline/{member}', [TournamentMembersController::class, 'adminDecline'])->name('admin.tournaments.decline');

        // Start tournament (coach-only, enforced in controller)
        Route::post('/tournaments/{tournament}/start', [TournamentMembersController::class, 'startTournament'])->name('admin.tournaments.start');
    });
});
