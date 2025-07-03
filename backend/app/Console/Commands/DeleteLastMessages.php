<?php

namespace App\Console\Commands;

use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DeleteLastMessages extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'chat:remove-last-messages
                            {conversation_id : The ID of the conversation}
                            {count=1 : Number of recent messages to delete (default: 1)}
                            {--force : Skip confirmation}';
    // php artisan chat:remove-last-messages 123 5 --force
    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Remove the last N messages from a specific conversation';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $conversationId = $this->argument('conversation_id');
        $count = $this->argument('count');
        $force = $this->option('force');

        // Validate count
        if (!is_numeric($count) || $count < 1) {
            $this->error('Count must be a positive number');
            return 1;
        }

        if ($count > 100 && !$force) {
            if (!$this->confirm("You're about to delete {$count} messages. This is a lot. Are you sure?")) {
                $this->info('Operation cancelled');
                return 0;
            }
        }

        // Verify conversation exists
        $conversation = Conversation::find($conversationId);
        if (!$conversation) {
            $this->error("Conversation with ID {$conversationId} not found");
            return 1;
        }

        // Get participant names for confirmation
        $buyerName = $conversation->buyer->name ?? 'Unknown';
        $sellerName = $conversation->seller->name ?? 'Unknown';

        // Show conversation details
        $this->info("Conversation #{$conversationId}");
        $this->line("Between: {$buyerName} (buyer) and {$sellerName} (seller)");
        
        if (!$force) {
            if (!$this->confirm("Are you sure you want to delete the last {$count} messages from this conversation?")) {
                $this->info('Operation cancelled');
                return 0;
            }
        }

        DB::beginTransaction();
        
        try {
            // Get the last N messages from this conversation
            $messagesToDelete = Message::where('conversation_id', $conversationId)
                ->latest('message_time')
                ->take($count)
                ->get();
            
            $actualCount = $messagesToDelete->count();
            
            // If no messages found
            if ($actualCount === 0) {
                $this->info('No messages found to delete');
                return 0;
            }

            $this->output->progressStart($actualCount);

            // Delete attachments and their files
            foreach ($messagesToDelete as $message) {
                foreach ($message->attachments as $attachment) {
                    // Delete the file from storage
                    if ($attachment->file_url) {
                        $filePath = str_replace('/storage/', '', $attachment->file_url);
                        Storage::disk('public')->delete($filePath);
                    }
                    
                    // Delete the attachment record
                    $attachment->delete();
                }
                $this->output->progressAdvance();
            }
            
            // Delete the messages
            $messageIds = $messagesToDelete->pluck('id')->toArray();
            Message::destroy($messageIds);
            
            $this->output->progressFinish();
            
            // Update conversation's last_message_time
            $lastMessage = Message::where('conversation_id', $conversationId)
                ->latest('message_time')
                ->first();

            if ($lastMessage) {
                $conversation->last_message_time = $lastMessage->message_time;
            } else {
                // If all messages are deleted, set to conversation creation time
                $conversation->last_message_time = $conversation->created_at;
            }
            
            $conversation->save();
            
            DB::commit();
            
            $this->info("Successfully deleted {$actualCount} messages");
            return 0;
            
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('Failed to delete messages: ' . $e->getMessage());
            return 1;
        }
    }
}
