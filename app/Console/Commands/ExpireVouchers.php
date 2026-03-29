<?php

namespace App\Console\Commands;

use App\Enums\VoucherStatus;
use App\Models\Voucher;
use Illuminate\Console\Command;

class ExpireVouchers extends Command
{
    protected $signature = 'vouchers:expire';

    protected $description = 'Mark expired vouchers as expired';

    public function handle(): int
    {
        $count = Voucher::where('status', VoucherStatus::Active)
            ->where('expires_at', '<', now())
            ->update(['status' => VoucherStatus::Expired]);

        $this->info("Marked {$count} voucher(s) as expired.");

        return self::SUCCESS;
    }
}
