<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$kernel->bootstrap();

echo "Backend server is ready!\n";
echo "Available routes:\n";
echo "- GET /api/test\n";
echo "- POST /api/login\n";
echo "- GET /api/user\n";
echo "- GET /api/contact\n";
echo "- GET /api/hero\n";
echo "- GET /api/articles\n";

// Test database connection
try {
    \Illuminate\Support\Facades\DB::connection()->getPdo();
    echo "\n✅ Database connection: OK\n";
    
    // Check users
    $userCount = \App\Models\User::count();
    echo "✅ Users in database: {$userCount}\n";
    
    if ($userCount > 0) {
        echo "✅ Test users ready for login\n";
    }
} catch (\Exception $e) {
    echo "\n❌ Database connection failed: " . $e->getMessage() . "\n";
}

echo "\nTo start the server, run: php artisan serve\n";
