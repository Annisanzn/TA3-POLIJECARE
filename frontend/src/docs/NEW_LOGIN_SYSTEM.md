# Sistem Login Baru - Dokumentasi

## 🎯 Overview
Sistem login baru yang dibuat untuk mengatasi masalah "Login failed: undefined" pada sistem lama. Sistem ini menggunakan endpoint baru di backend Laravel dan frontend React yang terpisah dari sistem login lama.

## 🔧 Komponen Sistem

### Backend (Laravel)
1. **Controller**: `NewLoginController.php`
   - Endpoint: `POST /api/login-new`
   - Method: `login()`
   - Validasi: Email & Password
   - Response: JSON dengan struktur yang jelas

2. **Routes**: `routes/api.php`
   - Route baru: `Route::post('/login-new', [NewLoginController::class, 'login']);`
   - Protected routes: `/logout-new`, `/user-new`

### Frontend (React)
1. **Halaman Login**: `NewLoginPage.jsx`
   - Path: `/login-new`
   - Fitur: Form login dengan validasi, error handling, debugging

2. **Service**: `newAuthService.js`
   - Handle API calls ke `/api/login-new`
   - Management token & user data di localStorage
   - Role-based redirect logic

3. **Redirect Component**: `NewRedirectDashboard.jsx`
   - Path: `/redirect-new`
   - Auto-redirect berdasarkan role user

4. **Axios Configuration**: `axios.js` (existing)
   - Sudah dikonfigurasi dengan interceptors untuk error handling

## 🚀 Cara Menggunakan

### 1. Akses Halaman Login Baru
```
http://localhost:5173/login-new
```

### 2. Login dengan Credentials
- Email: `2021001@student.polije.ac.id` (contoh)
- Password: `password` (sesuai database)

### 3. Setelah Login Berhasil
- Token akan disimpan di `localStorage`
- User data akan disimpan di `localStorage`
- Auto-redirect ke dashboard berdasarkan role

## 🔍 Debugging & Error Handling

### Console Logs
Sistem login baru memiliki logging yang komprehensif:
```
🔍 Starting new login process...
📤 Sending login request to /api/login-new
✅ Login response received: {...}
💾 Token saved to localStorage
🔄 Redirecting based on role: user
```

### Error Messages yang Jelas
- **Email tidak ditemukan**: `"Email tidak ditemukan"`
- **Password salah**: `"Password salah"`
- **Server error**: `"Server tidak merespon. Periksa koneksi internet..."`
- **Validation error**: `"Format email tidak valid"`

### Debug Info di UI
Halaman login menampilkan debug info saat development:
```json
{
  "type": "success",
  "data": {
    "success": true,
    "message": "Login berhasil",
    "user": {...},
    "token": "sanctum_token_here"
  }
}
```

## 🗺️ Role-Based Redirect

| Role | Redirect Path |
|------|---------------|
| admin | `/admin/dashboard` |
| konselor | `/konselor/dashboard` |
| operator | `/operator/dashboard` |
| user | `/dashboard` |

## 🧪 Testing dengan Postman

### Request
```http
POST http://127.0.0.1:8000/api/login-new
Content-Type: application/json

{
  "email": "2021001@student.polije.ac.id",
  "password": "password"
}
```

### Response Success
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

### Response Error
```json
{
  "success": false,
  "message": "Email tidak ditemukan"
}
```

## ⚙️ Konfigurasi

### Backend (.env)
Pastikan konfigurasi database dan Sanctum sudah benar:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ta_database
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DOMAIN=localhost
```

### Frontend (.env)
```env
VITE_API_URL=http://127.0.0.1:8000/api
```

## 🐛 Troubleshooting

### 1. Error "Server tidak merespon"
- Pastikan backend Laravel berjalan: `php artisan serve --port=8000`
- Cek CORS configuration di `config/cors.php`
- Pastikan tidak ada firewall yang memblokir port 8000

### 2. Error "Email tidak ditemukan"
- Pastikan email ada di database tabel `users`
- Cek dengan query: `SELECT * FROM users WHERE email = 'email@contoh.com'`

### 3. Error "Password salah"
- Password di database di-hash dengan bcrypt
- Gunakan `Hash::check()` untuk verifikasi
- Reset password jika perlu: `php artisan tinker` → `Hash::make('passwordbaru')`

### 4. Error CORS
- Pastikan `config/cors.php` mengizinkan origin frontend
- Tambahkan middleware CORS di route jika perlu

### 5. Token tidak disimpan
- Cek console untuk error JavaScript
- Pastikan `localStorage` tersedia (bukan incognito mode)
- Cek response dari API memiliki field `token`

## 📊 Monitoring & Logging

### Backend Logs
```php
\Log::info('New login request received', ['email' => $request->email]);
\Log::warning('Login failed: User not found', ['email' => $email]);
\Log::error('Token creation failed', ['error' => $e->getMessage()]);
```

### Frontend Logs
- Semua log dimulai dengan emoji untuk identifikasi visual
- Error details ditampilkan lengkap di console
- Debug info bisa di-enable/disable

## ✅ Checklist Implementasi

- [x] Endpoint API baru `/api/login-new`
- [x] Controller dengan error handling yang jelas
- [x] Route yang terpisah dari sistem lama
- [x] Halaman React `/login-new`
- [x] Service untuk handle authentication
- [x] Role-based redirect
- [x] Debugging & logging komprehensif
- [x] Error messages yang jelas (tidak undefined)
- [x] Token management di localStorage
- [x] Dokumentasi lengkap

## 🔄 Migrasi dari Sistem Lama

1. **Tidak perlu migrasi** - sistem baru berjalan paralel
2. **Tidak merusak** sistem login lama
3. **Bisa di-test** secara terpisah
4. **Bisa diadopsi bertahap** - mulai dari halaman `/login-new`

## 📞 Support

Jika menemukan masalah:
1. Cek console browser (F12)
2. Cek Laravel logs: `storage/logs/laravel.log`
3. Test endpoint dengan Postman
4. Pastikan database connection berfungsi

## 🎉 Keuntungan Sistem Baru

1. **Error messages jelas** - tidak ada "undefined"
2. **Debugging mudah** - logging komprehensif
3. **Response konsisten** - struktur JSON standar
4. **Terpisah dari sistem lama** - tidak menyebabkan regresi
5. **Siap untuk TA** - dokumentasi lengkap