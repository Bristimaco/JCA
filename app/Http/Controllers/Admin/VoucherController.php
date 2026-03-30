<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use Inertia\Inertia;
use Inertia\Response;

class VoucherController extends Controller
{
    public function index(): Response
    {
        $vouchers = Voucher::with(['member:id,first_name,last_name', 'redeemedByUser:id,name'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Voucher $v) => [
                'id' => $v->id,
                'code' => $v->code,
                'status' => $v->status->value,
                'status_label' => $v->status->label(),
                'member_name' => $v->member->fullName(),
                'expires_at' => $v->expires_at->toDateString(),
                'redeemed_at' => $v->redeemed_at?->format('d/m/Y H:i'),
                'redeemed_by_name' => $v->redeemedByUser?->name,
            ]);

        return Inertia::render('Admin/Vouchers', [
            'vouchers' => $vouchers,
        ]);
    }
}
