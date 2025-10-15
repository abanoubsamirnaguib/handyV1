<?php

namespace App\Traits;

trait EmailTrait
{
   static function sendMail($subject, $to, $data, $viewPath, $attachmentUrl = '', $file_name = '')
    {
        // Build the Brevo mail payload
        $mailPayload = [
            'to' => [
                [
                    'email' => $to,
                    'name' => $to
                ]
            ],
            'subject' => $subject,
            'htmlContent' => view($viewPath, ['body' => $data])->render(),
            'sender' => [
                'email' => env('MAIL_FROM_ADDRESS'),
                'name' => env('MAIL_FROM_NAME'),
            ],
            'replyTo' => [
                'email' => env('MAIL_FROM_ADDRESS'),
                'name' => env('MAIL_FROM_NAME'),
            ],
        ];

        // Prepare attachment if provided
        if (!empty($attachmentUrl)) {
            $attachments = [];
            
            if (file_exists($attachmentUrl)) {
                $attachmentContent = base64_encode(file_get_contents($attachmentUrl));
                $mimeType = mime_content_type($attachmentUrl);
                $fileName = $file_name ?: basename($attachmentUrl);
            } else {
                // Assume $attachmentUrl holds raw binary content (e.g., PDF output)
                $attachmentContent = base64_encode($attachmentUrl);
                $mimeType = 'application/pdf';
                $fileName = $file_name ?: 'الملف المرفق.pdf';
            }
            
            $attachments[] = [
                'content' => $attachmentContent,
                'name' => $fileName,
            ];
            
            $mailPayload['attachment'] = $attachments;
        }
        
        $response = \Http::withHeaders([
            'api-key' => env('BREVO_API_KEY'),
            'Content-Type' => 'application/json',
            'accept' => 'application/json',
        ])->post('https://api.brevo.com/v3/smtp/email', $mailPayload);
        
        info("BREVO API Response", [
            'status' => $response->status(),
            'body' => $response->json()
        ]);
        
        // Return true if successful, false otherwise
        return $response->successful();
    }
} 