<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!auth()->check()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }
        
        $user = auth()->user();
        $userRole = strtolower($user->role ?? '');
        $allowedRoles = array_map(fn($r) => strtolower(trim($r)), $roles);
        
        // Check if user has one of the required roles
        if (!in_array($userRole, $allowedRoles)) {
            \Illuminate\Support\Facades\Log::warning('RoleMiddleware Access Denied', [
                'user_id' => $user->id,
                'user_role' => $user->role,
                'allowed_roles' => $roles,
                'path' => $request->path()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Forbidden - Insufficient permissions'
            ], 403);
        }
        
        return $next($request);
    }
}
