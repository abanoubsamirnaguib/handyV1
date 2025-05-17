<?php
// This file is used for debugging the user profile update functionality

// Include the Composer autoloader
require __DIR__ . '/vendor/autoload.php';

// Load the environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Simple helper to make cURL requests
function make_request($method, $url, $data = [], $token = null) {
    $curl = curl_init();
    
    $headers = [
        'Accept: application/json',
        'Content-Type: application/json',
    ];
    
    if ($token) {
        $headers[] = "Authorization: Bearer $token";
    }
    
    curl_setopt_array($curl, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => "",
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
    ]);
    
    if ($method === 'POST' || $method === 'PUT' || $method === 'PATCH') {
        curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($curl);
    $status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $error = curl_error($curl);
    
    curl_close($curl);
    
    return [
        'status' => $status,
        'body' => $response ? json_decode($response, true) : null,
        'error' => $error,
    ];
}

// Define tests

// 1. Test debugging route
echo "Testing debug route...\n";
$debug_response = make_request('GET', 'http://localhost:8000/api/test');
echo "Status: " . $debug_response['status'] . "\n";
echo "Response: " . json_encode($debug_response['body'], JSON_PRETTY_PRINT) . "\n\n";

// 2. Test login to get token
echo "Testing login...\n";
$login_response = make_request('POST', 'http://localhost:8000/api/login', [
    'email' => 'admin@example.com', // Replace with a valid user
    'password' => 'password',  // Replace with the correct password
]);
echo "Status: " . $login_response['status'] . "\n";

// Check if login succeeded
if ($login_response['status'] === 200 && isset($login_response['body']['token'])) {
    $token = $login_response['body']['token'];
    $user_id = $login_response['body']['user']['id'];
    echo "Login successful. Token: " . substr($token, 0, 10) . "...\n";
    echo "User ID: " . $user_id . "\n\n";
    
    // 3. Test getting user profile
    echo "Testing get user profile...\n";
    $profile_response = make_request('GET', "http://localhost:8000/api/users/{$user_id}", [], $token);
    echo "Status: " . $profile_response['status'] . "\n";
    echo "Response: " . json_encode($profile_response['body'], JSON_PRETTY_PRINT) . "\n\n";
    
    // 4. Test updating user profile
    echo "Testing update user profile...\n";
    $update_data = [
        'name' => 'Updated User',
        'bio' => 'This is an updated bio for testing',
        'location' => 'Test Location',
        'skills' => ['PHP', 'Laravel', 'React']
    ];
    $update_response = make_request('PUT', "http://localhost:8000/api/users/{$user_id}", $update_data, $token);
    echo "Status: " . $update_response['status'] . "\n";
    echo "Response: " . json_encode($update_response['body'], JSON_PRETTY_PRINT) . "\n\n";
    
    // 5. Verify the update worked
    echo "Verifying update with debug endpoint...\n";
    $verify_response = make_request('GET', "http://localhost:8000/api/debug/users/{$user_id}");
    echo "Status: " . $verify_response['status'] . "\n";
    echo "Response: " . json_encode($verify_response['body'], JSON_PRETTY_PRINT) . "\n\n";
    
    // 6. Test auth-test endpoint
    echo "Testing auth-test endpoint...\n";
    $auth_test_response = make_request('GET', "http://localhost:8000/api/debug/auth-test", [], $token);
    echo "Status: " . $auth_test_response['status'] . "\n";
    echo "Response: " . json_encode($auth_test_response['body'], JSON_PRETTY_PRINT) . "\n\n";
    
} else {
    echo "Login failed: " . json_encode($login_response['body']) . "\n";
}
