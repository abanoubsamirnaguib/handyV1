<?php
// Create a test user in the database

// Include app bootstrap
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

// Start the application
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Import the User model
use App\Models\User;

// Check if test user already exists
$existingUser = User::where('email', 'test@example.com')->first();

if ($existingUser) {
    echo "Test user already exists with ID: " . $existingUser->id . "\n";
    echo "Email: " . $existingUser->email . "\n";
    echo "Password: password\n";
} else {
    // Create test user
    $user = new User();
    $user->name = 'Test User';
    $user->email = 'test@example.com';
    $user->password = bcrypt('password');
    $user->role = 'admin';
    $user->save();

    echo "Created test user with ID: " . $user->id . "\n";
    echo "Email: " . $user->email . "\n";
    echo "Password: password\n";
}
