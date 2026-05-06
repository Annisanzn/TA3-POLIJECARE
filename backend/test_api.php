<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$request = Illuminate\Http\Request::create('/api/operator/categories', 'GET', ['per_page' => 10]);
// Simulate authentication for operator
$user = App\Models\User::where('role', 'operator')->first();
if ($user) {
    $request->setUserResolver(function () use ($user) {
        return $user;
    });
    // For Sanctum/Auth
    auth()->login($user);
}

try {
    $response = $app->handle($request);
    echo $response->getContent();
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n" . $e->getTraceAsString();
}
