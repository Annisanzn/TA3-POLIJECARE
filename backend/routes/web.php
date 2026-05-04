<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/login', function () {
    return redirect('/');
})->name('login');

Route::get('/run-migration-now', function () {
    \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
    return '<pre>' . \Illuminate\Support\Facades\Artisan::output() . '</pre>';
});

// Rute Darurat untuk hapus cache tanpa terminal
Route::get('/clear-cache-now', function () {
    \Illuminate\Support\Facades\Artisan::call('route:clear');
    \Illuminate\Support\Facades\Artisan::call('config:clear');
    \Illuminate\Support\Facades\Artisan::call('cache:clear');
    \Illuminate\Support\Facades\Artisan::call('view:clear');
    return "Semua cache telah dihapus! Silakan coba login Google lagi.";
});

// Pindahkan rute Google Auth ke sini agar lebih stabil di production
// Tetap pakai prefix 'api' agar URL tidak berubah bagi Google
Route::prefix('api')->group(function () {
    Route::get('/auth/google', [\App\Http\Controllers\GoogleAuthController::class, 'redirectToGoogle']);
    Route::get('/auth/google/callback', [\App\Http\Controllers\GoogleAuthController::class, 'handleGoogleCallback']);
});
