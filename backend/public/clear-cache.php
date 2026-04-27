<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;

/**
 * Script ini digunakan untuk membersihkan cache dan setup link di hosting tanpa terminal.
 * CARA PAKAI: 
 * 1. Upload file ini ke folder 'backend/public/' di server.
 * 2. Buka di browser: https://polijecare.my.id/api/clear-cache.php 
 *    (Atau sesuaikan dengan jalur file Anda)
 * 3. Hapus file ini setelah selesai demi keamanan.
 */

// Load Laravel Framework
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

echo "<h1>🛠 PolijeCare Maintenance Script</h1>";
echo "<ul>";

try {
    // 1. Clear Cache
    Artisan::call('config:clear');
    echo "<li>✅ Config Clear: " . Artisan::output() . "</li>";

    Artisan::call('route:clear');
    echo "<li>✅ Route Clear: " . Artisan::output() . "</li>";

    Artisan::call('cache:clear');
    echo "<li>✅ Cache Clear: " . Artisan::output() . "</li>";

    Artisan::call('view:clear');
    echo "<li>✅ View Clear: " . Artisan::output() . "</li>";

    // 2. Storage Link
    Artisan::call('storage:link');
    echo "<li>✅ Storage Link: " . Artisan::output() . "</li>";

    // 3. Create API Symlink (Sangat penting agar rute /api tidak 404)
    // Asumsi: File ini ada di public_html/backend/public/
    // Kita ingin membuat link 'api' di folder utama (public_html) ke folder ini.
    $publicPath = __DIR__;
    $rootPath = dirname(dirname($publicPath)); // Naik 2 level ke public_html
    $apiShortcut = $rootPath . '/api';

    if (!file_exists($apiShortcut)) {
        if (symlink($publicPath, $apiShortcut)) {
            echo "<li>✅ Symbolic Link 'api' berhasil dibuat di root folder!</li>";
        } else {
            echo "<li>❌ Gagal membuat Symbolic Link 'api'. Silakan buat folder manual bernama 'api' di root lalu isi dengan file .htaccess khusus.</li>";
        }
    } else {
        echo "<li>ℹ️ Symbolic Link 'api' sudah ada.</li>";
    }

} catch (\Exception $e) {
    echo "<li>❌ Terjadi Error: " . $e->getMessage() . "</li>";
}

echo "</ul>";
echo "<p><strong>PENTING: Segera hapus file ini dari server setelah berhasil!</strong></p>";
