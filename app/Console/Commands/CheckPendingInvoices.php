<?php

namespace App\Console\Commands;

use App\Enums\InvoiceStatus;
use App\Models\MembershipInvoice;
use App\Services\MolliePaymentService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckPendingInvoices extends Command
{
    protected $signature = 'membership:check-pending-invoices';

    protected $description = 'Check Mollie payment status for all pending invoices';

    public function handle(MolliePaymentService $mollieService): int
    {
        $invoices = MembershipInvoice::where('status', InvoiceStatus::Pending)
            ->whereNotNull('mollie_payment_id')
            ->get();

        if ($invoices->isEmpty()) {
            $this->info('Geen openstaande facturen met betaallink gevonden.');

            return self::SUCCESS;
        }

        $updated = 0;

        foreach ($invoices as $invoice) {
            try {
                $newStatus = $mollieService->syncInvoiceStatus($invoice);

                if ($newStatus !== InvoiceStatus::Pending->value) {
                    $updated++;
                    $this->info("Factuur #{$invoice->id}: {$newStatus}");
                }
            } catch (\Throwable $e) {
                Log::error('Factuurstatus ophalen mislukt', [
                    'invoice_id' => $invoice->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->info("{$updated} van {$invoices->count()} facturen bijgewerkt.");

        return self::SUCCESS;
    }
}
