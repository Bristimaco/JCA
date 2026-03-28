<?php

namespace App\Console\Commands;

use App\Services\MembershipInvoiceService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class GenerateMembershipInvoices extends Command
{
    protected $signature = 'membership:generate-invoices';

    protected $description = 'Generate membership invoices for members with upcoming renewal dates';

    public function handle(MembershipInvoiceService $service): int
    {
        Log::info('Facturatie gestart.');

        $count = $service->generateInvoicesForDueMembers();

        $this->info("Generated {$count} invoice(s).");
        Log::info("Facturatie voltooid: {$count} factuur/facturen aangemaakt.");

        return self::SUCCESS;
    }
}
