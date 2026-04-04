<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BankTransaction;
use App\Services\CodaImportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
        ]);

        $accounts = BankTransaction::select('account_number', 'account_name')
            ->distinct()
            ->orderBy('account_number')
            ->get()
            ->map(fn ($a) => [
                'number' => $a->account_number,
                'name' => $a->account_name,
            ]);

        return Inertia::render('Admin/BankTransactions', [
            'transactions' => $transactions,
            'accounts' => $accounts,
            'filters' => [
                'account' => $request->input('account', ''),
                'from' => $request->input('from', ''),
                'to' => $request->input('to', ''),
                'search' => $request->input('search', ''),
            ],
        ]);
    }

    public function import(Request $request, CodaImportService $service): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file'],
        ]);

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

        $now = now();
        foreach ($transactions as &$t) {
            $t['created_at'] = $now;
            $t['updated_at'] = $now;
        }

        BankTransaction::insert($transactions);

        $count = count($transactions);

        return back()->with('status', "{$count} transactie(s) geïmporteerd uit '{$filename}'.");
    }
}
