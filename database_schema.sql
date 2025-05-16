-- Database Schema for Herafty Platform (حرفتي)
-- A marketplace for handmade crafts and artisanal products

-- Enable strict SQL mode
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';

-- Create database
CREATE DATABASE IF NOT EXISTS herafty CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE herafty;

-- ******************************************
-- USERS AND AUTHENTICATION TABLES
-- ******************************************

-- Users table (for all types of users)
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Hashed password
    name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'seller', 'buyer') NOT NULL DEFAULT 'buyer',
    status ENUM('active', 'inactive', 'suspended', 'pending') NOT NULL DEFAULT 'active',
    avatar VARCHAR(255) DEFAULT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    registration_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role),
    INDEX idx_user_status (status)
) ENGINE=InnoDB;

-- Seller profiles for users with 'seller' role
CREATE TABLE sellers (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    bio TEXT,
    location VARCHAR(100),
    member_since DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INT DEFAULT 0,
    completed_orders INT DEFAULT 0,
    response_time VARCHAR(50) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_seller_rating (rating),
    INDEX idx_seller_location (location)
) ENGINE=InnoDB;

-- Seller skills table
CREATE TABLE seller_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    seller_id VARCHAR(36) NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_seller_skill (seller_id, skill_name),
    INDEX idx_seller_skills (skill_name)
) ENGINE=InnoDB;

-- ******************************************
-- PRODUCT CATALOG TABLES
-- ******************************************

-- Categories table
CREATE TABLE categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT NULL,
    parent_id VARCHAR(36) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_category_parent (parent_id)
) ENGINE=InnoDB;

-- Products/Gigs table
CREATE TABLE products (
    id VARCHAR(36) PRIMARY KEY,
    seller_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category_id VARCHAR(36) NOT NULL,
    delivery_time VARCHAR(50) DEFAULT NULL,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INT DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'inactive', 'pending_review', 'rejected') NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_product_seller (seller_id),
    INDEX idx_product_category (category_id),
    INDEX idx_product_featured (featured),
    INDEX idx_product_status (status),
    INDEX idx_product_price (price),
    INDEX idx_product_rating (rating),
    FULLTEXT INDEX ft_product_search (title, description)
) ENGINE=InnoDB;

-- Product images
CREATE TABLE product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    display_order INT DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_images (product_id)
) ENGINE=InnoDB;

-- Product tags
CREATE TABLE product_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    tag_name VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_tag (product_id, tag_name),
    INDEX idx_product_tags (tag_name)
) ENGINE=InnoDB;

-- ******************************************
-- ORDERS AND TRANSACTIONS TABLES
-- ******************************************

-- Orders table
CREATE TABLE orders (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    seller_id VARCHAR(36) NOT NULL,
    status ENUM('pending', 'paid', 'in_progress', 'completed', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending',
    total_price DECIMAL(10,2) NOT NULL,
    order_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delivery_date DATETIME DEFAULT NULL,
    requirements TEXT DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
    INDEX idx_order_user (user_id),
    INDEX idx_order_seller (seller_id),
    INDEX idx_order_status (status),
    INDEX idx_order_date (order_date)
) ENGINE=InnoDB;

-- Order items table
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_order_item_order (order_id),
    INDEX idx_order_item_product (product_id)
) ENGINE=InnoDB;

-- Transactions table
CREATE TABLE transactions (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    transaction_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    transaction_data JSON DEFAULT NULL, -- Stores payment gateway response
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_transaction_order (order_id),
    INDEX idx_transaction_user (user_id),
    INDEX idx_transaction_status (status)
) ENGINE=InnoDB;

-- ******************************************
-- REVIEWS AND RATINGS TABLES
-- ******************************************

-- Reviews table
CREATE TABLE reviews (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    review_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('published', 'hidden', 'pending') NOT NULL DEFAULT 'published',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product_review (user_id, product_id),
    INDEX idx_review_product (product_id),
    INDEX idx_review_rating (rating)
) ENGINE=InnoDB;

-- ******************************************
-- MESSAGING AND CHAT TABLES
-- ******************************************

-- Conversations table
CREATE TABLE conversations (
    id VARCHAR(36) PRIMARY KEY,
    buyer_id VARCHAR(36) NOT NULL,
    seller_id VARCHAR(36) NOT NULL,
    last_message_time DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_buyer_seller (buyer_id, seller_id),
    INDEX idx_conversation_buyer (buyer_id),
    INDEX idx_conversation_seller (seller_id)
) ENGINE=InnoDB;

-- Messages table
CREATE TABLE messages (
    id VARCHAR(36) PRIMARY KEY,
    conversation_id VARCHAR(36) NOT NULL,
    sender_id VARCHAR(36) NOT NULL,
    recipient_id VARCHAR(36) NOT NULL,
    message_text TEXT NOT NULL,
    read_status BOOLEAN DEFAULT FALSE,
    message_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_message_conversation (conversation_id),
    INDEX idx_message_sender (sender_id),
    INDEX idx_message_recipient (recipient_id),
    INDEX idx_message_time (message_time)
) ENGINE=InnoDB;

-- ******************************************
-- MESSAGE ATTACHMENTS TABLE
-- ******************************************

CREATE TABLE message_attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message_id VARCHAR(36) NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) DEFAULT NULL,
    uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    INDEX idx_attachment_message (message_id)
) ENGINE=InnoDB;

-- ******************************************
-- SYSTEM SETTINGS AND CONFIGURATION TABLES
-- ******************************************

-- Site settings table
CREATE TABLE site_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Insert default site settings
INSERT INTO site_settings (setting_key, setting_value) VALUES
('site_name', 'منصة الصنايعي'),
('site_description', 'منصة تسويق المنتجات الحرفية اليدوية'),
('logo_url', '/logo.png'),
('favicon_url', '/favicon.ico'),
('maintenance_mode', 'false'),
('registrations_enabled', 'true'),
('default_language', 'ar'),
('default_currency', 'EGP');

-- ******************************************
-- CART AND WISHLIST TABLES
-- ******************************************

-- Shopping cart table
CREATE TABLE cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product_cart (user_id, product_id),
    INDEX idx_cart_user (user_id)
) ENGINE=InnoDB;

-- Wishlist table
CREATE TABLE wishlist_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product_wishlist (user_id, product_id),
    INDEX idx_wishlist_user (user_id)
) ENGINE=InnoDB;

-- ******************************************
-- ACTIVITY LOGS AND NOTIFICATIONS TABLES
-- ******************************************

-- Activity logs table
CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) DEFAULT NULL,
    activity_type VARCHAR(100) NOT NULL,
    activity_description TEXT NOT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_activity_user (user_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_activity_time (created_at)
) ENGINE=InnoDB;

-- Notifications table
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    notification_type VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    link VARCHAR(255) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notification_user (user_id),
    INDEX idx_notification_read (is_read),
    INDEX idx_notification_time (created_at)
) ENGINE=InnoDB;

-- ******************************************
-- ORDER HISTORY TABLE
-- ******************************************

CREATE TABLE order_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    status ENUM('pending', 'paid', 'in_progress', 'completed', 'cancelled', 'refunded') NOT NULL,
    action_by VARCHAR(36) DEFAULT NULL, -- user or admin who performed the action
    action_type VARCHAR(100) DEFAULT NULL, -- e.g., status_change, note, refund, etc.
    note TEXT DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (action_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_order_history_order (order_id),
    INDEX idx_order_history_status (status)
) ENGINE=InnoDB;

-- ******************************************
-- VIEWS FOR COMMON OPERATIONS
-- ******************************************

-- View for seller performance metrics
CREATE VIEW seller_performance AS
SELECT 
    s.id AS seller_id,
    u.name AS seller_name,
    s.rating,
    s.review_count,
    s.completed_orders,
    COUNT(DISTINCT p.id) AS total_products,
    COUNT(DISTINCT o.id) AS total_orders,
    SUM(o.total_price) AS total_revenue,
    AVG(TIMESTAMPDIFF(DAY, o.order_date, o.delivery_date)) AS avg_delivery_days
FROM 
    sellers s
    JOIN users u ON s.user_id = u.id
    LEFT JOIN products p ON s.id = p.seller_id
    LEFT JOIN orders o ON s.id = o.seller_id AND o.status = 'completed'
GROUP BY 
    s.id, u.name, s.rating, s.review_count, s.completed_orders;

-- View for product listings with category and seller info
CREATE VIEW product_listings AS
SELECT 
    p.id,
    p.title,
    p.description,
    p.price,
    p.rating,
    p.review_count,
    p.featured,
    p.delivery_time,
    p.status,
    c.name AS category_name,
    c.id AS category_id,
    s.id AS seller_id,
    u.name AS seller_name,
    u.avatar AS seller_avatar,
    s.rating AS seller_rating,
    s.location AS seller_location,
    GROUP_CONCAT(DISTINCT pt.tag_name) AS tags,
    GROUP_CONCAT(DISTINCT pi.image_url ORDER BY pi.display_order) AS images
FROM 
    products p
    JOIN categories c ON p.category_id = c.id
    JOIN sellers s ON p.seller_id = s.id
    JOIN users u ON s.user_id = u.id
    LEFT JOIN product_tags pt ON p.id = pt.product_id
    LEFT JOIN product_images pi ON p.id = pi.product_id
GROUP BY 
    p.id, p.title, p.description, p.price, p.rating, p.review_count, 
    p.featured, p.delivery_time, p.status, c.name, c.id, s.id, 
    u.name, u.avatar, s.rating, s.location;

-- View for order summary with product and buyer/seller details
CREATE VIEW order_summary AS
SELECT 
    o.id AS order_id,
    o.status,
    o.total_price,
    o.order_date,
    o.delivery_date,
    o.requirements,
    u_buyer.id AS buyer_id,
    u_buyer.name AS buyer_name,
    u_buyer.avatar AS buyer_avatar,
    s.id AS seller_id,
    u_seller.name AS seller_name,
    u_seller.avatar AS seller_avatar,
    oi.product_id,
    p.title AS product_title,
    oi.quantity,
    oi.price AS item_price,
    oi.subtotal
FROM 
    orders o
    JOIN users u_buyer ON o.user_id = u_buyer.id
    JOIN sellers s ON o.seller_id = s.id
    JOIN users u_seller ON s.user_id = u_seller.id
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id;
