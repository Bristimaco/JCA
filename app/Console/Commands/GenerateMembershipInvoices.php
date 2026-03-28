<?php

namespace App\Console\Commands;

use App\Services\MembershipInvoiceService;
use Illuminate\Console\Command;

class GenerateMembershipInvoices extends Command
{
    protected $signature = 'membership:generate-invoices';

    protected $description = 'Generate membership invoices for members with upcoming renewal dates';

    public function handle(MembershipInvoiceService $service): int
    {
        $count = $service->generateInvoicesForDueMembers();

        $this->info("Generated {$count} invoice(s).");

        return self::SUCCESS;
    }
}
