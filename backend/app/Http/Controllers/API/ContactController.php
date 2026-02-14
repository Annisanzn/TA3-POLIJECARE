<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\ContactInfoResource;
use App\Models\ContactInfo;
use Illuminate\Http\JsonResponse;

class ContactController extends Controller
{
    /**
     * Display the contact information.
     */
    public function index(): JsonResponse
    {
        try {
            $contact = ContactInfo::first();
            
            if (!$contact) {
                return response()->json([
                    'success' => false,
                    'message' => 'Contact information not found',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Contact information retrieved successfully',
                'data' => new ContactInfoResource($contact)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve contact information',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}
