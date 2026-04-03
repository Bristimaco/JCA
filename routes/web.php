<?php

use App\Http\Controllers\Admin\AdminActivityController;
use App\Http\Controllers\Admin\AdminSessionHistoryController;
use App\Http\Controllers\Admin\AdminTestModeLogController;
use App\Http\Controllers\Admin\AgeCategoryController;
use App\Http\Controllers\Admin\AgeCategoryPageController;
use App\Http\Controllers\Admin\AnnouncementController;
use App\Http\Controllers\Admin\ApproveUserController;
use App\Http\Controllers\Admin\BarCategoryController;
use App\Http\Controllers\Admin\BarProductController;
use App\Http\Controllers\Admin\CategoryExcelController;
use App\Http\Controllers\Admin\ClubSettingsController;
use App\Http\Controllers\Admin\ClubSettingsPageController;
use App\Http\Controllers\Admin\EventController as AdminEventController;
use App\Http\Controllers\Admin\InvoiceController;
use App\Http\Controllers\Admin\MemberController;
use App\Http\Controllers\Admin\MemberExcelController;
use App\Http\Controllers\Admin\MemberIndexController;
use App\Http\Controllers\Admin\ProspectController;
use App\Http\Controllers\Admin\ProspectNoteController;
use App\Http\Controllers\Admin\SponsorController;
use App\Http\Controllers\Admin\ToggleUserActiveController;
use App\Http\Controllers\Admin\TournamentController;
use App\Http\Controllers\Admin\TournamentIndexController;
use App\Http\Controllers\Admin\TournamentMembersController;
use App\Http\Controllers\Admin\TrainingGroupController;
use App\Http\Controllers\Admin\TrainingGroupMemberController;
use App\Http\Controllers\Admin\UpdateUserController;
use App\Http\Controllers\Admin\UserMembersController;
use App\Http\Controllers\Admin\UserPageController;
use App\Http\Controllers\Admin\VoucherController as AdminVoucherController;
use App\Http\Controllers\Admin\WeightCategoryController;
use App\Http\Controllers\Admin\WeightCategoryPageController;
use App\Http\Controllers\ArchivedTournamentsController;
use App\Http\Controllers\AttendanceKioskController;
use App\Http\Controllers\AttendanceReportController;
use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\BarOrderController;
use App\Http\Controllers\BarPaymentController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\ClubLogoController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\EventImageController;
use App\Http\Controllers\EventPaymentWebhookController;
use App\Http\Controllers\EventRsvpController;
use App\Http\Controllers\ExtraTrainingController;
use App\Http\Controllers\MemberAttendanceController;
use App\Http\Controllers\MemberPhotoController;
use App\Http\Controllers\MijnPoefController;
use App\Http\Controllers\MijnToernooienController;
use App\Http\Controllers\MollieWebhookController;
use App\Http\Controllers\MyMembersController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PodiumPhotoController;
use App\Http\Controllers\PoefController;
use App\Http\Controllers\POSController;
use App\Http\Controllers\PushSubscriptionController;
use App\Http\Controllers\TournamentAttachmentController;
use App\Http\Controllers\TournamentDetailController;
use App\Http\Controllers\TournamentPaymentWebhookController;
use App\Http\Controllers\TournamentRsvpController;
use App\Http\Controllers\Trainer\TrainerAttendanceController;
use App\Http\Controllers\Trainer\TrainerTournamentController;
use App\Http\Controllers\Trainer\TrainerTrainingGroupController;
use App\Http\Controllers\TrainingAbsenceController;
use App\Http\Controllers\TrainingCancellationController;
use App\Http\Controllers\VoucherController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public RSVP route (no auth required)
Route::get('/tournaments/rsvp/{token}/{response}', TournamentRsvpController::class)->name('tournament.rsvp');

// Public club logo (for favicon/emails)
Route::get('/club-logo', ClubLogoController::class)->name('club.logo');

// Mollie webhook (no auth, CSRF excluded in bootstrap/app.php)
Route::post('/webhooks/mollie', MollieWebhookController::class)->name('webhooks.mollie');
Route::post('/webhooks/mollie/tournament', TournamentPaymentWebhookController::class)->name('webhooks.mollie.tournament');
Route::post('/webhooks/mollie/event', EventPaymentWebhookController::class)->name('webhooks.mollie.event');
Route::post('/webhooks/mollie/bar', [BarPaymentController::class, 'webhook'])->name('webhooks.mollie.bar');

// Public event image
Route::get('/event-afbeelding/{event}', EventImageController::class)->name('event.image');

// Public event confirmation (token-based, no auth needed)
Route::get('/evenementen/{event}/bevestiging/{token}', [EventRsvpController::class, 'confirmation'])->name('event.confirmation');

// Attendance kiosk (PIN-protected, no auth)
Route::get('/attendance', [AttendanceKioskController::class, 'pin'])->name('attendance.pin');
Route::post('/attendance/verify', [AttendanceKioskController::class, 'verifyPin'])->name('attendance.verify');
Route::get('/attendance/choose', [AttendanceKioskController::class, 'choose'])->name('attendance.choose');
Route::get('/attendance/today', [AttendanceKioskController::class, 'today'])->name('attendance.today');
Route::get('/attendance/results', [AttendanceKioskController::class, 'results'])->name('attendance.results');
Route::get('/attendance/session/{session}', [AttendanceKioskController::class, 'session'])->name('attendance.session');
Route::post('/attendance/session/{session}/toggle/{member}', [AttendanceKioskController::class, 'toggle'])->name('attendance.session.toggle');
Route::post('/attendance/session/{session}/external-member', [AttendanceKioskController::class, 'registerExternalMember'])->name('attendance.register-external');
Route::post('/attendance/exit-to-choice', [AttendanceKioskController::class, 'exitToChoice'])->name('attendance.exit-to-choice');
Route::post('/attendance/logout', [AttendanceKioskController::class, 'logout'])->name('attendance.logout');

// Clubs API
Route::get('/clubs', [AttendanceKioskController::class, 'listClubs'])->name('clubs.index');
Route::post('/clubs', [AttendanceKioskController::class, 'createClub'])->name('clubs.store');

// Podium photo display (no auth — used by kiosk mode)
Route::get('/podium-foto/{podiumPhoto}', PodiumPhotoController::class)->name('podium-photo.show');

// Guest routes (unauthenticated only)
Route::middleware('guest')->group(function () {
    Route::get('/register', [RegisterController::class, 'create'])->name('register');
    Route::post('/register', [RegisterController::class, 'store']);
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store']);
    Route::get('/wachtwoord-vergeten', [PasswordResetController::class, 'create'])->name('password.request');
    Route::post('/wachtwoord-vergeten', [PasswordResetController::class, 'store'])->name('password.email');
    Route::get('/wachtwoord-reset/{token}', [PasswordResetController::class, 'edit'])->name('password.reset');
    Route::post('/wachtwoord-reset', [PasswordResetController::class, 'update'])->name('password.update');
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
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');

    // Push subscriptions
    Route::post('/push-subscriptions', [PushSubscriptionController::class, 'store'])->name('push-subscriptions.store');
    Route::delete('/push-subscriptions', [PushSubscriptionController::class, 'destroy'])->name('push-subscriptions.destroy');

    // My members (for ouder/lid roles)
    Route::get('/mijn-leden', [MyMembersController::class, 'index'])->name('my-members.index');
    Route::patch('/mijn-leden/{member}', [MyMembersController::class, 'update'])->name('my-members.update');

    // Mijn toernooien (any authenticated user with linked members)
    Route::get('/mijn-toernooien', MijnToernooienController::class)->name('mijn-toernooien');

    // Tournament detail (any authenticated user)

    // Member photo
    Route::get('/leden-foto/{member}', MemberPhotoController::class)->name('member-photo');

    // Tournament attachment download
    Route::get('/bijlagen/{attachment}', TournamentAttachmentController::class)->name('attachments.show');

    Route::get('/toernooien/{tournament}', TournamentDetailController::class)->name('tournament.detail');

    // Events (any authenticated user)
    Route::get('/evenementen', [EventController::class, 'index'])->name('events.index');
    Route::get('/evenementen/{event}/inschrijven', [EventRsvpController::class, 'show'])->name('event.register');
    Route::post('/evenementen/{event}/inschrijven', [EventRsvpController::class, 'store'])->name('event.register.store');

    // Archived tournaments (any authenticated user)
    Route::get('/archief', ArchivedTournamentsController::class)->name('archived.tournaments');
    Route::delete('/archief/{tournament}', [ArchivedTournamentsController::class, 'destroy'])->middleware('admin')->name('archived.tournaments.destroy');

    // Calendar
    Route::get('/kalender', CalendarController::class)->name('calendar');

    // Training absence reporting
    Route::post('/training-absences', [TrainingAbsenceController::class, 'store'])->name('training-absences.store');
    Route::delete('/training-absences', [TrainingAbsenceController::class, 'destroy'])->name('training-absences.destroy');

    // Bar ordering (any approved user)
    Route::get('/bestelling', [BarOrderController::class, 'index'])->name('bestelling');
    Route::post('/bestelling', [BarOrderController::class, 'store'])->name('bestelling.store');
    Route::get('/mijn-poef', [MijnPoefController::class, 'index'])->name('mijn-poef');

    // Trainer routes
    Route::middleware('coach:training')->prefix('trainer')->group(function () {
        Route::get('/training-groups', [TrainerTrainingGroupController::class, 'index'])->name('trainer.training-groups.index');
        Route::get('/toernooien/{tournament}', [TrainerTournamentController::class, 'show'])->name('trainer.tournament.show');
        Route::post('/toernooien/{tournament}/resultaten', [TrainerTournamentController::class, 'storeResults'])->name('trainer.tournament.results');
        Route::post('/toernooien/{tournament}/afsluiten', [TrainerTournamentController::class, 'closeTournament'])->name('trainer.tournament.close');
        Route::post('/toernooien/{tournament}/podium-foto', [TrainerTournamentController::class, 'storePodiumPhoto'])->name('trainer.tournament.podium-photo');
        Route::delete('/toernooien/{tournament}/podium-foto', [TrainerTournamentController::class, 'deletePodiumPhoto'])->name('trainer.tournament.podium-photo.delete');

        // Training group member assignment (trainer)
        Route::put('/training-groups/{trainingGroup}/members', [TrainingGroupMemberController::class, 'update'])->name('trainer.training-groups.members');

        // Trainer attendance management
        Route::get('/sessions', [TrainerAttendanceController::class, 'history'])->name('trainer.sessions.history');
        Route::get('/attendance-report', AttendanceReportController::class)->name('trainer.attendance-report');
        Route::post('/sessions/open', [TrainerAttendanceController::class, 'open'])->name('trainer.sessions.open');
        Route::patch('/sessions/{session}/close', [TrainerAttendanceController::class, 'close'])->name('trainer.sessions.close');

        // Extra trainingen
        Route::get('/extra-training', [ExtraTrainingController::class, 'index'])->name('trainer.extra-training.index');
        Route::get('/extra-training/create', [ExtraTrainingController::class, 'create'])->name('trainer.extra-training.create');
        Route::post('/extra-training', [ExtraTrainingController::class, 'store'])->name('trainer.extra-training.store');
        Route::patch('/extra-training/{schedule}', [ExtraTrainingController::class, 'update'])->name('trainer.extra-training.update');
        Route::delete('/extra-training/{schedule}', [ExtraTrainingController::class, 'destroy'])->name('trainer.extra-training.destroy');

        // Training cancellations (uitzonderingen)
        Route::post('/training-cancellations', [TrainingCancellationController::class, 'store'])->name('training-cancellations.store');
        Route::delete('/training-cancellations/{trainingCancellation}', [TrainingCancellationController::class, 'destroy'])->name('training-cancellations.destroy');
    });

    // Personal attendance toggle
    Route::post('/attendance/session/{session}/toggle', [MemberAttendanceController::class, 'toggle'])->name('member.attendance.toggle');

    // Voucher activation page (admin + coach)
    Route::middleware('coach')->group(function () {
        Route::get('/vouchers/activate', [VoucherController::class, 'activate'])->name('vouchers.activate');
    });

    // Voucher lookup/redeem API (admin + coach + barmedewerker)
    Route::post('/vouchers/lookup', [VoucherController::class, 'lookup'])->name('vouchers.lookup');
    Route::post('/vouchers/redeem', [VoucherController::class, 'redeem'])->name('vouchers.redeem');

    // POS (barmedewerker + admin)
    Route::middleware('barmedewerker:bar')->group(function () {
        Route::get('/pos', POSController::class)->name('pos');
        Route::post('/pos/order', [POSController::class, 'store'])->name('pos.order.store');
        Route::post('/pos/products/{barProduct}/toggle-refill', [POSController::class, 'toggleRefill'])->name('pos.toggle-refill');
        Route::post('/pos/payment/qr', [BarPaymentController::class, 'createQr'])->name('pos.payment.qr');
        Route::get('/pos/payment/{paymentId}/status', [BarPaymentController::class, 'checkStatus'])->name('pos.payment.status');

        // Order queue
        Route::get('/pos/bestellingen', [POSController::class, 'orders'])->name('pos.orders');
        Route::get('/bestellingen/pending-count', [BarOrderController::class, 'pendingCount'])->name('orders.pending-count');
        Route::patch('/pos/bestellingen/{barOrder}/preparing', [POSController::class, 'startPreparing'])->name('pos.orders.preparing');
        Route::patch('/pos/bestellingen/{barOrder}/ready', [POSController::class, 'markReady'])->name('pos.orders.ready');
        Route::patch('/pos/bestellingen/{barOrder}/paid', [POSController::class, 'markPaid'])->name('pos.orders.paid');
        Route::patch('/pos/bestellingen/{barOrder}/poef', [POSController::class, 'markPoef'])->name('pos.orders.poef');

        // Poef
        Route::get('/pos/poef', [PoefController::class, 'index'])->name('pos.poef');
        Route::post('/pos/poef/qr', [PoefController::class, 'createQr'])->name('pos.poef.qr');
        Route::post('/pos/poef/betaald', [PoefController::class, 'markPaid'])->name('pos.poef.paid');

        // User search for poef assignment
        Route::get('/pos/users/search', [POSController::class, 'searchUsers'])->name('pos.users.search');
    });

    // Admin routes — Core (admin-only)
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::patch('/club-settings', [ClubSettingsController::class, 'update'])->name('admin.club-settings.update');
        Route::patch('/users/{user}/approve', ApproveUserController::class)->name('admin.users.approve');
        Route::patch('/users/{user}/toggle-active', ToggleUserActiveController::class)->name('admin.users.toggle-active');
        Route::patch('/users/{user}', UpdateUserController::class)->name('admin.users.update');
        Route::put('/users/{user}/members', [UserMembersController::class, 'update'])->name('admin.users.members');
        Route::get('/sessions', AdminSessionHistoryController::class)->name('admin.sessions.history');
        Route::get('/attendance-report', AttendanceReportController::class)->name('admin.attendance-report');

        // Age categories
        Route::post('/age-categories', [AgeCategoryController::class, 'store'])->name('admin.age-categories.store');
        Route::patch('/age-categories/{ageCategory}', [AgeCategoryController::class, 'update'])->name('admin.age-categories.update');
        Route::delete('/age-categories/{ageCategory}', [AgeCategoryController::class, 'destroy'])->name('admin.age-categories.destroy');

        // Weight categories
        Route::post('/weight-categories', [WeightCategoryController::class, 'store'])->name('admin.weight-categories.store');
        Route::patch('/weight-categories/{weightCategory}', [WeightCategoryController::class, 'update'])->name('admin.weight-categories.update');
        Route::delete('/weight-categories/{weightCategory}', [WeightCategoryController::class, 'destroy'])->name('admin.weight-categories.destroy');

        // Excel import/export categorieën
        Route::get('/age-categories/export', [CategoryExcelController::class, 'exportAgeCategories'])->name('admin.age-categories.export');
        Route::post('/age-categories/import', [CategoryExcelController::class, 'importAgeCategories'])->name('admin.age-categories.import');
        Route::get('/weight-categories/export', [CategoryExcelController::class, 'exportWeightCategories'])->name('admin.weight-categories.export');
        Route::post('/weight-categories/import', [CategoryExcelController::class, 'importWeightCategories'])->name('admin.weight-categories.import');
    });

    // Admin routes — Beheer module (admin OR extra_module:admin)
    Route::middleware('admin:admin')->prefix('admin')->group(function () {
        Route::get('/club-instellingen', ClubSettingsPageController::class)->name('admin.club-settings');
        Route::get('/gebruikers', UserPageController::class)->name('admin.users');
        Route::get('/leeftijdscategorieen', AgeCategoryPageController::class)->name('admin.age-categories');
        Route::get('/gewichtscategorieen', WeightCategoryPageController::class)->name('admin.weight-categories');
        Route::get('/activiteit', [AdminActivityController::class, 'index'])->name('admin.activity');
        Route::get('/test-mode-log', [AdminTestModeLogController::class, 'index'])->name('admin.test-mode-log');
        Route::delete('/test-mode-log', [AdminTestModeLogController::class, 'clear'])->name('admin.test-mode-log.clear');
    });

    // Admin routes — Members module (admin OR extra_module:members)
    Route::middleware('admin:members')->prefix('admin')->group(function () {
        Route::get('/members', MemberIndexController::class)->name('admin.members.index');
        Route::post('/members', [MemberController::class, 'store'])->name('admin.members.store');
        Route::patch('/members/{member}', [MemberController::class, 'update'])->name('admin.members.update');
        Route::delete('/members/{member}', [MemberController::class, 'destroy'])->name('admin.members.destroy');
        Route::post('/members/send-renewal-reminders', [MemberController::class, 'sendRenewalReminders'])->name('admin.members.send-renewal-reminders');
        Route::get('/members/export', [MemberExcelController::class, 'export'])->name('admin.members.export');
        Route::post('/members/import', [MemberExcelController::class, 'import'])->name('admin.members.import');

        // Invoices
        Route::get('/facturen', [InvoiceController::class, 'index'])->name('admin.invoices.index');
        Route::post('/invoices/generate', [InvoiceController::class, 'generate'])->name('admin.invoices.generate');
        Route::post('/invoices/{invoice}/retry-payment', [InvoiceController::class, 'retryPayment'])->name('admin.invoices.retry-payment');
        Route::post('/invoices/{invoice}/check-status', [InvoiceController::class, 'checkStatus'])->name('admin.invoices.check-status');
        Route::post('/invoices/{invoice}/send-reminder', [InvoiceController::class, 'sendReminder'])->name('admin.invoices.send-reminder');
        Route::delete('/invoices/{invoice}', [InvoiceController::class, 'destroy'])->name('admin.invoices.destroy');

        // Vouchers
        Route::get('/vouchers', [AdminVoucherController::class, 'index'])->name('admin.vouchers.index');
    });

    // Admin routes — Training module (admin OR extra_module:training)
    Route::middleware('admin:training')->prefix('admin')->group(function () {
        Route::post('/training-groups', [TrainingGroupController::class, 'store'])->name('admin.training-groups.store');
        Route::patch('/training-groups/{trainingGroup}', [TrainingGroupController::class, 'update'])->name('admin.training-groups.update');
        Route::delete('/training-groups/{trainingGroup}', [TrainingGroupController::class, 'destroy'])->name('admin.training-groups.destroy');
        Route::put('/training-groups/{trainingGroup}/members', [TrainingGroupMemberController::class, 'update'])->name('admin.training-groups.members');
        Route::get('/extra-training', [ExtraTrainingController::class, 'index'])->name('admin.extra-training.index');
        Route::get('/extra-training/create', [ExtraTrainingController::class, 'create'])->name('admin.extra-training.create');
        Route::post('/extra-training', [ExtraTrainingController::class, 'store'])->name('admin.extra-training.store');
        Route::patch('/extra-training/{schedule}', [ExtraTrainingController::class, 'update'])->name('admin.extra-training.update');
        Route::delete('/extra-training/{schedule}', [ExtraTrainingController::class, 'destroy'])->name('admin.extra-training.destroy');
    });

    // Admin routes — Tournaments module (admin OR extra_module:tournaments)
    Route::middleware('admin:tournaments')->prefix('admin')->group(function () {
        Route::post('/tournaments', [TournamentController::class, 'store'])->name('admin.tournaments.store');
        Route::delete('/tournaments/{tournament}', [TournamentController::class, 'destroy'])->name('admin.tournaments.destroy');
        Route::post('/tournaments/{tournament}/open-registrations', [TournamentMembersController::class, 'openRegistrations'])->name('admin.tournaments.open-registrations');
        Route::post('/tournaments/{tournament}/register/{member}', [TournamentMembersController::class, 'register'])->name('admin.tournaments.register');
        Route::post('/tournaments/{tournament}/unregister/{member}', [TournamentMembersController::class, 'unregister'])->name('admin.tournaments.unregister');
        Route::post('/tournaments/{tournament}/close-registrations', [TournamentMembersController::class, 'closeRegistrations'])->name('admin.tournaments.close-registrations');
        Route::post('/tournaments/{tournament}/archive', [TournamentController::class, 'archive'])->name('admin.tournaments.archive');
        Route::post('/tournaments/{tournament}/coaches', [TournamentMembersController::class, 'addCoach'])->name('admin.tournaments.add-coach');
        Route::delete('/tournaments/{tournament}/coaches/{member}', [TournamentMembersController::class, 'removeCoach'])->name('admin.tournaments.remove-coach');
    });

    // Admin routes — Announcements module (admin OR extra_module:announcements)
    Route::middleware('admin:announcements')->prefix('admin')->group(function () {
        Route::get('/mededelingen', [AnnouncementController::class, 'index'])->name('admin.announcements.index');
        Route::post('/announcements', [AnnouncementController::class, 'store'])->name('admin.announcements.store');
        Route::patch('/announcements/{announcement}', [AnnouncementController::class, 'update'])->name('admin.announcements.update');
        Route::post('/announcements/{announcement}/archive', [AnnouncementController::class, 'archive'])->name('admin.announcements.archive');
        Route::delete('/announcements/{announcement}', [AnnouncementController::class, 'destroy'])->name('admin.announcements.destroy');
    });

    // Admin routes — Sponsors module (admin OR extra_module:sponsors)
    Route::middleware('admin:sponsors')->prefix('admin')->group(function () {
        Route::get('/sponsors', [SponsorController::class, 'index'])->name('admin.sponsors.index');
        Route::patch('/sponsors/{sponsor}', [SponsorController::class, 'update'])->name('admin.sponsors.update');
        Route::post('/sponsors/{sponsor}/renew', [SponsorController::class, 'renew'])->name('admin.sponsors.renew');
        Route::delete('/sponsors/{sponsor}', [SponsorController::class, 'destroy'])->name('admin.sponsors.destroy');

        // Prospects
        Route::get('/prospectie', [ProspectController::class, 'index'])->name('admin.prospects.index');
        Route::post('/prospectie/lookup', [ProspectController::class, 'lookup'])->name('admin.prospects.lookup');
        Route::post('/prospectie/import', [ProspectController::class, 'import'])->name('admin.prospects.import');
        Route::post('/prospectie', [ProspectController::class, 'store'])->name('admin.prospects.store');
        Route::get('/prospectie/{prospect}', [ProspectController::class, 'show'])->name('admin.prospects.show');
        Route::put('/prospectie/{prospect}', [ProspectController::class, 'update'])->name('admin.prospects.update');
        Route::post('/prospectie/{prospect}/refresh', [ProspectController::class, 'refresh'])->name('admin.prospects.refresh');
        Route::post('/prospectie/{prospect}/archive', [ProspectController::class, 'archive'])->name('admin.prospects.archive');
        Route::post('/prospectie/{prospect}/unarchive', [ProspectController::class, 'unarchive'])->name('admin.prospects.unarchive');
        Route::delete('/prospectie/{prospect}', [ProspectController::class, 'destroy'])->name('admin.prospects.destroy');
        Route::post('/prospectie/{prospect}/convert', [ProspectController::class, 'convertToSponsor'])->name('admin.prospects.convert');
        Route::post('/prospectie/{prospect}/notes', [ProspectNoteController::class, 'store'])->name('admin.prospect-notes.store');
        Route::delete('/prospectie/{prospect}/notes/{note}', [ProspectNoteController::class, 'destroy'])->name('admin.prospect-notes.destroy');
    });

    // Admin routes — Events module (admin OR extra_module:events)
    Route::middleware('admin:events')->prefix('admin')->group(function () {
        Route::get('/evenementen', [AdminEventController::class, 'index'])->name('admin.events.index');
        Route::post('/evenementen', [AdminEventController::class, 'store'])->name('admin.events.store');
        Route::put('/evenementen/{event}', [AdminEventController::class, 'update'])->name('admin.events.update');
        Route::delete('/evenementen/{event}', [AdminEventController::class, 'destroy'])->name('admin.events.destroy');
        Route::post('/evenementen/{event}/publish', [AdminEventController::class, 'publish'])->name('admin.events.publish');
        Route::post('/evenementen/{event}/archive', [AdminEventController::class, 'archive'])->name('admin.events.archive');
        Route::post('/evenementen/{event}/close-registrations', [AdminEventController::class, 'closeRegistrations'])->name('admin.events.close-registrations');
        Route::post('/evenementen/{event}/resend-invitations', [AdminEventController::class, 'resendInvitations'])->name('admin.events.resend-invitations');
        Route::get('/evenementen/{event}/registrations', [AdminEventController::class, 'registrations'])->name('admin.events.registrations');
        Route::post('/evenementen/{event}/registrations/{registration}/mark-paid', [AdminEventController::class, 'markPaid'])->name('admin.events.mark-paid');
    });

    // Admin routes — Bar module (admin OR extra_module:bar)
    Route::middleware('admin:bar')->prefix('admin')->group(function () {
        Route::get('/bar-products', [BarProductController::class, 'index'])->name('admin.bar-products.index');
        Route::get('/aan-te-vullen', [BarProductController::class, 'refillIndex'])->name('admin.refill-products.index');
        Route::get('/verkoop-statistieken', [BarProductController::class, 'salesStats'])->name('admin.sales-stats');
        Route::post('/bar-products', [BarProductController::class, 'store'])->name('admin.bar-products.store');
        Route::patch('/bar-products/{barProduct}', [BarProductController::class, 'update'])->name('admin.bar-products.update');
        Route::delete('/bar-products/{barProduct}', [BarProductController::class, 'destroy'])->name('admin.bar-products.destroy');
        Route::post('/bar-products/{barProduct}/clear-refill', [BarProductController::class, 'clearRefill'])->name('admin.bar-products.clear-refill');

        // Bar categories
        Route::post('/bar-categories', [BarCategoryController::class, 'store'])->name('admin.bar-categories.store');
        Route::patch('/bar-categories/{barCategory}', [BarCategoryController::class, 'update'])->name('admin.bar-categories.update');
        Route::delete('/bar-categories/{barCategory}', [BarCategoryController::class, 'destroy'])->name('admin.bar-categories.destroy');
    });

    // Tournament routes (shared: admin + coach)
    Route::middleware('coach:tournaments')->prefix('admin')->group(function () {
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

        // Payment management (both admin + coach)
        Route::post('/tournaments/{tournament}/mark-paid/{member}', [TournamentMembersController::class, 'markPaid'])->name('admin.tournaments.mark-paid');
        Route::post('/tournaments/{tournament}/check-payment/{member}', [TournamentMembersController::class, 'checkPaymentStatus'])->name('admin.tournaments.check-payment');

        // Start tournament (coach-only, enforced in controller)
        Route::post('/tournaments/{tournament}/start', [TournamentMembersController::class, 'startTournament'])->name('admin.tournaments.start');
    });
});
