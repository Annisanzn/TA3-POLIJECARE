<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Hash;
use App\Models\User;

echo "=== Verifikasi Password User ===\n";

$users = User::all();

if ($users->isEmpty()) {
    echo "Tidak ada user ditemukan.\n";
    exit(1);
}

echo "Total user: " . $users->count() . "\n\n";

$testPassword = 'Password1234';
$allCorrect = true;

foreach ($users as $user) {
    echo "User: {$user->name}\n";
    echo "Email: {$user->email}\n";
    echo "Role: {$user->role}\n";
    
    // Verifikasi password
    $isValid = Hash::check($testPassword, $user->password);
    
    if ($isValid) {
        echo "✅ Password valid (cocok dengan '{$testPassword}')\n";
    } else {
        echo "❌ Password TIDAK valid (tidak cocok dengan '{$testPassword}')\n";
        $allCorrect = false;
    }
    
    echo "Password hash: " . substr($user->password, 0, 30) . "...\n";
    echo "---\n";
}

echo "\n=== Hasil Verifikasi ===\n";
if ($allCorrect) {
    echo "✅ SEMUA user telah berhasil diupdate dengan password '{$testPassword}'.\n";
    echo "Anda dapat login dengan:\n";
    foreach ($users as $user) {
        echo "  - Email: {$user->email}, Password: {$testPassword}, Role: {$user->role}\n";
    }
} else {
    echo "⚠️  Beberapa user mungkin belum terupdate dengan benar.\n";
}

echo "\nVerifikasi selesai.\n";