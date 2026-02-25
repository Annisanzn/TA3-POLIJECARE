<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\ArticleController;
use App\Http\Controllers\API\ContactController;
use App\Http\Controllers\API\HeroController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\ComplaintController;
use App\Http\Controllers\API\MaterialController;
use App\Http\Controllers\API\ViolenceCategoryController;
use App\Http\Controllers\API\CounselingController;
use App\Http\Controllers\API\CounselorScheduleController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\NewLoginController;
use App\Http\Controllers\API\AdminArticleController;
use App\Http\Middleware\RoleMiddleware;

Route::get('/test', function () {
    return response()->json([
        'status' => 'API OK',
    ]);
});

// Test route without authentication
Route::get('/test-users', [UserController::class, 'index']);

// Articles (public) — hanya tampil yang aktif & sudah publish, limit 6
Route::get('/articles', function () {
    try {
        $articles = \App\Models\Article::published()->latest()->limit(6)->get();
        return response()->json([
            'success' => true,
            'data'    => \App\Http\Resources\ArticleResource::collection($articles),
            'meta'    => ['total' => $articles->count()],
        ]);
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'message' => 'Gagal mengambil artikel'], 500);
    }
});
Route::get('/articles/{slug}', [ArticleController::class, 'show']);

// Contact
Route::get('/contact', [ContactController::class, 'index']);

// Hero Section
Route::get('/hero', [HeroController::class, 'index']);

// Counseling routes for testing (without auth)
Route::get('/counseling-test', [CounselingController::class, 'index']);

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

        // Complaint management routes (assigned only)
        Route::get('/complaints', [ComplaintController::class, 'index']);
        Route::get('/complaints-stats', [ComplaintController::class, 'stats']);

        // Materials management routes
        Route::get('/materials', [MaterialController::class, 'index']);
        Route::post('/materials', [MaterialController::class, 'store']);
        Route::delete('/materials/{material}', [MaterialController::class, 'destroy']);
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

        // Complaint management routes
        Route::get('/complaints', [ComplaintController::class, 'index']);
        Route::get('/complaints-stats', [ComplaintController::class, 'stats']);
        Route::patch('/complaints/{complaint}/status', [ComplaintController::class, 'updateStatus']);
        Route::patch('/complaints/{complaint}/schedule', [ComplaintController::class, 'schedule']);

        // Materials management routes
        Route::get('/materials', [MaterialController::class, 'index']);
        Route::post('/materials', [MaterialController::class, 'store']);
        Route::delete('/materials/{material}', [MaterialController::class, 'destroy']);

        // Article management routes (operator admin)
        Route::prefix('admin')->group(function () {
            Route::get('/articles', [AdminArticleController::class, 'index']);
            Route::post('/articles', [AdminArticleController::class, 'store']);
            Route::put('/articles/{id}', [AdminArticleController::class, 'update']);
            Route::post('/articles/{id}/update', [AdminArticleController::class, 'update']); // FormData fallback
            Route::delete('/articles/{id}', [AdminArticleController::class, 'destroy']);
            Route::patch('/articles/{id}/toggle', [AdminArticleController::class, 'toggle']);
        });

        // Violence categories management routes
        Route::get('/categories', [ViolenceCategoryController::class, 'index']);
        Route::post('/categories', [ViolenceCategoryController::class, 'store']);
        Route::put('/categories/{category}', [ViolenceCategoryController::class, 'update']);
        Route::delete('/categories/{category}', [ViolenceCategoryController::class, 'destroy']);

        // Counseling schedules management routes
        Route::prefix('counseling')->group(function () {
            Route::get('/', [CounselingController::class, 'index']);
            Route::get('/counselors', [CounselingController::class, 'getCounselors']);
            Route::get('/available-slots', [CounselingController::class, 'getAvailableSlots']);
            Route::post('/request', [CounselingController::class, 'store']);
            Route::put('/{id}/approve', [CounselingController::class, 'approve']);
            Route::put('/{id}/reject', [CounselingController::class, 'reject']);
            Route::put('/{id}/status', [CounselingController::class, 'updateStatus']);
            Route::get('/statistics', [CounselingController::class, 'statistics']);
        });

        // Counselor schedule management routes
        Route::prefix('counselor-schedules')->group(function () {
            Route::get('/', [CounselorScheduleController::class, 'index']);
            Route::post('/', [CounselorScheduleController::class, 'store']);
            Route::get('/{id}', [CounselorScheduleController::class, 'show']);
            Route::put('/{id}', [CounselorScheduleController::class, 'update']);
            Route::delete('/{id}', [CounselorScheduleController::class, 'destroy']);
            Route::get('/counselors/with-schedules', [CounselorScheduleController::class, 'getCounselorsWithSchedules']);
            Route::get('/{counselorId}/available-slots/{day}', [CounselorScheduleController::class, 'getAvailableSlots']);
        });
    });

    // Counseling routes for all authenticated users (role-based access handled in controller)
    Route::prefix('counseling')->group(function () {
        Route::get('/', [CounselingController::class, 'index']);
        Route::get('/counselors', [CounselingController::class, 'getCounselors']);
        Route::get('/available-slots', [CounselingController::class, 'getAvailableSlots']);
        Route::get('/statistics', [CounselingController::class, 'statistics']);
    });

    // User-specific counseling routes
    Route::middleware(RoleMiddleware::class . ':user')->prefix('counseling')->group(function () {
        Route::post('/request', [CounselingController::class, 'store']);
    });

    // Counselor-specific counseling routes
    Route::middleware(RoleMiddleware::class . ':counselor')->prefix('counseling')->group(function () {
        Route::put('/{id}/approve', [CounselingController::class, 'approve']);
        Route::put('/{id}/reject', [CounselingController::class, 'reject']);
    });
});
