<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/login', function () {
    return redirect('/');
})->name('login');

Route::get('/run-migration-now', function () {
    try {
        \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
        return '<h1>Migrasi Berhasil!</h1><pre>' . \Illuminate\Support\Facades\Artisan::output() . '</pre>';
    } catch (\Exception $e) {
        return '<h1>Migrasi Gagal!</h1><pre>' . $e->getMessage() . '</pre>';
    }
});

// Link storage tanpa terminal
Route::get('/storage-link-now', function () {
    try {
        \Illuminate\Support\Facades\Artisan::call('storage:link');
        return '<h1>Storage Link Berhasil Dibuat!</h1><pre>' . \Illuminate\Support\Facades\Artisan::output() . '</pre>';
    } catch (\Exception $e) {
        return '<h1>Gagal membuat Storage Link!</h1><p>Mungkin folder sudah ada.</p><pre>' . $e->getMessage() . '</pre>';
    }
});

// Optimasi production tanpa terminal
Route::get('/optimize-now', function () {
    \Illuminate\Support\Facades\Artisan::call('config:cache');
    \Illuminate\Support\Facades\Artisan::call('route:cache');
    \Illuminate\Support\Facades\Artisan::call('view:cache');
    return "<h1>Aplikasi telah di-optimasi!</h1><p>Config, Route, dan View cache telah diperbarui.</p>";
});

// Rute Darurat untuk hapus cache tanpa terminal
Route::get('/clear-cache-now', function () {
    \Illuminate\Support\Facades\Artisan::call('route:clear');
    \Illuminate\Support\Facades\Artisan::call('config:clear');
    \Illuminate\Support\Facades\Artisan::call('cache:clear');
    \Illuminate\Support\Facades\Artisan::call('view:clear');
    return "<h1>Semua cache telah dihapus!</h1>";
});

// Pindahkan rute Google Auth ke sini agar lebih stabil di production
// Tetap pakai prefix 'api' agar URL tidak berubah bagi Google
Route::prefix('api')->group(function () {
    Route::get('/auth/google', [\App\Http\Controllers\GoogleAuthController::class, 'redirectToGoogle']);
    Route::get('/auth/google/callback', [\App\Http\Controllers\GoogleAuthController::class, 'handleGoogleCallback']);
});
