<?php
/**
 * Script darurat untuk menghapus cache Laravel di shared hosting tanpa terminal.
 * Jalankan file ini melalui browser: https://api.polijecare.my.id/clear-cache.php
 */

use Illuminate\Support\Facades\Artisan;

// Pastikan autoloader dimuat
require __DIR__.'/../vendor/autoload.php';

// Inisialisasi aplikasi Laravel
$app = require_once __DIR__.'/../bootstrap/app.php';

// Gunakan kernel console untuk menjalankan perintah Artisan
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

try {
    echo "<h1>Laravel Cache Clear</h1>";
    
    echo "Menghapus Route Cache... ";
    $kernel->call('route:clear');
    echo "OK<br>";
    
    echo "Menghapus Config Cache... ";
    $kernel->call('config:clear');
    echo "OK<br>";
    
    echo "Menghapus General Cache... ";
    $kernel->call('cache:clear');
    echo "OK<br>";
    
    echo "Menghapus View Cache... ";
    $kernel->call('view:clear');
    echo "OK<br>";

    echo "<br><b>Selesai! Silakan hapus file ini dari server demi keamanan.</b>";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage();
}
