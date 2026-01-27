import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const getBearerTokenValue = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};

const getAuthHeaders = () => {
    const headers = {
        Accept: 'application/json',
    };

    const bearer = getBearerTokenValue();
    if (!bearer) return headers;

    headers.Authorization = bearer;
    return headers;
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

        // Important: use a dynamic authorizer so the latest token is used
        // even if Echo was created before login.
        authorizer: (channel) => {
            return {
                authorize: async (socketId, callback) => {
                    try {
                        const bearer = getBearerTokenValue();
                        const headers = {
                            Accept: 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        };
                        if (bearer) headers.Authorization = bearer;

                        const body = new URLSearchParams();
                        body.set('socket_id', socketId);
                        body.set('channel_name', channel.name);

                        const res = await fetch(`${getBaseUrl()}/api/broadcasting/auth`, {
                            method: 'POST',
                            headers: {
                                ...headers,
                                'Content-Type': 'application/x-www-form-urlencoded',
                            },
                            body: body.toString(),
                        });

                        const text = await res.text();
                        let data;
                        try {
                            data = JSON.parse(text);
                        } catch {
                            data = { message: text };
                        }

                        if (!res.ok) {
                            callback(true, data);
                            return;
                        }

                        callback(false, data);
                    } catch (err) {
                        callback(true, err);
                    }
                },
            };
        },
        auth: {
            headers: {
                ...getAuthHeaders(),
            },
        },
    });
} catch (error) {
    echo = null;
}

// Function to update auth headers safely
export const updateEchoAuth = () => {
    try {
        if (!echo) return;

        const headers = getAuthHeaders();

        // Laravel Echo stores options on connector; different versions read from different places.
        if (echo.connector?.options?.auth) {
            echo.connector.options.auth.headers = {
                ...(echo.connector.options.auth.headers || {}),
                ...headers,
            };
        }

        if (echo.options?.auth) {
            echo.options.auth.headers = {
                ...(echo.options.auth.headers || {}),
                ...headers,
            };
        }

        // Pusher client config may also be used internally
        if (echo.connector?.pusher?.config) {
            const prevAuth = echo.connector.pusher.config.auth || {};
            echo.connector.pusher.config.auth = {
                ...prevAuth,
                headers: {
                    ...(prevAuth.headers || {}),
                    ...headers,
                },
            };
        }
    } catch (error) {
        // Silent fail
    }
};

// After login, force pusher to use new auth headers
export const reconnectEcho = () => {
    try {
        if (!echo) return;
        updateEchoAuth();
        const pusher = echo.connector?.pusher;
        if (!pusher) return;
        // Drop any in-flight auth attempts using old headers
        pusher.disconnect();
        pusher.connect();
    } catch {
        // Silent fail
    }
};

export default echo; 