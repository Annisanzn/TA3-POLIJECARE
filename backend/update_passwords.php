<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Hash;
use App\Models\User;

echo "=== Update Password untuk Semua User ===\n";

// Ambil semua user
$users = User::all();

if ($users->isEmpty()) {
    echo "Tidak ada user ditemukan di database.\n";
    exit(1);
}

echo "Menemukan " . $users->count() . " user:\n";

$newPassword = 'Password1234';
$hashedPassword = Hash::make($newPassword);

$updatedCount = 0;

foreach ($users as $user) {
    echo "  - {$user->name} ({$user->email}) - role: {$user->role}\n";
    
    // Update password
    $user->password = $hashedPassword;
    $user->save();
    
    $updatedCount++;
}

echo "\n✅ Berhasil mengupdate password untuk {$updatedCount} user.\n";
echo "Password baru untuk semua user: '{$newPassword}'\n";
echo "Password sudah di-hash dengan bcrypt.\n\n";

// Tampilkan informasi login untuk testing
echo "=== Informasi Login ===\n";
foreach ($users as $user) {
    echo "Email: {$user->email}\n";
    echo "Password: {$newPassword}\n";
    echo "Role: {$user->role}\n";
    echo "---\n";
}

echo "\nSelesai. Anda sekarang bisa login dengan password '{$newPassword}' untuk semua akun.\n";