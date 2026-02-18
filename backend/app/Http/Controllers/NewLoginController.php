<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class NewLoginController extends Controller
{
    /**
     * Handle new login request
     */
    public function login(Request $request)
    {
        // Debug: log incoming request
        \Log::info('New login request received', [
            'email' => $request->email,
            'ip' => $request->ip()
        ]);

        // Validate input
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $email = $request->email;
        $password = $request->password;

        // Find user by email
        $user = User::where('email', $email)->first();

        // Check if user exists
        if (!$user) {
            \Log::warning('Login failed: User not found', ['email' => $email]);
            return response()->json([
                'success' => false,
                'message' => 'Email tidak ditemukan'
            ], 401);
        }

        // Check password
        if (!Hash::check($password, $user->password)) {
            \Log::warning('Login failed: Invalid password', ['email' => $email]);
            return response()->json([
                'success' => false,
                'message' => 'Password salah'
            ], 401);
        }

        // Check if email is verified (optional, based on your requirements)
        // Commented out for testing - can be enabled later if email verification is needed
        // if ($user->email_verified_at === null) {
        //     \Log::warning('Login failed: Email not verified', ['email' => $email]);
        //     return response()->json([
        //         'success' => false,
        //         'message' => 'Akun belum diverifikasi. Silakan verifikasi email terlebih dahulu.'
        //     ], 401);
        // }

        // Create token using Sanctum
        try {
            $token = $user->createToken('auth-token-new')->plainTextToken;
            
            \Log::info('Login successful', [
                'user_id' => $user->id,
                'email' => $user->email,
                'role' => $user->role
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Login berhasil',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'nim' => $user->nim,
                ],
                'token' => $token
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Token creation failed', [
                'error' => $e->getMessage(),
                'user_id' => $user->id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat token autentikasi'
            ], 500);
        }
    }

    /**
     * Handle logout
     */
    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();
            
            \Log::info('Logout successful', [
                'user_id' => $request->user()->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Logout berhasil'
            ]);
        } catch (\Exception $e) {
            \Log::error('Logout failed', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal logout'
            ], 500);
        }
    }

    /**
     * Get current user
     */
    public function user(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak terautentikasi'
            ], 401);
        }

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'nim' => $user->nim,
            ]
        ]);
    }
}