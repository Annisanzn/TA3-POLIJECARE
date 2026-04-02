<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use App\Http\Controllers\NewLoginController;

echo "=== Testing Bcrypt Algorithm Check ===\n";

$email = '2021001@student.polije.ac.id';
$password = 'password123';

// Ensure user exists and has non-bcrypt password
$user = User::where('email', $email)->first();
if ($user) {
    $user->password = $password; // Plain text
    $user->save();
    echo "User password set to plain text.\n";
} else {
    echo "User not found.\n";
    exit(1);
}

// Mock request
$request = new Request([
    'email' => $email,
    'password' => $password
]);

// Call controller
$controller = new NewLoginController();
$response = $controller->login($request);

echo "Response Status: " . $response->getStatusCode() . "\n";
echo "Response Body: " . $response->getContent() . "\n";

if (str_contains($response->getContent(), 'This password does not use the Bcrypt algorithm.')) {
    echo "✅ Success: Correct error message returned.\n";
} else {
    echo "❌ Failure: Wrong error message or success.\n";
}

// Fix password and test again
echo "\n=== Fixing password to Bcrypt ===\n";
$user->password = Hash::make('password');
$user->save();

$request = new Request([
    'email' => $email,
    'password' => 'password'
]);
$response = $controller->login($request);
echo "Response Status: " . $response->getStatusCode() . "\n";
echo "Response Body: " . json_encode(json_decode($response->getContent())->success) . "\n";

if (json_decode($response->getContent())->success === true) {
    echo "✅ Success: Login works after fix.\n";
} else {
    echo "❌ Failure: Login failed after fix.\n";
}
