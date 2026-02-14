<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\HeroSection;
use Illuminate\Http\Request;

class HeroController extends Controller
{
    public function index()
    {
        $hero = HeroSection::first();
        
        if (!$hero) {
            return response()->json([
                'success' => false,
                'message' => 'Hero section not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $hero
        ]);
    }
}
