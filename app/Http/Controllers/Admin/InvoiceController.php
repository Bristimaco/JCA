<?php

namespace App\Http\Controllers\Admin;

use App\Enums\InvoiceStatus;
use App\Http\Controllers\Controller;
use App\Models\MembershipInvoice;
use App\Notifications\MembershipPaymentNotification;
use App\Services\MolliePaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Artisan;

class InvoiceController extends Controller
{
    public function generate(): RedirectResponse
    {
        Artisan::call('membership:generate-invoices');

        $output = trim(Artisan::output());

        return back()->with('status', $output ?: 'Facturatie verwerkt.');
    }

    public function retryPayment(MembershipInvoice $invoice, MolliePaymentService $mollieService): RedirectResponse
    {
        if ($invoice->mollie_payment_url) {
            return back()->with('status', 'Deze factuur heeft al een betaallink.');
        }

        $memberNames = $invoice->lines->map(fn($l) => $l->member?->fullName() ?? 'Onbekend')->join(', ');
        $description = "Lidgeld {$invoice->year} — {$memberNames}";

        $mollieService->createPaymentLink($invoice, $description);
        $invoice->refresh();

        if ($invoice->mollie_payment_url) {
            $invoice->load('lines.member', 'lines.trainingGroup');
            $invoice->user->notify(new MembershipPaymentNotification($invoice));

            return back()->with('status', 'Betaallink aangemaakt en melding verstuurd.');
        }

        return back()->with('status', 'Betaallink aanmaken mislukt. Controleer de Mollie API key en logs.');
    }

    public function checkStatus(MembershipInvoice $invoice, MolliePaymentService $mollieService): RedirectResponse
    {
        if (!$invoice->mollie_payment_id) {
            return back()->with('status', 'Deze factuur heeft geen Mollie betaallink.');
        }

        try {
            $newStatus = $mollieService->syncInvoiceStatus($invoice);

            $label = InvoiceStatus::from($newStatus)->label();

            return back()->with('status', "Factuurstatus bijgewerkt: {$label}.");
        } catch (\Throwable $e) {
            return back()->with('status', 'Status ophalen mislukt. Controleer de Mollie API key en logs.');
        }
    }

    public function sendReminder(MembershipInvoice $invoice): RedirectResponse
    {
        if (!$invoice->isPending()) {
            return back()->with('status', 'Alleen openstaande facturen kunnen een herinnering krijgen.');
        }

        if (!$invoice->mollie_payment_url) {
            return back()->with('status', 'Deze factuur heeft nog geen betaallink.');
        }

        $invoice->load('lines.member', 'lines.trainingGroup');
        $invoice->user->notify(new MembershipPaymentNotification($invoice));

        return back()->with('status', "Betalingsherinnering verstuurd naar {$invoice->user->name}.");
    }
}
