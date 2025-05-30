# Frontend-Backend Integration Requirements

This document outlines all frontend features that require backend API connectivity for the بازار (Bazar) marketplace application.

## 1. Authentication & User Management

### User Registration & Login
- **Endpoint**: `/api/register`, `/api/login`
- **Frontend Components**: 
  - [`LoginPage`](src/pages/LoginPage.jsx)
  - [`RegisterPage`](src/pages/RegisterPage.jsx)
  - [`AuthContext`](src/contexts/AuthContext.jsx)
- **Required APIs**:
  - `POST /api/register` - User registration
  - `POST /api/login` - User authentication
  - `POST /api/logout` - User logout
  - `GET /api/me` - Get current user data
  - `GET /api/check-token` - Token validation

### User Profiles
- **Frontend Components**: 
  - [`ProfilePage`](src/pages/ProfilePage.jsx)
  - [`SellerProfilePage`](src/pages/SellerProfilePage.jsx)
- **Required APIs**:
  - `GET /api/users/{id}` - Get user profile
  - `PUT /api/users/{id}` - Update user profile
  - `POST /api/users/{id}/avatar` - Upload user avatar
  - `GET /api/users/{id}/gigs` - Get user's gigs
  - `GET /api/users/{id}/reviews` - Get user reviews

## 2. Product Management (Gigs)

### Gig Operations
- **Frontend Components**:
  - [`CreateGigPage`](src/components/dashboard/CreateGigPage.jsx)
  - [`EditGigPage`](src/components/dashboard/EditGigPage.jsx)
  - [`DashboardGigs`](src/components/dashboard/DashboardGigs.jsx)
  - [`GigDetailsPage`](src/pages/GigDetailsPage.jsx)
- **Required APIs**:
  - `GET /api/gigs` - List all gigs with pagination/filtering
  - `GET /api/gigs/{id}` - Get gig details
  - `POST /api/gigs` - Create new gig
  - `PUT /api/gigs/{id}` - Update gig
  - `DELETE /api/gigs/{id}` - Delete gig
  - `POST /api/gigs/{id}/images` - Upload gig images
  - `GET /api/gigs/search` - Search gigs
  - `GET /api/gigs/categories/{category}` - Get gigs by category

### Gig Reviews & Ratings
- **Frontend Components**: [`GigDetailsPage`](src/pages/GigDetailsPage.jsx)
- **Required APIs**:
  - `GET /api/gigs/{id}/reviews` - Get gig reviews
  - `POST /api/gigs/{id}/reviews` - Add review
  - `PUT /api/reviews/{id}` - Update review
  - `DELETE /api/reviews/{id}` - Delete review

## 3. Shopping Cart & Orders

### Cart Management
- **Frontend Components**: 
  - [`CartPage`](src/pages/CartPage.jsx)
  - [`CartContext`](src/contexts/CartContext.jsx)
- **Required APIs**:
  - `GET /api/cart` - Get user's cart
  - `POST /api/cart/items` - Add item to cart
  - `PUT /api/cart/items/{id}` - Update cart item
  - `DELETE /api/cart/items/{id}` - Remove from cart
  - `DELETE /api/cart` - Clear cart

### Order Processing
- **Frontend Components**: 
  - [`DashboardOrders`](src/components/dashboard/DashboardOrders.jsx)
- **Required APIs**:
  - `POST /api/orders` - Create order
  - `GET /api/orders` - Get user orders
  - `GET /api/orders/{id}` - Get order details
  - `PUT /api/orders/{id}/status` - Update order status
  - `POST /api/orders/{id}/payment` - Process payment

## 4. Messaging & Chat System

### Real-time Chat
- **Frontend Components**: 
  - [`ChatPage`](src/pages/ChatPage.jsx)
  - [`MessagePage`](src/pages/MessagePage.jsx)
  - [`ChatContext`](src/contexts/ChatContext.jsx)
  - [`DashboardMessages`](src/components/dashboard/DashboardMessages.jsx)
- **Required APIs**:
  - `GET /api/conversations` - Get user conversations
  - `GET /api/conversations/{id}` - Get conversation details
  - `POST /api/conversations` - Start new conversation
  - `GET /api/conversations/{id}/messages` - Get messages
  - `POST /api/conversations/{id}/messages` - Send message
  - `PUT /api/messages/{id}/read` - Mark message as read
  - **WebSocket/Real-time**: Message broadcasting

## 5. Dashboard Analytics & Reports

### User Dashboard
- **Frontend Components**: 
  - [`DashboardOverview`](src/components/dashboard/DashboardOverview.jsx)
  - [`DashboardEarnings`](src/components/dashboard/DashboardEarnings.jsx)
- **Required APIs**:
  - `GET /api/dashboard/stats` - Get user statistics
  - `GET /api/dashboard/earnings` - Get earnings data
  - `GET /api/dashboard/analytics` - Get analytics data
  - `GET /api/dashboard/recent-orders` - Get recent orders
  - `GET /api/dashboard/notifications` - Get notifications

## 6. Admin Panel Features

### Admin Dashboard
- **Frontend Components**: 
  - [`AdminDashboardPage`](src/pages/AdminDashboardPage.jsx)
  - [`AdminLayout`](src/layouts/AdminLayout.jsx)
- **Required APIs**:
  - `GET /api/admin/dashboard/stats` - Get admin statistics
  - `GET /api/admin/dashboard/analytics` - Get platform analytics

### User Management
- **Frontend Components**: [`AdminUsers`](src/components/admin/AdminUsers.jsx)
- **Required APIs**:
  - `GET /api/admin/users` - List all users
  - `PUT /api/admin/users/{id}` - Update user
  - `DELETE /api/admin/users/{id}` - Delete user
  - `PUT /api/admin/users/{id}/status` - Change user status
  - `PUT /api/admin/users/{id}/role` - Change user role

### Product Management
- **Frontend Components**: [`AdminProducts`](src/components/admin/AdminProducts.jsx)
- **Required APIs**:
  - `GET /api/admin/gigs` - List all gigs
  - `PUT /api/admin/gigs/{id}/status` - Approve/reject gig
  - `DELETE /api/admin/gigs/{id}` - Delete gig
  - `GET /api/admin/gigs/pending` - Get pending approvals

### Category Management
- **Frontend Components**: [`AdminCategories`](src/components/admin/AdminCategories.jsx)
- **Required APIs**:
  - `GET /api/admin/categories` - List categories
  - `POST /api/admin/categories` - Create category
  - `PUT /api/admin/categories/{id}` - Update category
  - `DELETE /api/admin/categories/{id}` - Delete category

### Seller Management
- **Frontend Components**: [`AdminSellers`](src/components/admin/AdminSellers.jsx)
- **Required APIs**:
  - `GET /api/admin/sellers` - List sellers
  - `PUT /api/admin/sellers/{id}/verify` - Verify seller
  - `PUT /api/admin/sellers/{id}/status` - Change seller status

### System Settings
- **Frontend Components**: [`AdminSettings`](src/components/admin/AdminSettings.jsx)
- **Required APIs**:
  - `GET /api/admin/settings` - Get system settings
  - `PUT /api/admin/settings` - Update system settings
  - `POST /api/admin/settings/logo` - Upload logo
  - `POST /api/admin/settings/favicon` - Upload favicon

### Admin Messages
- **Frontend Components**: [`AdminMessages`](src/components/admin/AdminMessages.jsx)
- **Required APIs**:
  - `GET /api/admin/messages` - Get all platform messages
  - `DELETE /api/admin/messages/{id}` - Delete message
  - `PUT /api/admin/messages/{id}/moderate` - Moderate message

## 7. Search & Filtering

### Product Search
- **Frontend Components**: 
  - [`ExplorePage`](src/pages/ExplorePage.jsx)
  - [`Navbar`](src/components/Navbar.jsx)
- **Required APIs**:
  - `GET /api/search/gigs` - Search gigs
  - `GET /api/search/users` - Search users
  - `GET /api/search/suggestions` - Get search suggestions
  - `GET /api/filters/categories` - Get filter categories
  - `GET /api/filters/price-ranges` - Get price ranges

## 8. File Upload & Media Management

### Image/File Uploads
- **Used in multiple components for**:
  - User avatars
  - Gig images
  - System logos/favicons
- **Required APIs**:
  - `POST /api/upload/image` - Upload single image
  - `POST /api/upload/images` - Upload multiple images
  - `DELETE /api/upload/{id}` - Delete uploaded file
  - `GET /api/media/{id}` - Get media file

## 9. Notifications System

### Real-time Notifications
- **Frontend Components**: [`Navbar`](src/components/Navbar.jsx)
- **Required APIs**:
  - `GET /api/notifications` - Get user notifications
  - `PUT /api/notifications/{id}/read` - Mark as read
  - `DELETE /api/notifications/{id}` - Delete notification
  - `PUT /api/notifications/read-all` - Mark all as read
  - **WebSocket/Real-time**: Notification broadcasting

## 10. Data Sources & Static Content

### Categories & Static Data
- **Current**: Using [`data.js`](src/lib/data.js)
- **Required APIs**:
  - `GET /api/categories` - Get all categories
  - `GET /api/categories/{id}/subcategories` - Get subcategories
  - `GET /api/settings/site-info` - Get site information

## Technical Requirements

### Authentication
- **Token-based authentication** using Laravel Sanctum
- **CORS configuration** for cross-origin requests
- **Token refresh mechanism** for expired tokens

### Real-time Features
- **WebSocket connection** for real-time chat
- **Push notifications** for new messages/orders
- **Live updates** for dashboard statistics

### File Storage
- **Public storage** for user-uploaded images
- **Private storage** for sensitive documents
- **CDN integration** for optimized image delivery

### API Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "meta": {
    "pagination": {},
    "filters": {}
  }
}
```

### Error Handling
```json
{
  "success": false,
  "error": "Error message",
  "errors": {
    "field": ["Validation error"]
  },
  "code": 422
}
```

## Environment Variables Required

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WEBSOCKET_URL=ws://localhost:6001
VITE_APP_URL=http://localhost:3000

# File Upload
VITE_MAX_FILE_SIZE=5242880
VITE_ALLOWED_FILE_TYPES=jpg,jpeg,png,gif

# Real-time Features
VITE_PUSHER_APP_KEY=your_pusher_key
VITE_PUSHER_APP_CLUSTER=your_cluster
```

## Priority Implementation Order

1. **Authentication APIs** - Core user management
2. **Gig Management APIs** - Product CRUD operations
3. **Search & Filtering APIs** - Product discovery
4. **Cart & Order APIs** - E-commerce functionality
5. **Dashboard APIs** - User analytics
6. **Chat APIs** - Communication features
7. **Admin APIs** - Platform management
8. **Real-time features** - WebSocket integration
9. **File upload** - Media management
10. **Notifications** - User engagement