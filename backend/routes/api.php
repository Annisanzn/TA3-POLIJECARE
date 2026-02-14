<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\HeroController;

Route::get('/test', function () {
    return response()->json([
        'status' => 'API OK',
    ]);
});

// Articles
Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/{slug}', [ArticleController::class, 'show']);

// Contact
Route::get('/contact', [ContactController::class, 'index']);

// Hero Section
Route::get('/hero', [HeroController::class, 'index']);
