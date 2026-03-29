<?php

namespace App\Http\Controllers;

use App\Enums\VoucherStatus;
use App\Models\Voucher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VoucherController extends Controller
{
    public function activate(): Response
    {
        return Inertia::render('VoucherActivate');
    }

    public function lookup(Request $request): JsonResponse
    {
        $request->validate(['code' => 'required|string|max:10']);

        $voucher = Voucher::with('member:id,first_name,last_name,photo_data')
            ->where('code', strtoupper($request->code))
            ->first();

        if (! $voucher) {
            return response()->json(['error' => 'Voucher niet gevonden.'], 404);
        }

        return response()->json([
            'id' => $voucher->id,
            'code' => $voucher->code,
            'status' => $voucher->status->value,
            'status_label' => $voucher->status->label(),
            'is_active' => $voucher->isActive(),
            'member_name' => $voucher->member->fullName(),
            'member_photo' => $voucher->member->photo_data ? route('member-photo', $voucher->member) : null,
            'expires_at' => $voucher->expires_at->format('d/m/Y'),
            'redeemed_at' => $voucher->redeemed_at?->format('d/m/Y H:i'),
        ]);
    }

    public function redeem(Request $request): JsonResponse
    {
        $request->validate(['code' => 'required|string|max:10']);

        $voucher = Voucher::where('code', strtoupper($request->code))->first();

        if (! $voucher) {
            return response()->json(['error' => 'Voucher niet gevonden.'], 404);
        }

        if ($voucher->status === VoucherStatus::Redeemed) {
            return response()->json(['error' => 'Deze voucher is al verbruikt.'], 422);
        }

        if ($voucher->isExpired()) {
            return response()->json(['error' => 'Deze voucher is verlopen.'], 422);
        }

        if (! $voucher->isActive()) {
            return response()->json(['error' => 'Deze voucher is niet actief.'], 422);
        }

        $voucher->redeem($request->user());

        return response()->json([
            'message' => 'Voucher succesvol geactiveerd voor '.$voucher->member->fullName().'.',
        ]);
    }

    public function index(): JsonResponse
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

        return response()->json($vouchers);
    }
}
