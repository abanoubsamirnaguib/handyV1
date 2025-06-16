<?php

namespace App\Traits;

trait EmailTrait
{
   static function sendMail($subject, $to, $data, $viewPath, $attachmentUrl = '', $file_name = '')
    {
        // Build the basic mail payload.
        $mailPayload = [
            'personalizations' => [
                [
                    'to' => [
                        [
                            'email' => $to,
                        ],
                    ],
                    'subject' => $subject,
                ],
            ],
            'content' => [
                [
                    'type' => 'text/html',
                    'value' => view($viewPath, ['body' => $data])->render(),
                ],
            ],
            'from' => [
                'email' => env('MAIL_FROM_ADDRESS'),
                'name'  => env('MAIL_FROM_NAME'),
            ],
            'reply_to' => [
                'email' => env('MAIL_FROM_ADDRESS'),
                'name'  => env('MAIL_FROM_NAME'),
            ],
        ];

        // Prepare attachment if provided.
        if (!empty($attachmentUrl)) {
            if (file_exists($attachmentUrl)) {
                $attachmentContent = base64_encode(file_get_contents($attachmentUrl));
                $mimeType = mime_content_type($attachmentUrl);
            } else {
                // Assume $attachmentUrl holds raw binary content (e.g., PDF output)
                $attachmentContent = base64_encode($attachmentUrl);
                $mimeType = 'application/pdf';
            }
            $mailPayload['attachments'] = [
                [
                    'content'     => $attachmentContent,
                    'filename'    => $file_name ?: 'الملف المرفق.pdf',
                    'type'        => $mimeType,
                    'disposition' => 'attachment',
                ],
            ];
        }
        
        $response = \Http::withHeaders([
            'Authorization' => 'Bearer ' . env('SENDGRID_API_KEY'),
            'Content-Type'  => 'application/json',
        ])->post('https://api.sendgrid.com/v3/mail/send', $mailPayload);
        
        info("SENDGRID res", [$response->json()]);
    }
} 