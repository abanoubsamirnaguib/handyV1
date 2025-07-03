<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Models\MessageAttachment;
use App\Models\Message;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Get all message attachments
        $attachments = DB::table('message_attachments')
            ->join('messages', 'message_attachments.message_id', '=', 'messages.id')
            ->select('message_attachments.id', 'message_attachments.file_url', 'messages.conversation_id')
            ->get();

        foreach ($attachments as $attachment) {
            // Skip if no file URL
            if (empty($attachment->file_url)) {
                continue;
            }

            // Extract the filename from the current path
            $currentPath = str_replace('/storage/', '', $attachment->file_url);
            $filename = basename($currentPath);
            
            // Skip if file doesn't exist
            if (!Storage::disk('public')->exists($currentPath)) {
                continue;
            }

            // Create new path with conversation ID
            $newDirectory = "chat_attachments/conversation_{$attachment->conversation_id}";
            $newPath = "{$newDirectory}/{$filename}";
            
            // Create directory if it doesn't exist
            if (!Storage::disk('public')->exists($newDirectory)) {
                Storage::disk('public')->makeDirectory($newDirectory);
            }
            
            // Copy file to new location
            try {
                $fileContents = Storage::disk('public')->get($currentPath);
                Storage::disk('public')->put($newPath, $fileContents);
                
                // Update database record with new path
                $newUrl = "/storage/{$newPath}";
                DB::table('message_attachments')
                    ->where('id', $attachment->id)
                    ->update(['file_url' => $newUrl]);
                
                // Delete old file after successful copy
                Storage::disk('public')->delete($currentPath);
            } catch (\Exception $e) {
                // Log error but continue with other files
                \Log::error("Failed to migrate attachment ID {$attachment->id}: " . $e->getMessage());
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No need to implement down migration as it would be complex and risky
        // to move files back to their original locations
    }
};
