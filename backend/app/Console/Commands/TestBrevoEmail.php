<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\EmailService;

class TestBrevoEmail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'email:test-brevo {email : The email address to send test email to}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test Brevo email integration by sending a test email';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        
        $this->info('Testing Brevo email integration...');
        $this->info("Sending test email to: {$email}");
        
        // Check if Brevo API key is configured
        if (!env('BREVO_API_KEY') || env('BREVO_API_KEY') === 'your-brevo-api-key-here') {
            $this->error('BREVO_API_KEY is not configured in .env file');
            $this->info('Please set your Brevo API key in the .env file:');
            $this->info('BREVO_API_KEY=your-actual-brevo-api-key');
            return 1;
        }
        
        try {
            $emailService = new EmailService();
            $result = $emailService->sendEmailVerificationOTP($email, '123456');
            
            if ($result) {
                $this->info('✅ Test email sent successfully!');
                $this->info('Check your email inbox and spam folder.');
            } else {
                $this->error('❌ Failed to send test email.');
                $this->info('Check the Laravel logs for more details.');
            }
            
        } catch (\Exception $e) {
            $this->error('❌ Error occurred while sending email:');
            $this->error($e->getMessage());
            return 1;
        }
        
        return 0;
    }
}