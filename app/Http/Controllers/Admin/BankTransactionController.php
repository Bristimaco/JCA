<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BankTransaction;
use App\Models\ClubSettings;
use App\Services\CodaImportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;

class BankTransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $query = BankTransaction::orderByDesc('transaction_date')->orderByDesc('id');

        if ($request->filled('account')) {
            $query->where('account_number', $request->input('account'));
        }

        if ($request->filled('from')) {
            $query->whereDate('transaction_date', '>=', $request->input('from'));
        }

        if ($request->filled('to')) {
            $query->whereDate('transaction_date', '<=', $request->input('to'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('counterparty_name', 'ilike', "%{$search}%")
                    ->orWhere('counterparty_account', 'ilike', "%{$search}%")
                    ->orWhere('message', 'ilike', "%{$search}%")
                    ->orWhere('structured_message', 'ilike', "%{$search}%");
            });
        }

        foreach ([1, 2, 3] as $i) {
            if ($request->filled("dimension_{$i}")) {
                $query->where("dimension_{$i}_value", $request->input("dimension_{$i}"));
            }
        }

        $transactions = $query->get()->map(fn (BankTransaction $t) => [
            'id' => $t->id,
            'account_number' => $t->account_number,
            'account_name' => $t->account_name,
            'transaction_date' => $t->transaction_date->toDateString(),
            'valuta_date' => $t->valuta_date?->toDateString(),
            'amount' => $t->amount,
            'counterparty_name' => $t->counterparty_name,
            'counterparty_account' => $t->counterparty_account,
            'message' => $t->message,
            'structured_message' => $t->structured_message,
            'has_document' => $t->document_data !== null,
            'document_name' => $t->document_name,
            'document_url' => $t->document_data ? route('admin.bank-transactions.document.show', $t).'?v='.$t->updated_at->timestamp : null,
            'dimension_1_value' => $t->dimension_1_value,
            'dimension_2_value' => $t->dimension_2_value,
            'dimension_3_value' => $t->dimension_3_value,
        ]);

        $settings = ClubSettings::first();

        $accounts = collect($settings?->bank_accounts ?? [])->map(fn ($a) => [
            'number' => $a['account_number'],
            'name' => $a['name'],
        ]);

        $dimensions = [];
        foreach ([1, 2, 3] as $i) {
            $dim = $settings?->{"dimension_{$i}"};
            $dimensions[] = $dim && ! empty($dim['name']) ? $dim : null;
        }

        $imports = BankTransaction::selectRaw('coda_filename, count(*) as count, min(transaction_date) as min_date, max(transaction_date) as max_date')
            ->groupBy('coda_filename')
            ->orderByDesc('max_date')
            ->get()
            ->map(fn ($i) => [
                'filename' => $i->coda_filename,
                'count' => $i->count,
                'min_date' => $i->min_date,
                'max_date' => $i->max_date,
            ]);

        return Inertia::render('Admin/BankTransactions', [
            'transactions' => $transactions,
            'accounts' => $accounts,
            'dimensions' => $dimensions,
            'imports' => $imports,
            'filters' => [
                'account' => $request->input('account', ''),
                'from' => $request->input('from', ''),
                'to' => $request->input('to', ''),
                'search' => $request->input('search', ''),
                'dimension_1' => $request->input('dimension_1', ''),
                'dimension_2' => $request->input('dimension_2', ''),
                'dimension_3' => $request->input('dimension_3', ''),
            ],
        ]);
    }

    public function import(Request $request, CodaImportService $service): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file'],
            'account_number' => ['required', 'string', 'max:34'],
        ]);

        $settings = ClubSettings::first();
        $bankAccounts = $settings?->bank_accounts ?? [];

        if (empty($bankAccounts)) {
            return back()->with('error', 'Configureer eerst minstens één bankrekening in de clubinstellingen.');
        }

        $selectedAccount = $request->input('account_number');
        $knownAccounts = array_column($bankAccounts, 'account_number');

        if (! in_array($selectedAccount, $knownAccounts)) {
            return back()->with('error', 'Ongeldige rekening geselecteerd.');
        }

        $file = $request->file('file');
        $filename = $file->getClientOriginalName();

        if (BankTransaction::where('coda_filename', $filename)->exists()) {
            return back()->with('error', "Bestand '{$filename}' is al geïmporteerd.");
        }

        try {
            $transactions = $service->parse($file->getRealPath(), $filename);
        } catch (\Exception $e) {
            return back()->with('error', 'Ongeldig CODA bestand: '.$e->getMessage());
        }

        if (empty($transactions)) {
            return back()->with('error', 'Geen transacties gevonden in het bestand.');
        }

        $codaAccount = $transactions[0]['account_number'] ?? null;
        if ($codaAccount && $codaAccount !== $selectedAccount) {
            return back()->with('error', "Het CODA bestand bevat rekening {$codaAccount}, maar u selecteerde {$selectedAccount}.");
        }

        $now = now();
        foreach ($transactions as &$t) {
            $t['created_at'] = $now;
            $t['updated_at'] = $now;
        }

        BankTransaction::insert($transactions);

        $count = count($transactions);

        return back()->with('status', "{$count} transactie(s) geïmporteerd uit '{$filename}'.");
    }

    public function uploadDocument(Request $request, BankTransaction $bankTransaction): RedirectResponse
    {
        $request->validate([
            'document' => ['required', 'string'],
            'document_name' => ['nullable', 'string', 'max:255'],
        ]);

        $dataUrl = $request->input('document');

        if (! str_contains($dataUrl, ',')) {
            return back()->with('error', 'Ongeldig bestandsformaat.');
        }

        [$meta, $base64] = explode(',', $dataUrl, 2);

        $mime = 'application/octet-stream';
        if (preg_match('/data:([^;]+);/', $meta, $m)) {
            $mime = $m[1];
        }

        $bankTransaction->update([
            'document_data' => $base64,
            'document_mime' => $mime,
            'document_name' => $request->input('document_name', 'bijlage'),
        ]);

        return back()->with('status', 'Bijlage opgeslagen.');
    }

    public function showDocument(BankTransaction $bankTransaction): HttpResponse
    {
        abort_unless($bankTransaction->document_data, 404);

        return response(base64_decode($bankTransaction->document_data, true) ?: '')
            ->header('Content-Type', $bankTransaction->document_mime ?? 'application/octet-stream')
            ->header('Content-Disposition', 'inline; filename="'.$bankTransaction->document_name.'"')
            ->header('Cache-Control', 'no-store');
    }

    public function deleteDocument(BankTransaction $bankTransaction): RedirectResponse
    {
        $bankTransaction->update([
            'document_data' => null,
            'document_mime' => null,
            'document_name' => null,
        ]);

        return back()->with('status', 'Bijlage verwijderd.');
    }

    public function updateDimensions(Request $request, BankTransaction $bankTransaction): RedirectResponse
    {
        $validated = $request->validate([
            'dimension_1_value' => ['nullable', 'string', 'max:255'],
            'dimension_2_value' => ['nullable', 'string', 'max:255'],
            'dimension_3_value' => ['nullable', 'string', 'max:255'],
        ]);

        $bankTransaction->update([
            'dimension_1_value' => $validated['dimension_1_value'] ?? null,
            'dimension_2_value' => $validated['dimension_2_value'] ?? null,
            'dimension_3_value' => $validated['dimension_3_value'] ?? null,
        ]);

        return back();
    }

    public function deleteImport(Request $request): RedirectResponse
    {
        $request->validate([
            'filename' => ['required', 'string', 'max:255'],
        ]);

        $filename = $request->input('filename');
        $count = BankTransaction::where('coda_filename', $filename)->count();

        if ($count === 0) {
            return back()->with('error', 'Geen transacties gevonden voor dit bestand.');
        }

        BankTransaction::where('coda_filename', $filename)->delete();

        return back()->with('status', "{$count} transactie(s) van '{$filename}' verwijderd.");
    }
}
