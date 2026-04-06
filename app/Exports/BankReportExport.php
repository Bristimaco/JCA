<?php

namespace App\Exports;

use App\Models\BankTransaction;
use App\Models\ClubSettings;
use Illuminate\Support\Carbon;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;

class BankReportExport implements FromArray, WithHeadings
{
    private string $tab;

    private ?Carbon $from;

    private ?Carbon $to;

    private int $dimensionIndex;

    private array $months = [];

    public function __construct(string $tab, ?Carbon $from, ?Carbon $to, int $dimensionIndex)
    {
        $this->tab = $tab;
        $this->from = $from;
        $this->to = $to;
        $this->dimensionIndex = $dimensionIndex;
    }

    public function headings(): array
    {
        $this->buildData();

        return array_merge(['Groep'], $this->months, ['Totaal Inkomsten', 'Totaal Uitgaven', 'Totaal']);
    }

    public function array(): array
    {
        $rows = $this->buildData();

        return array_map(function ($row) {
            $values = [$row['label']];
            foreach ($this->months as $m) {
                $values[] = $row['months'][$m]['total'] ?? 0;
            }
            $values[] = $row['total_income'];
            $values[] = $row['total_expense'];
            $values[] = $row['total'];

            return $values;
        }, $rows);
    }

    private function buildData(): array
    {
        $groupField = match ($this->tab) {
            'counterparty' => 'counterparty_account',
            'dimension' => "dimension_{$this->dimensionIndex}_value",
            default => 'account_number',
        };

        $query = BankTransaction::query();
        if ($this->from) {
            $query->whereDate('transaction_date', '>=', $this->from);
        }
        if ($this->to) {
            $query->whereDate('transaction_date', '<=', $this->to);
        }

        $raw = $query
            ->selectRaw("{$groupField} as group_key, to_char(transaction_date, 'YYYY-MM') as month, SUM(CASE WHEN amount >= 0 THEN amount ELSE 0 END) as income, SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END) as expense, SUM(amount) as total")
            ->whereNotNull($groupField)
            ->where($groupField, '!=', '')
            ->groupBy('group_key', 'month')
            ->orderBy('group_key')
            ->orderBy('month')
            ->get();

        $this->months = $raw->pluck('month')->unique()->sort()->values()->all();

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

        if ($this->tab === 'counterparty') {
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
        } elseif ($this->tab === 'account') {
            $settings = ClubSettings::first();
            $acctMap = collect($settings?->bank_accounts ?? [])->keyBy(fn ($a) => preg_replace('/\s+/', '', $a['account_number']));
            foreach ($grouped as $key => &$row) {
                $normalized = preg_replace('/\s+/', '', $key);
                $row['label'] = $acctMap[$normalized]['name'] ?? $key;
            }
        }

        return array_values(array_map(fn ($r) => [
            ...$r,
            'total_income' => round($r['total_income'], 2),
            'total_expense' => round($r['total_expense'], 2),
            'total' => round($r['total'], 2),
        ], $grouped));
    }
}
