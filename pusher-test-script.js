// Pusher Real-Time Testing Script
// Run this in your browser console while on your chat page

console.log('🚀 Starting Pusher Real-Time Test...');

// Check if Echo is available
if (typeof window.Echo !== 'undefined' && window.Echo) {
    console.log('✅ Echo is available');
    
    // Check connection status
    if (window.Echo.connector && window.Echo.connector.pusher) {
        const pusher = window.Echo.connector.pusher;
        console.log('📡 Pusher connection state:', pusher.connection.state);
        
        // Add connection event listeners
        pusher.connection.bind('connected', () => {
            console.log('🟢 Pusher connected successfully');
        });
        
        pusher.connection.bind('disconnected', () => {
            console.log('🔴 Pusher disconnected');
        });
        
        pusher.connection.bind('error', (error) => {
            console.error('❌ Pusher error:', error);
        });
        
        pusher.connection.bind('state_change', (states) => {
            console.log('🔄 Pusher state change:', states.current);
        });
    }
    
    // Test listening to a specific conversation
    const testConversationId = 123; // Change this to your conversation ID
    
    console.log(`👂 Listening to conversation.${testConversationId}`);
    
    const channel = window.Echo.private(`conversation.${testConversationId}`)
        .listen('.message.sent', (e) => {
            console.log('📨 Message received via Pusher:', e);
            
            // Create a visual notification
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #4CAF50;
                color: white;
                padding: 15px;
                border-radius: 5px;
                z-index: 10000;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                max-width: 300px;
            `;
            notification.innerHTML = `
                <strong>New Message Received!</strong><br>
                From: ${e.message.sender.name}<br>
                Text: ${e.message.message_text}
            `;
            document.body.appendChild(notification);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 5000);
        })
        .error((error) => {
            console.error('❌ Error subscribing to channel:', error);
        });
    
    // Test functions you can call manually
    window.pusherTest = {
        // Send a test message via API
        sendTestMessage: async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('❌ No auth token found. Please login first.');
                return;
            }
            
            try {
                const response = await fetch('/api/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        conversation_id: testConversationId,
                        recipient_id: 2, // Change this to a valid recipient ID
                        message_text: `Test message sent at ${new Date().toLocaleTimeString()}`,
                        attachments: []
                    })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('✅ Test message sent successfully:', result);
                } else {
                    console.error('❌ Failed to send test message:', response.statusText);
                }
            } catch (error) {
                console.error('❌ Error sending test message:', error);
            }
        },
        
        // Check current subscriptions
        checkSubscriptions: () => {
            if (window.Echo.connector && window.Echo.connector.channels) {
                console.log('📋 Current subscriptions:', Object.keys(window.Echo.connector.channels));
            }
        },
        
        // Get connection info
        getConnectionInfo: () => {
            if (window.Echo.connector && window.Echo.connector.pusher) {
                const pusher = window.Echo.connector.pusher;
                console.log('📊 Connection Info:', {
                    state: pusher.connection.state,
                    socket_id: pusher.connection.socket_id,
                    activity_timeout: pusher.connection.activity_timeout,
                    transport: pusher.connection.transport?.name
                });
            }
        },
        
        // Leave current channel
        leaveChannel: () => {
            window.Echo.leave(`conversation.${testConversationId}`);
            console.log(`👋 Left conversation.${testConversationId}`);
        },
        
        // Rejoin channel
        rejoinChannel: () => {
            window.Echo.private(`conversation.${testConversationId}`)
                .listen('.message.sent', (e) => {
                    console.log('📨 Message received (rejoined):', e);
                });
            console.log(`🔄 Rejoined conversation.${testConversationId}`);
        }
    };
    
    console.log(`
🎯 Pusher test setup complete!

Available test functions:
- pusherTest.sendTestMessage() - Send a test message
- pusherTest.checkSubscriptions() - View current subscriptions  
- pusherTest.getConnectionInfo() - Get connection details
- pusherTest.leaveChannel() - Leave the test channel
- pusherTest.rejoinChannel() - Rejoin the test channel

Example usage:
pusherTest.sendTestMessage();
    `);
    
} else {
    console.error('❌ Echo is not available. Make sure you are on the chat page.');
}

// Monitor WebSocket connections
const originalWebSocket = window.WebSocket;
window.WebSocket = function(url, protocols) {
    console.log('🌐 WebSocket connection attempt:', url);
    const ws = new originalWebSocket(url, protocols);
    
    ws.addEventListener('open', () => {
        console.log('🟢 WebSocket connected:', url);
    });
    
    ws.addEventListener('close', () => {
        console.log('🔴 WebSocket disconnected:', url);
    });
    
    ws.addEventListener('error', (error) => {
        console.error('❌ WebSocket error:', error);
    });
    
    return ws;
};
