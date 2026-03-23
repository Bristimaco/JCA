<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AgeCategoryController;
use App\Http\Controllers\Admin\ApproveUserController;
use App\Http\Controllers\Admin\MemberController;
use App\Http\Controllers\Admin\MemberIndexController;
use App\Http\Controllers\Admin\RecalculateAgeCategoriesController;
use App\Http\Controllers\Admin\ToggleUserActiveController;
use App\Http\Controllers\Admin\UpdateUserController;
use App\Http\Controllers\Admin\UserMembersController;
use App\Http\Controllers\Admin\WeightCategoryController;
use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MyMembersController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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
        ->middleware('signed')->name('verification.verify');
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

    // My members (for ouder/lid roles)
    Route::get('/mijn-leden', [MyMembersController::class, 'index'])->name('my-members.index');
    Route::patch('/mijn-leden/{member}', [MyMembersController::class, 'update'])->name('my-members.update');

    // Admin routes
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/', AdminDashboardController::class)->name('admin.dashboard');
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

        // Members
        Route::get('/members', MemberIndexController::class)->name('admin.members.index');
        Route::post('/members', [MemberController::class, 'store'])->name('admin.members.store');
        Route::patch('/members/{member}', [MemberController::class, 'update'])->name('admin.members.update');
        Route::delete('/members/{member}', [MemberController::class, 'destroy'])->name('admin.members.destroy');

        // Excel import/export leden
        Route::get('/members/export', [\App\Http\Controllers\Admin\MemberExcelController::class, 'export'])->name('admin.members.export');
        Route::post('/members/import', [\App\Http\Controllers\Admin\MemberExcelController::class, 'import'])->name('admin.members.import');
    });
});
