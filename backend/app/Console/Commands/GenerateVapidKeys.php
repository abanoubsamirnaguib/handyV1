<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class GenerateVapidKeys extends Command
{
    protected $signature = 'push:vapid';
    protected $description = 'Generate VAPID keys for Web Push';

    public function handle(): int
    {
        if (!class_exists(\Minishlink\WebPush\VAPID::class)) {
            $this->error('minishlink/web-push is not installed.');
            $this->line('Run: composer require minishlink/web-push');
            return self::FAILURE;
        }

        $keys = \Minishlink\WebPush\VAPID::createVapidKeys();

        $this->info('VAPID keys generated.');
        $this->line('');
        $this->line('Add these to your backend .env:');
        $this->line('VAPID_SUBJECT="mailto:admin@example.com"');
        $this->line('VAPID_PUBLIC_KEY=' . $keys['publicKey']);
        $this->line('VAPID_PRIVATE_KEY=' . $keys['privateKey']);

        return self::SUCCESS;
    }
}

