<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\ArticleController;
use App\Http\Controllers\API\ContactController;
use App\Http\Controllers\API\HeroController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\NewLoginController;
use App\Http\Middleware\RoleMiddleware;

Route::get('/test', function () {
    return response()->json([
        'status' => 'API OK',
    ]);
});

// Test route without authentication
Route::get('/test-users', [UserController::class, 'index']);

// Articles
Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/{slug}', [ArticleController::class, 'show']);

// Contact
Route::get('/contact', [ContactController::class, 'index']);

// Hero Section
Route::get('/hero', [HeroController::class, 'index']);

// Auth routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/login-new', [NewLoginController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // New login protected routes
    Route::post('/logout-new', [NewLoginController::class, 'logout']);
    Route::get('/user-new', [NewLoginController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // User routes
    Route::middleware(RoleMiddleware::class . ':user')->prefix('user')->group(function () {
        Route::get('/dashboard', function () {
            return response()->json([
                'success' => true,
                'message' => 'User Dashboard',
                'data' => [
                    'role' => 'user',
                    'dashboard' => 'student'
                ]
            ]);
        });
    });
    
    // Konselor routes
    Route::middleware(RoleMiddleware::class . ':konselor')->prefix('konselor')->group(function () {
        Route::get('/dashboard', function () {
            return response()->json([
                'success' => true,
                'message' => 'Konselor Dashboard',
                'data' => [
                    'role' => 'konselor',
                    'dashboard' => 'konselor'
                ]
            ]);
        });
    });
    
    // Operator routes
    Route::middleware(RoleMiddleware::class . ':operator')->prefix('operator')->group(function () {
        Route::get('/dashboard', function () {
            return response()->json([
                'success' => true,
                'message' => 'Operator Dashboard',
                'data' => [
                    'role' => 'operator',
                    'dashboard' => 'operator'
                ]
            ]);
        });

        // User management routes
        Route::apiResource('/users', UserController::class);
        Route::get('/users-stats', [UserController::class, 'stats']);
    });
});
