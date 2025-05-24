# Laravel Sanctum Authentication

This project uses Laravel Sanctum for API token authentication. Sanctum provides a lightweight authentication system for SPAs (Single Page Applications) and APIs.

## Authentication Flow

1. **Registration**: Users register at `/api/register` and receive a token they can use immediately.
2. **Login**: Users can login at `/api/login` with their email and password.
3. **Token Usage**: Include the token in subsequent requests in the `Authorization` header: `Bearer {token}`
4. **User Info**: Get current user data at `/api/me` (protected endpoint).
5. **Token Validation**: Check if a token is valid at `/api/check-token` (protected endpoint).
6. **Logout**: Users can logout at `/api/logout` to invalidate their current token.

## Token Refresh

- Tokens automatically expire after 7 days by default (configurable in `config/sanctum.php`).
- The system includes a token refresh middleware that generates a new token when the current one is nearing expiration.

## CORS Configuration

For cross-domain requests (like from a separate front-end application), CORS is configured to allow:
- Specific origins (localhost development servers)
- Common HTTP methods (GET, POST, PUT, PATCH, DELETE, OPTIONS)
- Required headers for authentication

## Frontend Integration

When making requests from the frontend:
1. First request `/sanctum/csrf-cookie` with credentials included
2. Then make your authentication request
3. Store the token in local storage/cookies
4. Include the token as a Bearer token in the Authentication header for subsequent requests

## Security Considerations

- Tokens are hashed in the database
- Session cookies are HTTP-only and secure
- Same-site cookie policy is set to 'lax'
- CSRF protection is enabled for stateful requests
