<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Models\User;
use App\Events\MessageSent;
use App\Services\NotificationService;
use App\Events\NotificationCreated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ChatController extends Controller
{
    /**
     * Get all conversations for the authenticated user
     */
    public function getConversations()
    {
        $user = Auth::user();
        
        $conversations = Conversation::where('buyer_id', $user->id)
            ->orWhere('seller_id', $user->id)
            ->with(['buyer', 'seller', 'latestMessage.sender'])
            ->orderBy('last_message_time', 'desc')
            ->get();

        $formattedConversations = $conversations->map(function ($conversation) use ($user) {
            $participant = $conversation->buyer_id === $user->id 
                ? $conversation->seller 
                : $conversation->buyer;
            
            $unreadCount = Message::where('conversation_id', $conversation->id)
                ->where('recipient_id', $user->id)
                ->where('read_status', false)
                ->count();

            return [
                'id' => $conversation->id,
                'participant' => [
                    'id' => $participant->id,
                    'name' => $participant->name,
                    'email' => $participant->email,
                    'avatar' => $participant->avatar,
                    'last_seen' => $participant->last_seen ? $participant->last_seen->toIso8601String() : null,
                ],
                'lastMessage' => $conversation->latestMessage ? [
                    'id' => $conversation->latestMessage->id,
                    'text' => $conversation->latestMessage->message_text,
                    'timestamp' => $conversation->latestMessage->message_time,
                    'senderId' => $conversation->latestMessage->sender_id,
                ] : null,
                'unreadCount' => $unreadCount,
                'lastMessageTime' => $conversation->last_message_time,
            ];
        });

        return response()->json($formattedConversations);
    }

    /**
     * Get messages for a specific conversation
     */
    public function getMessages($conversationId)
    {
        $user = Auth::user();
        
        // Verify user is part of this conversation
        $conversation = Conversation::where('id', $conversationId)
            ->where(function ($query) use ($user) {
                $query->where('buyer_id', $user->id)
                      ->orWhere('seller_id', $user->id);
            })
            ->first();

        if (!$conversation) {
            return response()->json(['error' => 'Conversation not found'], 404);
        }

        $messages = Message::where('conversation_id', $conversationId)
            ->with(['sender', 'attachments'])
            ->orderBy('message_time', 'asc')
            ->get();

        $formattedMessages = $messages->map(function ($message) {
            return [
                'id' => $message->id,
                'text' => $message->message_text,
                'timestamp' => $message->message_time,
                'senderId' => $message->sender_id,
                'sender' => [
                    'id' => $message->sender->id,
                    'name' => $message->sender->name,
                    'avatar' => $message->sender->avatar,
                ],
                'attachments' => $message->attachments->map(function ($attachment) {
                    return [
                        'id' => $attachment->id,
                        'file_url' => $attachment->file_url,
                        'file_type' => $attachment->file_type,
                    ];
                }),
                'readStatus' => $message->read_status,
            ];
        });

        // Mark messages as read
        Message::where('conversation_id', $conversationId)
            ->where('recipient_id', $user->id)
            ->where('read_status', false)
            ->update(['read_status' => true]);

        return response()->json($formattedMessages);
    }

    /**
     * Send a new message
     */
    public function sendMessage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'recipient_id' => 'required|exists:users,id',
            'message_text' => 'required_without:attachments|string',
            'attachments' => 'sometimes|array',
            'attachments.*' => 'file|max:10240', // 10MB max per file
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = Auth::user();
        $recipientId = $request->recipient_id;

        DB::beginTransaction();
        
        try {
            // Find or create conversation
            $conversation = Conversation::where(function ($query) use ($user, $recipientId) {
                $query->where('buyer_id', $user->id)->where('seller_id', $recipientId);
            })->orWhere(function ($query) use ($user, $recipientId) {
                $query->where('buyer_id', $recipientId)->where('seller_id', $user->id);
            })->first();

            if (!$conversation) {
                // Determine roles based on user types or default behavior
                $buyer = $user;
                $seller = User::find($recipientId);
                
                $conversation = Conversation::create([
                    'buyer_id' => $buyer->id,
                    'seller_id' => $seller->id,
                    'last_message_time' => now(),
                ]);
            }

            // Create message
            $message = Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $user->id,
                'recipient_id' => $recipientId,
                'message_text' => $request->message_text ?? '',
                'read_status' => false,
                'message_time' => now(),
                'created_at' => now(),
            ]);

            // Handle file attachments
            if ($request->hasFile('attachments')) {
                // Create conversation-specific directory if it doesn't exist
                $conversationPath = "chat_attachments/conversation_{$conversation->id}";
                
                foreach ($request->file('attachments') as $file) {
                    $filename = time() . '_' . $file->getClientOriginalName();
                    $path = $file->storeAs($conversationPath, $filename, 'public');
                    
                    MessageAttachment::create([
                        'message_id' => $message->id,
                        'file_url' => Storage::url($path),
                        'file_type' => $file->getMimeType(),
                        'uploaded_at' => now(),
                    ]);
                }
            }

            // Update conversation last message time
            $conversation->update(['last_message_time' => now()]);

            // Load the message with relationships for broadcasting
            $message->load(['sender', 'attachments']);

            // Broadcast the message
            broadcast(new MessageSent($message, $user));

            // Create notification for the recipient
            $notification = NotificationService::messageReceived($recipientId, $user->name);
            
            // Broadcast the notification to the recipient
            broadcast(new NotificationCreated($notification));

            DB::commit();

            return response()->json([
                'message' => [
                    'id' => $message->id,
                    'text' => $message->message_text,
                    'timestamp' => $message->message_time,
                    'senderId' => $message->sender_id,
                    'conversationId' => $message->conversation_id,
                    'attachments' => $message->attachments->map(function ($attachment) {
                        return [
                            'id' => $attachment->id,
                            'file_url' => $attachment->file_url,
                            'file_type' => $attachment->file_type,
                        ];
                    }),
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to send message ' . $e->getMessage()], 500);
        }
    }

    /**
     * Start a new conversation
     */
    public function startConversation(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'recipient_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = Auth::user();
        $recipientId = $request->recipient_id;

        $recipient = User::find($recipientId);

        if (!$recipient) {
            return response()->json(['error' => 'Recipient not found'], 404);
        }

        // Check if conversation already exists
        $conversation = Conversation::where(function ($query) use ($user, $recipientId) {
            $query->where('buyer_id', $user->id)->where('seller_id', $recipientId);
        })->orWhere(function ($query) use ($user, $recipientId) {
            $query->where('buyer_id', $recipientId)->where('seller_id', $user->id);
        })->first();

        if (!$conversation) {
            // Determine roles based on user types or default behavior
            $buyer = $user;
            $seller = User::find($recipientId);
            
            $conversation = Conversation::create([
                'buyer_id' => $buyer->id,
                'seller_id' => $seller->id,
                'last_message_time' => now(),
            ]);
        }

        return response()->json([
            'conversationId' => $conversation->id,
            'participant' => [
                'id' => $recipient->id,
                'name' => $recipient->name,
                'email' => $recipient->email,
                'avatar' => $recipient->avatar,
            ],
        ]);
    }

    /**
     * Mark messages as read
     */
    public function markAsRead($conversationId)
    {
        $user = Auth::user();
        
        // Verify user is part of this conversation
        $conversation = Conversation::where('id', $conversationId)
            ->where(function ($query) use ($user) {
                $query->where('buyer_id', $user->id)
                      ->orWhere('seller_id', $user->id);
            })
            ->first();

        if (!$conversation) {
            return response()->json(['error' => 'Conversation not found'], 404);
        }

        Message::where('conversation_id', $conversationId)
            ->where('recipient_id', $user->id)
            ->where('read_status', false)
            ->update(['read_status' => true]);

        return response()->json(['success' => true]);
    }

    /**
     * Delete a conversation
     */
    public function deleteConversation($conversationId)
    {
        $user = Auth::user();
        
        $conversation = Conversation::where('id', $conversationId)
            ->where(function ($query) use ($user) {
                $query->where('buyer_id', $user->id)
                      ->orWhere('seller_id', $user->id);
            })
            ->first();

        if (!$conversation) {
            return response()->json(['error' => 'Conversation not found'], 404);
        }

        // Delete the entire conversation folder with all attachments
        $conversationPath = "chat_attachments/conversation_{$conversationId}";
        Storage::disk('public')->deleteDirectory($conversationPath);

        $conversation->delete(); // This will cascade delete messages and attachments

        return response()->json(['success' => true]);
    }

    /**
     * Update user's online status
     */
    public function updateOnlineStatus(Request $request)
    {
        $user = Auth::user();
        
        // Update last seen timestamp
        $user->last_seen = now();
        $user->save();
        
        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'last_seen' => $user->last_seen
            ]
        ]);
    }

    /**
     * Admin: Get all conversations in the system
     */
    public function adminGetAllConversations(Request $request)
    {
        $user = Auth::user();
        
        // Check if user is admin
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'غير مصرح لك بالوصول'], 403);
        }
        
        $query = Conversation::with(['buyer', 'seller', 'latestMessage.sender'])
            ->orderBy('last_message_time', 'desc');

        // Apply search filter if provided
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->whereHas('buyer', function($subq) use ($search) {
                    $subq->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
                })
                ->orWhereHas('seller', function($subq) use ($search) {
                    $subq->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
                })
                ->orWhereHas('latestMessage', function($subq) use ($search) {
                    $subq->where('message_text', 'like', "%{$search}%");
                });
            });
        }

        $conversations = $query->get();

        $formattedConversations = $conversations->map(function ($conversation) {
            $messageCount = Message::where('conversation_id', $conversation->id)->count();
            
            return [
                'id' => $conversation->id,
                'buyer' => [
                    'id' => $conversation->buyer->id,
                    'name' => $conversation->buyer->name,
                    'email' => $conversation->buyer->email,
                    'avatar' => $conversation->buyer->avatar,
                    'last_seen' => $conversation->buyer->last_seen ? $conversation->buyer->last_seen->toIso8601String() : null,
                ],
                'seller' => [
                    'id' => $conversation->seller->id,
                    'name' => $conversation->seller->name,
                    'email' => $conversation->seller->email,
                    'avatar' => $conversation->seller->avatar,
                    'last_seen' => $conversation->seller->last_seen ? $conversation->seller->last_seen->toIso8601String() : null,
                ],
                'lastMessage' => $conversation->latestMessage ? [
                    'id' => $conversation->latestMessage->id,
                    'text' => $conversation->latestMessage->message_text,
                    'timestamp' => $conversation->latestMessage->message_time,
                    'senderId' => $conversation->latestMessage->sender_id,
                ] : null,
                'messageCount' => $messageCount,
                'lastMessageTime' => $conversation->last_message_time,
                'createdAt' => $conversation->created_at,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formattedConversations
        ]);
    }

    /**
     * Admin: Get messages for any conversation (bypasses participant restriction)
     */
    public function adminGetMessages($conversationId)
    {
        $user = Auth::user();
        
        // Check if user is admin
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'غير مصرح لك بالوصول'], 403);
        }

        $conversation = Conversation::with(['buyer', 'seller'])->find($conversationId);

        if (!$conversation) {
            return response()->json(['error' => 'Conversation not found'], 404);
        }

        $messages = Message::where('conversation_id', $conversationId)
            ->with(['sender', 'attachments'])
            ->orderBy('message_time', 'asc')
            ->get();

        $formattedMessages = $messages->map(function ($message) {
            return [
                'id' => $message->id,
                'text' => $message->message_text,
                'timestamp' => $message->message_time,
                'senderId' => $message->sender_id,
                'sender' => [
                    'id' => $message->sender->id,
                    'name' => $message->sender->name,
                    'avatar' => $message->sender->avatar,
                ],
                'attachments' => $message->attachments->map(function ($attachment) {
                    return [
                        'id' => $attachment->id,
                        'file_url' => $attachment->file_url,
                        'file_type' => $attachment->file_type,
                    ];
                }),
                'readStatus' => $message->read_status,
            ];
        });

        return response()->json([
            'success' => true,
            'conversation' => [
                'id' => $conversation->id,
                'buyer' => [
                    'id' => $conversation->buyer->id,
                    'name' => $conversation->buyer->name,
                    'avatar' => $conversation->buyer->avatar,
                ],
                'seller' => [
                    'id' => $conversation->seller->id,
                    'name' => $conversation->seller->name,
                    'avatar' => $conversation->seller->avatar,
                ],
            ],
            'messages' => $formattedMessages
        ]);
    }

    /**
     * Admin: Get conversation statistics
     */
    public function adminGetStats()
    {
        $user = Auth::user();
        
        // Check if user is admin
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'غير مصرح لك بالوصول'], 403);
        }

        $totalConversations = Conversation::count();
        $totalMessages = Message::count();
        $activeConversations = Conversation::where('last_message_time', '>=', now()->subDays(7))->count();
        $todayMessages = Message::whereDate('message_time', today())->count();

        return response()->json([
            'success' => true,
            'stats' => [
                'total_conversations' => $totalConversations,
                'total_messages' => $totalMessages,
                'active_conversations' => $activeConversations,
                'today_messages' => $todayMessages,
            ]
        ]);
    }
}