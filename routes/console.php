<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('membership:send-renewal-reminders')->daily();
Schedule::command('membership:generate-invoices')->daily();
Schedule::command('membership:check-pending-invoices')->hourly();
