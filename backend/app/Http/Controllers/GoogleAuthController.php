<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    /**
     * Redirect the user to the Google authentication page.
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    /**
     * Handle the callback from Google.
     */
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            
            // Check allowed domains
            $email = $googleUser->getEmail();
            if (!str_ends_with($email, '@polije.ac.id') && !str_ends_with($email, '@student.polije.ac.id')) {
                // Return generic redirect with error so frontend can catch it
                return redirect(config('app.frontend_url', 'http://localhost:5173') . '/login-new?error=domain_not_allowed');
            }

            // Determine role
            $role = str_ends_with($email, '@student.polije.ac.id') ? 'user' : 'konselor';
            
            // Extract NIM if student
            $nim = null;
            if ($role === 'user') {
                $nim = explode('@', $email)[0];
            }

            // Find or create user
            $user = User::where('email', $email)->first();

            if ($user) {
                // Update existing user with google info if not present
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                ]);
            } else {
                // Create new user
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $email,
                    'role' => $role,
                    'nim' => $nim,
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                    'password' => null, // No password for SSO
                    'email_verified_at' => now(), // Auto verify since from Google
                ]);
            }

            // Create token
            $token = $user->createToken('auth-token-sso')->plainTextToken;

            // Redirect back to frontend callback with token
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return redirect($frontendUrl . '/auth/google/callback?token=' . $token);

        } catch (\Exception $e) {
            \Log::error('Google SSO Error: ' . $e->getMessage());
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return redirect($frontendUrl . '/login-new?error=sso_failed');
        }
    }
}
