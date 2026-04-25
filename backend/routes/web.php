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
