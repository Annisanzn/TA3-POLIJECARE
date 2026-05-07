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
        
        // Check if user exists
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Email tidak ditemukan'
            ], 401);
        }
        
        // Check if email is verified
        if ($user->email_verified_at === null) {
            return response()->json([
                'success' => false,
                'message' => 'Akun belum diverifikasi. Silakan verifikasi email terlebih dahulu.'
            ], 401);
        }
        
        // Check if password hash algorithm is not Bcrypt
        $hashInfo = password_get_info($user->password);
        if ($hashInfo['algoName'] !== 'bcrypt') {
            return response()->json([
                'success' => false,
                'message' => 'This password does not use the Bcrypt algorithm.'
            ], 401);
        }
        
        // Check password
        if (!Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Password salah'
            ], 401);
        }
        
        // Role is managed in database, no automatic overwriting here

        
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
                'semester' => $user->semester,
                'phone' => $user->phone,
                'gender' => $user->gender,
                'unit' => $user->unit,
                'prodi' => $user->prodi,
                'bio' => $user->bio,
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
        $user = User::find($request->user()->id);
        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'nim' => $user->nim,
                'semester' => $user->semester,
                'phone' => $user->phone,
                'gender' => $user->gender,
                'unit' => $user->unit,
                'prodi' => $user->prodi,
                'bio' => $user->bio,
            ]
        ]);
    }
    
    /**
     * Auto-assign role based on email domain
     */
    private function assignRoleByEmail(string $email): string
    {
        // Default to 'user' for all new registrations or role determinations
        // Privileged roles (operator, admin, konselor) must be set via database/admin panel
        return 'user';
    }
}
