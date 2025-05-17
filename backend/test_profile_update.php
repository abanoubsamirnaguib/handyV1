<?php
// This is a simple test script to test user profile update

// Include autoloader
require __DIR__ . '/vendor/autoload.php';

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

// Function to login and get token
function login($email, $password) {
    $client = new Client();
    
    try {
        $response = $client->post('http://localhost:8000/api/login', [
            'json' => [
                'email' => $email,
                'password' => $password
            ],
            'headers' => [
                'Accept' => 'application/json',
                'Content-Type' => 'application/json'
            ]
        ]);
        
        $data = json_decode($response->getBody(), true);
        return $data['token'] ?? null;
    } catch (RequestException $e) {
        echo "Login Error: " . $e->getMessage() . "\n";
        if ($e->hasResponse()) {
            echo $e->getResponse()->getBody() . "\n";
        }
        return null;
    }
}

// Function to get user details
function getUserDetails($id, $token = null) {
    $client = new Client();
    $headers = ['Accept' => 'application/json'];
    
    if ($token) {
        $headers['Authorization'] = 'Bearer ' . $token;
    }
    
    try {
        $response = $client->get("http://localhost:8000/api/users/{$id}", [
            'headers' => $headers
        ]);
        
        return json_decode($response->getBody(), true);
    } catch (RequestException $e) {
        echo "Get User Error: " . $e->getMessage() . "\n";
        if ($e->hasResponse()) {
            echo $e->getResponse()->getBody() . "\n";
        }
        return null;
    }
}

// Function to update user profile
function updateUserProfile($id, $data, $token) {
    $client = new Client();
    
    try {
        $response = $client->put("http://localhost:8000/api/users/{$id}", [
            'json' => $data,
            'headers' => [
                'Authorization' => 'Bearer ' . $token,
                'Accept' => 'application/json',
                'Content-Type' => 'application/json'
            ]
        ]);
        
        return json_decode($response->getBody(), true);
    } catch (RequestException $e) {
        echo "Update User Error: " . $e->getMessage() . "\n";
        if ($e->hasResponse()) {
            echo $e->getResponse()->getBody() . "\n";
        }
        return null;
    }
}

// Credentials - replace with actual values
$email = 'test@example.com';
$password = 'password';

// Step 1: Login
echo "Attempting to login as {$email}...\n";
$token = login($email, $password);

if (!$token) {
    die("Failed to get token. Cannot proceed with test.\n");
}

echo "Login successful! Token: " . substr($token, 0, 10) . "...\n";

// Step 2: Get current user details
echo "\nGetting current user details...\n";
$user = getUserDetails(19, $token); // Using the ID from create_test_user.php

if (!$user) {
    die("Failed to get user details. Cannot proceed with test.\n");
}

echo "Current user details:\n";
echo "ID: {$user['id']}\n";
echo "Name: {$user['name']}\n";
echo "Email: {$user['email']}\n";
echo "Bio: " . ($user['bio'] ?? 'Not set') . "\n";
echo "Location: " . ($user['location'] ?? 'Not set') . "\n";
echo "Skills: " . (isset($user['skills']) ? json_encode($user['skills']) : 'Not set') . "\n";

// Step 3: Update user profile
echo "\nUpdating user profile...\n";
$updateData = [
    'name' => $user['name'], // Keep the same name
    'bio' => 'This is an updated biography for testing',
    'location' => 'Test City, Test Country',
    'skills' => ['PHP', 'Laravel', 'API Development', 'React']
];

$updatedUser = updateUserProfile($user['id'], $updateData, $token);

if (!$updatedUser) {
    die("Failed to update user profile.\n");
}

echo "Profile update successful!\n";

// Step 4: Verify the changes
echo "\nVerifying updated user details...\n";
$verifiedUser = getUserDetails($user['id'], $token);

if (!$verifiedUser) {
    die("Failed to get updated user details.\n");
}

echo "Updated user details:\n";
echo "ID: {$verifiedUser['id']}\n";
echo "Name: {$verifiedUser['name']}\n";
echo "Email: {$verifiedUser['email']}\n";
echo "Bio: " . ($verifiedUser['bio'] ?? 'Not set') . "\n";
echo "Location: " . ($verifiedUser['location'] ?? 'Not set') . "\n";
echo "Skills: " . (isset($verifiedUser['skills']) ? json_encode($verifiedUser['skills']) : 'Not set') . "\n";

// Compare before and after
echo "\nComparison of changes:\n";
echo "Bio: " . ($user['bio'] ?? 'Not set') . " => " . ($verifiedUser['bio'] ?? 'Not set') . "\n";
echo "Location: " . ($user['location'] ?? 'Not set') . " => " . ($verifiedUser['location'] ?? 'Not set') . "\n";
echo "Skills: " . (isset($user['skills']) ? json_encode($user['skills']) : 'Not set') . " => " . 
      (isset($verifiedUser['skills']) ? json_encode($verifiedUser['skills']) : 'Not set') . "\n";

echo "\nTest completed!\n";
