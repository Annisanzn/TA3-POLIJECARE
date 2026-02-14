<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Handle user login
     */
    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();
        
        // Auto-assign role based on email domain
        $email = $credentials['email'];
        $role = $this->assignRoleByEmail($email);
        
        // Find user by email
        $user = User::where('email', $email)->first();
        
        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau password salah'
            ], 401);
        }
        
        // Update user role if changed
        if ($user->role !== $role) {
            $user->role = $role;
            $user->save();
        }
        
        // Create token
        $token = $user->createToken('auth-token')->plainTextToken;
        
        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'nim' => $user->nim,
            ]
        ]);
    }
    
    /**
     * Handle user logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil'
        ]);
    }
    
    /**
     * Get current user
     */
    public function user(Request $request)
    {
        return response()->json([
            'success' => true,
            'user' => [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'role' => $request->user()->role,
                'nim' => $request->user()->nim,
            ]
        ]);
    }
    
    /**
     * Auto-assign role based on email domain
     */
    private function assignRoleByEmail(string $email): string
    {
        // Student email pattern: nim@student.polije.ac.id
        if (str_contains($email, 'student.polije.ac.id')) {
            return 'user';
        }
        
        // Staff email pattern: name@polije.ac.id
        if (str_contains($email, 'polije.ac.id')) {
            return 'konselor'; // Default to konselor for staff
        }
        
        // Default fallback
        return 'user';
    }
}
