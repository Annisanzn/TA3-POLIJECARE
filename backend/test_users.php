<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

echo "Testing User Model...\n";

// Get all users
$users = User::select('id', 'name', 'email', 'role', 'nim', 'email_verified_at', 'created_at')->get();

echo "Total users: " . $users->count() . "\n\n";

foreach ($users as $user) {
    echo "ID: " . $user->id . "\n";
    echo "Name: " . $user->name . "\n";
    echo "Email: " . $user->email . "\n";
    echo "Role: " . $user->role . "\n";
    echo "NIM: " . ($user->nim ?: 'null') . "\n";
    echo "Email Verified: " . ($user->email_verified_at ? 'Yes' : 'No') . "\n";
    echo "Created: " . $user->created_at . "\n";
    echo "------------------------\n";
}

// Test UserController index method
echo "\n\nTesting UserController index method...\n";

use App\Http\Controllers\API\UserController;
use Illuminate\Http\Request;

$controller = new UserController();
$request = new Request([
    'page' => 1,
    'per_page' => 10,
    'search' => '',
    'role' => 'all'
]);

try {
    $response = $controller->index($request);
    echo "Response status: " . $response->status() . "\n";
    echo "Response content: \n";
    print_r(json_decode($response->getContent(), true));
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}