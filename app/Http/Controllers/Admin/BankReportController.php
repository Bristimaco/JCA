<?php

namespace App\Http\Controllers\Admin;

use App\Exports\BankReportExport;
use App\Http\Controllers\Controller;
use App\Models\BankTransaction;
use App\Models\ClubSettings;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class BankReportController extends Controller
{
    public function index(Request $request): Response
    {
        $tab = $request->input('tab', 'account');
        $period = $request->input('period', 'year');
        $dimensionIndex = (int) $request->input('dimension_index', 1);

        [$from, $to] = $this->resolvePeriod($period, $request->input('from'), $request->input('to'));

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

        $groupField = match ($tab) {
            'counterparty' => 'counterparty_account',
            'dimension' => "dimension_{$dimensionIndex}_value",
            default => 'account_number',
        };

        $query = BankTransaction::query();
        if ($from) {
            $query->whereDate('transaction_date', '>=', $from);
        }
        if ($to) {
            $query->whereDate('transaction_date', '<=', $to);
        }

        $raw = $query
            ->selectRaw("{$groupField} as group_key, to_char(transaction_date, 'YYYY-MM') as month, SUM(CASE WHEN amount >= 0 THEN amount ELSE 0 END) as income, SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END) as expense, SUM(amount) as total")
            ->whereNotNull($groupField)
            ->where($groupField, '!=', '')
            ->groupBy('group_key', 'month')
            ->orderBy('group_key')
            ->orderBy('month')
            ->get();

        $monthTotals = BankTransaction::query()
            ->selectRaw("to_char(transaction_date, 'YYYY-MM') as month, SUM(CASE WHEN amount >= 0 THEN amount ELSE 0 END) as income, SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END) as expense, SUM(amount) as total");
        if ($from) {
            $monthTotals->whereDate('transaction_date', '>=', $from);
        }
        if ($to) {
            $monthTotals->whereDate('transaction_date', '<=', $to);
        }
        $chartData = $monthTotals->groupBy('month')->orderBy('month')->get()->map(fn ($m) => [
            'month' => $m->month,
            'income' => round((float) $m->income, 2),
            'expense' => round(abs((float) $m->expense), 2),
        ]);

        $months = $raw->pluck('month')->unique()->sort()->values()->all();

        $grouped = [];
        foreach ($raw as $r) {
            $key = $r->group_key;
            if (! isset($grouped[$key])) {
                $grouped[$key] = ['label' => $key, 'months' => [], 'total_income' => 0, 'total_expense' => 0, 'total' => 0];
            }
            $grouped[$key]['months'][$r->month] = [
                'income' => round((float) $r->income, 2),
                'expense' => round((float) $r->expense, 2),
                'total' => round((float) $r->total, 2),
            ];
            $grouped[$key]['total_income'] += (float) $r->income;
            $grouped[$key]['total_expense'] += (float) $r->expense;
            $grouped[$key]['total'] += (float) $r->total;
        }

        if ($tab === 'counterparty') {
            $names = BankTransaction::select('counterparty_account', 'counterparty_name')
                ->whereIn('counterparty_account', array_keys($grouped))
                ->whereNotNull('counterparty_name')
                ->where('counterparty_name', '!=', '')
                ->groupBy('counterparty_account', 'counterparty_name')
                ->get()
                ->keyBy('counterparty_account');
            foreach ($grouped as $key => &$row) {
                $row['label'] = $names[$key]?->counterparty_name ?? $key;
            }
        } elseif ($tab === 'account') {
            $acctMap = collect($settings?->bank_accounts ?? [])->keyBy(fn ($a) => preg_replace('/\s+/', '', $a['account_number']));
            foreach ($grouped as $key => &$row) {
                $normalized = preg_replace('/\s+/', '', $key);
                $row['label'] = $acctMap[$normalized]['name'] ?? $key;
            }
        }

        $rows = array_values(array_map(fn ($r) => [
            ...$r,
            'total_income' => round($r['total_income'], 2),
            'total_expense' => round($r['total_expense'], 2),
            'total' => round($r['total'], 2),
        ], $grouped));

        usort($rows, fn ($a, $b) => $b['total'] <=> $a['total']);

        $grandIncome = round(array_sum(array_column($rows, 'total_income')), 2);
        $grandExpense = round(array_sum(array_column($rows, 'total_expense')), 2);
        $grandTotal = round($grandIncome + $grandExpense, 2);

        return Inertia::render('Admin/BankReport', [
            'rows' => $rows,
            'months' => $months,
            'chartData' => $chartData,
            'totals' => ['income' => $grandIncome, 'expense' => $grandExpense, 'total' => $grandTotal],
            'accounts' => $accounts,
            'dimensions' => $dimensions,
            'tab' => $tab,
            'period' => $period,
            'dimensionIndex' => $dimensionIndex,
            'from' => $from?->toDateString() ?? '',
            'to' => $to?->toDateString() ?? '',
        ]);
    }

    public function export(Request $request): BinaryFileResponse
    {
        $tab = $request->input('tab', 'account');
        $period = $request->input('period', 'year');
        $dimensionIndex = (int) $request->input('dimension_index', 1);

        [$from, $to] = $this->resolvePeriod($period, $request->input('from'), $request->input('to'));

        return Excel::download(new BankReportExport($tab, $from, $to, $dimensionIndex), 'financieel-rapport.xlsx');
    }

    private function resolvePeriod(string $period, ?string $customFrom, ?string $customTo): array
    {
        return match ($period) {
            'this_month' => [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()],
            'last_month' => [Carbon::now()->subMonth()->startOfMonth(), Carbon::now()->subMonth()->endOfMonth()],
            'quarter' => [Carbon::now()->startOfQuarter(), Carbon::now()->endOfQuarter()],
            'year' => [Carbon::now()->startOfYear(), Carbon::now()->endOfYear()],
            'custom' => [
                $customFrom ? Carbon::parse($customFrom)->startOfDay() : null,
                $customTo ? Carbon::parse($customTo)->endOfDay() : null,
            ],
            default => [null, null],
        };
    }
}
