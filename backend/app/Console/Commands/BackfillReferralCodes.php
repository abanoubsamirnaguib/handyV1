<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class BackfillReferralCodes extends Command
{
    protected $signature = 'referrals:backfill-codes {--dry-run : List users that would get codes without saving}';

    protected $description = 'Assign a unique referral_code to every user that does not have one';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        $query = User::query()->where(function ($q) {
            $q->whereNull('referral_code')->orWhere('referral_code', '');
        });

        $count = (clone $query)->count();

        if ($count === 0) {
            $this->info('All users already have a referral code.');
            return self::SUCCESS;
        }

        $this->info("Users without referral code: {$count}");

        if ($dryRun) {
            $this->table(['id', 'email', 'name'], $query->orderBy('id')->get(['id', 'email', 'name'])->toArray());
            return self::SUCCESS;
        }

        $updated = 0;
        $query->orderBy('id')->chunkById(100, function ($users) use (&$updated) {
            foreach ($users as $user) {
                $user->forceFill(['referral_code' => User::generateUniqueReferralCode()])->save();
                $updated++;
            }
        });

        $this->info("Assigned referral codes to {$updated} user(s).");
        return self::SUCCESS;
    }
}
