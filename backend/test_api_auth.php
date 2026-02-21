<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

echo "Testing API Authentication...\n";

// First, let's try to login as operator to get token
$operator = User::where('email', 'budi@polije.ac.id')->first();

if (!$operator) {
    echo "Operator user not found!\n";
    exit(1);
}

echo "Operator found: " . $operator->name . " (" . $operator->email . ")\n";

// Create a Sanctum token for testing
$token = $operator->createToken('test-token')->plainTextToken;
echo "Token created: " . substr($token, 0, 20) . "...\n\n";

// Now test the API endpoint with the token
echo "Testing /api/operator/users endpoint...\n";

// Simulate API request
use Illuminate\Http\Request;
use App\Http\Controllers\API\UserController;

$controller = new UserController();

// Create a request with authentication
$request = Request::create('/api/operator/users', 'GET', [
    'page' => 1,
    'per_page' => 10,
    'search' => '',
    'role' => 'all'
]);

// Add token to request
$request->headers->set('Authorization', 'Bearer ' . $token);

try {
    $response = $controller->index($request);
    echo "Response status: " . $response->status() . "\n";
    
    $data = json_decode($response->getContent(), true);
    
    if (isset($data['success']) && $data['success']) {
        echo "API Success!\n";
        echo "Total users: " . count($data['data']['users']) . "\n";
        
        foreach ($data['data']['users'] as $user) {
            echo "- " . $user['name'] . " (" . $user['role'] . ")\n";
        }
    } else {
        echo "API Failed: " . ($data['message'] ?? 'Unknown error') . "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}

// Also test without token
echo "\n\nTesting without token (should fail)...\n";
$requestWithoutToken = Request::create('/api/operator/users', 'GET', [
    'page' => 1,
    'per_page' => 10,
    'search' => '',
    'role' => 'all'
]);

try {
    $response = $controller->index($requestWithoutToken);
    echo "Response status without token: " . $response->status() . "\n";
} catch (Exception $e) {
    echo "Error without token: " . $e->getMessage() . "\n";
}