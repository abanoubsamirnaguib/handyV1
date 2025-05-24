<?php
// Test script to check API connection

$token = "5|W0IBu24C7gQqgZ0i36QpaKYEgGJhaut4tD2m7BqLe9d956f6";
$url = "http://127.0.0.1:8000/api/users/18";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer " . $token,
    "Accept: application/json"
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "Response Code: " . $httpCode . "\n";
if ($error) {
    echo "Error: " . $error . "\n";
} else {
    echo "Response: " . $response . "\n";
}
