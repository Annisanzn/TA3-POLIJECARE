# Testing Sistem Login Baru

## 📋 Test Cases untuk Postman

### 1. Test Case: Login Success
**Request:**
```http
POST http://127.0.0.1:8000/api/login-new
Content-Type: application/json

{
  "email": "2021001@student.polije.ac.id",
  "password": "password"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Login berhasil",
  "user": {
    "id": 1,
    "name": "Annisa",
    "email": "2021001@student.polije.ac.id",
    "role": "admin",
    "nim": "2021001"
  },
  "token": "sanctum_token_here"
}
```

**Checks:**
- ✅ Status code: 200
- ✅ `success: true`
- ✅ `message` tidak kosong
- ✅ `user` object lengkap
- ✅ `token` string tidak kosong

### 2. Test Case: Invalid Email
**Request:**
```http
POST http://127.0.0.1:8000/api/login-new
Content-Type: application/json

{
  "email": "nonexistent@example.com",
  "password": "password"
}
```

**Expected Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Email tidak ditemukan"
}
```

**Checks:**
- ✅ Status code: 401
- ✅ `success: false`
- ✅ `message` jelas: "Email tidak ditemukan"
- ❌ Tidak ada field `undefined`

### 3. Test Case: Wrong Password
**Request:**
```http
POST http://127.0.0.1:8000/api/login-new
Content-Type: application/json

{
  "email": "2021001@student.polije.ac.id",
  "password": "wrongpassword"
}
```

**Expected Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Password salah"
}
```

**Checks:**
- ✅ Status code: 401
- ✅ `success: false`
- ✅ `message` jelas: "Password salah"
- ❌ Tidak ada field `undefined`

### 4. Test Case: Missing Email
**Request:**
```http
POST http://127.0.0.1:8000/api/login-new
Content-Type: application/json

{
  "password": "password"
}
```

**Expected Response (422 Unprocessable Entity):**
```json
{
  "success": false,
  "message": "Validasi gagal",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

**Checks:**
- ✅ Status code: 422
- ✅ `success: false`
- ✅ `message` jelas
- ✅ `errors` object dengan detail

### 5. Test Case: Invalid Email Format
**Request:**
```http
POST http://127.0.0.1:8000/api/login-new
Content-Type: application/json

{
  "email": "invalid-email",
  "password": "password"
}
```

**Expected Response (422 Unprocessable Entity):**
```json
{
  "success": false,
  "message": "Validasi gagal",
  "errors": {
    "email": ["The email must be a valid email address."]
  }
}
```

**Checks:**
- ✅ Status code: 422
- ✅ `success: false`
- ✅ Validation errors jelas

### 6. Test Case: Empty Request
**Request:**
```http
POST http://127.0.0.1:8000/api/login-new
Content-Type: application/json

{}
```

**Expected Response (422 Unprocessable Entity):**
```json
{
  "success": false,
  "message": "Validasi gagal",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password field is required."]
  }
}
```

## 🧪 Automated Testing dengan PHPUnit

### Test File: `tests/Feature/NewLoginTest.php`
```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class NewLoginTest extends TestCase
{
    /** @test */
    public function it_returns_success_with_valid_credentials()
    {
        // Create test user
        $user = User::factory()->create([
            'email' => 'test@student.polije.ac.id',
            'password' => Hash::make('password123'),
            'role' => 'user',
            'email_verified_at' => now(),
        ]);

        // Make login request
        $response = $this->postJson('/api/login-new', [
            'email' => 'test@student.polije.ac.id',
            'password' => 'password123',
        ]);

        // Assert response
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'user' => ['id', 'name', 'email', 'role', 'nim'],
                'token'
            ])
            ->assertJson([
                'success' => true,
                'message' => 'Login berhasil',
            ]);
    }

    /** @test */
    public function it_returns_error_for_invalid_email()
    {
        $response = $this->postJson('/api/login-new', [
            'email' => 'nonexistent@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Email tidak ditemukan'
            ]);
    }

    /** @test */
    public function it_returns_error_for_wrong_password()
    {
        $user = User::factory()->create([
            'email' => 'test2@student.polije.ac.id',
            'password' => Hash::make('correctpassword'),
            'email_verified_at' => now(),
        ]);

        $response = $this->postJson('/api/login-new', [
            'email' => 'test2@student.polije.ac.id',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Password salah'
            ]);
    }

    /** @test */
    public function it_validates_required_fields()
    {
        $response = $this->postJson('/api/login-new', []);

        $response->assertStatus(422)
            ->assertJsonStructure([
                'success',
                'message',
                'errors' => ['email', 'password']
            ]);
    }
}
```

## 🔍 Frontend Testing

### Test Scenario 1: Successful Login
1. Navigate to `http://localhost:5173/login-new`
2. Enter valid email: `2021001@student.polije.ac.id`
3. Enter valid password: `password`
4. Click Login button
5. **Expected:** Redirect to appropriate dashboard based on role
6. **Check Console:** Should show success logs
7. **Check localStorage:** Should have `token` and `user` data

### Test Scenario 2: Invalid Credentials
1. Navigate to `http://localhost:5173/login-new`
2. Enter invalid email: `wrong@example.com`
3. Enter any password
4. Click Login button
5. **Expected:** Error message "Email tidak ditemukan" displayed
6. **Check Console:** Should show error logs with details
7. **Check UI:** Error message should be clear (not "undefined")

### Test Scenario 3: Network Error
1. Stop backend server
2. Navigate to `http://localhost:5173/login-new`
3. Enter credentials
4. Click Login button
5. **Expected:** Error message "Server tidak merespon..."
6. **Check Console:** Should show network error logs

### Test Scenario 4: Validation Errors
1. Navigate to `http://localhost:5173/login-new`
2. Leave email empty
3. Click Login button
4. **Expected:** Validation error under email field
5. **Check UI:** Error message "Email wajib diisi"

## 📊 Test Results Template

| Test Case | Status | Notes |
|-----------|--------|-------|
| Backend: Valid Credentials | ✅/❌ | |
| Backend: Invalid Email | ✅/❌ | |
| Backend: Wrong Password | ✅/❌ | |
| Backend: Missing Fields | ✅/❌ | |
| Frontend: UI Rendering | ✅/❌ | |
| Frontend: Form Validation | ✅/❌ | |
| Frontend: Error Display | ✅/❌ | No "undefined" |
| Frontend: Redirect Logic | ✅/❌ | |
| localStorage: Token Save | ✅/❌ | |
| localStorage: User Data | ✅/❌ | |
| Console Logging | ✅/❌ | Comprehensive logs |

## 🐛 Common Issues & Solutions

### Issue 1: CORS Error
```
Access to XMLHttpRequest at 'http://127.0.0.1:8000/api/login-new' from origin 'http://localhost:5173' has been blocked by CORS policy
```
**Solution:**
- Check `config/cors.php`
- Ensure `'allowed_origins'` includes `['http://localhost:5173']`
- Restart Laravel server

### Issue 2: Token Not Generated
**Solution:**
- Ensure Sanctum is installed: `composer require laravel/sanctum`
- Run migrations: `php artisan migrate`
- Check `personal_access_tokens` table exists

### Issue 3: Hash::check() Returns False
**Solution:**
- Ensure password in database is bcrypt hashed
- Check with: `php artisan tinker`
```php
$user = User::find(1);
Hash::check('password', $user->password); // Should return true
```

### Issue 4: Email Verification Check
**Solution:**
- If you want to skip email verification, comment out this check in `NewLoginController.php`:
```php
// if ($user->email_verified_at === null) {
//     return response()->json([...], 401);
// }
```

## 🚀 Quick Test Script

### Bash Script untuk Testing
```bash
#!/bin/bash

echo "=== Testing New Login System ==="

# Test 1: Valid credentials
echo "Test 1: Valid login"
curl -X POST http://127.0.0.1:8000/api/login-new \
  -H "Content-Type: application/json" \
  -d '{"email":"2021001@student.polije.ac.id","password":"password"}' \
  -w "\nStatus: %{http_code}\n"

echo ""

# Test 2: Invalid email
echo "Test 2: Invalid email"
curl -X POST http://127.0.0.1:8000/api/login-new \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@example.com","password":"password"}' \
  -w "\nStatus: %{http_code}\n"

echo ""

# Test 3: Missing password
echo "Test 3: Missing password"
curl -X POST http://127.0.0.1:8000/api/login-new \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}' \
  -w "\nStatus: %{http_code}\n"

echo "=== Testing Complete ==="
```

## 📝 Test Report Template

```markdown
# Test Report - Sistem Login Baru
Date: [Current Date]
Tester: [Your Name]

## Environment
- Backend: Laravel [Version]
- Frontend: React + Vite
- Database: MySQL

## Test Summary
- Total Tests: 10
- Passed: X
- Failed: Y
- Success Rate: Z%

## Critical Findings
1. [Any critical issues found]

## Recommendations
1. [Recommendations for improvement]

## Sign-off
✅ Sistem login baru berfungsi dengan baik
✅ Error messages jelas (tidak ada "undefined")
✅ Redirect berdasarkan role bekerja
✅ Ready for production use
```

## 🎯 Acceptance Criteria Checklist

- [ ] Login dengan credentials valid berhasil
- [ ] Error messages jelas untuk invalid credentials
- [ ] Tidak ada response "undefined"
- [ ] Token disimpan di localStorage
- [ ] User data disimpan di localStorage
- [ ] Redirect berdasarkan role bekerja
- [ ] Form validation bekerja di frontend
- [ ] Console logging komprehensif
- [ ] CORS configuration benar
- [ ] Database connection stabil
- [ ] Sanctum token generation bekerja
- [ ] Email verification check (optional)
- [ ] Logging di backend bekerja
- [ ] Error handling konsisten
- [ ] Response structure standar
- [ ] Documentation lengkap
- [ ] Test cases tersedia