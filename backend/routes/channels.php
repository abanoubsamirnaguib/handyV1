<?php

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

// Channel for private conversations
Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    // Ensure user is authenticated
    if (!$user) {
        Log::warning('Broadcasting auth failed: No user provided');
        return false;
    }
    
    // Check if the user is part of this conversation
    $conversation = \App\Models\Conversation::find($conversationId);
    
    if (!$conversation) {
        Log::warning('Broadcasting auth failed: Conversation not found', [
            'conversation_id' => $conversationId
        ]);
        return false;
    }
    $authorized = (
        $conversation->buyer_id === $user->id || 
        $conversation->seller_id === $user->id
    );
    return $authorized;
});

// Channel for user notifications
Broadcast::channel('user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Channel for user online status (public channel)
 