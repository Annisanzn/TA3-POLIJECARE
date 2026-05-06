<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class FileController extends Controller
{
    /**
     * View/Stream a file from public storage.
     * This bypasses direct static file access issues (403 Forbidden).
     */
    public function view(Request $request)
    {
        $path = $request->query('path');

        if (!$path) {
            return response()->json(['message' => 'Path is required'], 400);
        }

        // Check if file exists in the 'public' disk
        if (!Storage::disk('public')->exists($path)) {
            return response()->json(['message' => 'File not found on storage: ' . $path], 404);
        }

        $fullPath = Storage::disk('public')->path($path);

        return response()->file($fullPath);
    }
}
