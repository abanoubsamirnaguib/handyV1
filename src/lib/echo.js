import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

// Function to get current auth token
const getAuthToken = () => {
    const token = localStorage.getItem('token');
    return token ? `Bearer ${token}` : '';
};

// Get base URL from environment or default
const getBaseUrl = () => {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
};

let echo;

try {
    // Configure Pusher with the provided credentials
    echo = new Echo({
        broadcaster: 'pusher',
        key: import.meta.env.VITE_PUSHER_APP_KEY || 'fc7fffaa70ba48b0ab84',
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'eu',
        forceTLS: true,
        encrypted: true,
        authEndpoint: `${getBaseUrl()}/api/broadcasting/auth`,
        auth: {
            headers: {
                Authorization: getAuthToken(),
                Accept: 'application/json',
            },
        },
    });
} catch (error) {
    echo = null;
}

// Function to update auth headers safely
export const updateEchoAuth = () => {
    try {
        if (echo && echo.connector && echo.connector.pusher && echo.connector.pusher.config) {
            echo.connector.pusher.config.auth = {
                headers: {
                    Authorization: getAuthToken(),
                    Accept: 'application/json',
                },
            };
        }
    } catch (error) {
        // Silent fail
    }
};

export default echo; 