<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ArticleResource;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ArticleController extends Controller
{
    /**
     * Display a listing of articles.
     */
    public function index(): JsonResponse
    {
        try {
            $articles = Article::latest()->published()->get();
            
            return response()->json([
                'success' => true,
                'message' => 'Articles retrieved successfully',
                'data' => ArticleResource::collection($articles),
                'meta' => [
                    'total' => $articles->count(),
                    'last_updated' => now()->toISOString()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve articles',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Display the specified article.
     */
    public function show(string $slug): JsonResponse
    {
        try {
            $article = Article::where('slug', $slug)->published()->first();
            
            if (!$article) {
                return response()->json([
                    'success' => false,
                    'message' => 'Article not found',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Article retrieved successfully',
                'data' => new ArticleResource($article)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve article',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}
