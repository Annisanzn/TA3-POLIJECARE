# Testing Akses Halaman Counseling

## Perubahan yang Telah Dilakukan:

### 1. **Sidebar.jsx** - Memperbaiki path menu:
- "Jadwal Konseling" (operator): `path: '/operator/counseling-management'` (sebelumnya `'#'`)
- "Jadwal Konselor" (konselor): `path: '/konselor/counseling-dashboard'` (sebelumnya `'#'`)

### 2. **App.jsx** - Menambahkan import dan route:
- Import halaman counseling:
  ```javascript
  import CounselingManagementPage from './pages/operator/counseling-management';
  import CounselingRequestPage from './pages/user/counseling-request';
  import CounselorCounselingDashboard from './pages/konselor/counseling-dashboard';
  ```

- Menambahkan route dengan proteksi role:
  ```javascript
  {/* Counseling Management for Operator */}
  <Route
    path="/operator/counseling-management"
    element={
      <NewProtectedRoute requiredRole="operator">
        <CounselingManagementPage />
      </NewProtectedRoute>
    }
  />

  {/* Counseling Request for User */}
  <Route
    path="/user/counseling-request"
    element={
      <NewProtectedRoute requiredRole="user">
        <CounselingRequestPage />
      </NewProtectedRoute>
    }
  />

  {/* Counseling Dashboard for Counselor */}
  <Route
    path="/konselor/counseling-dashboard"
    element={
      <NewProtectedRoute requiredRole="konselor">
        <CounselorCounselingDashboard />
      </NewProtectedRoute>
    }
  />
  ```

## Halaman yang Tersedia:

### 1. **Untuk Operator** (Role: `operator`)
- URL: `http://localhost:5173/operator/counseling-management`
- Akses: Melalui sidebar menu "Jadwal Konseling"
- Fitur: Manajemen semua jadwal konseling, filter, approve/reject, statistik

### 2. **Untuk Konselor** (Role: `konselor`)
- URL: `http://localhost:5173/konselor/counseling-dashboard`
- Akses: Melalui sidebar menu "Jadwal Konselor"
- Fitur: Dashboard jadwal pribadi, filter, update status, statistik

### 3. **Untuk User/Mahasiswa** (Role: `user`)
- URL: `http://localhost:5173/user/counseling-request`
- Akses: Belum ada link di sidebar (perlu ditambahkan di dashboard user)
- Fitur: Form pengajuan jadwal konseling, pilih konselor, tanggal, waktu

## Langkah Testing:

### 1. **Login sebagai Operator**:
- Buka `http://localhost:5173/login-new`
- Login dengan credentials operator
- Di sidebar, klik "Jadwal Konseling"
- Harusnya masuk ke halaman `CounselingManagementPage`

### 2. **Login sebagai Konselor**:
- Login dengan credentials konselor
- Di sidebar, klik "Jadwal Konselor"
- Harusnya masuk ke halaman `CounselorCounselingDashboard`

### 3. **Login sebagai User/Mahasiswa**:
- Login dengan credentials user
- Saat ini belum ada link di sidebar untuk "Ajukan Konseling"
- Bisa langsung akses `http://localhost:5173/user/counseling-request`

## Catatan Tambahan:

1. **Untuk User Dashboard**: Perlu menambahkan link/button di dashboard user untuk mengakses halaman counseling request. Bisa ditambahkan:
   - Card/button "Ajukan Konseling" di dashboard
   - Menu di sidebar user (jika ada)

2. **Server Status**:
   - Frontend: Running di `http://localhost:5173`
   - Backend: Running di `http://127.0.0.1:8000`

3. **Jika masih tidak bisa klik**:
   - Cek console browser untuk error JavaScript
   - Pastikan sudah login dengan role yang sesuai
   - Refresh halaman setelah perubahan kode
   - Coba hard refresh (Ctrl+F5) untuk clear cache

## Solusi Jika Masih Bermasalah:

1. **Clear cache browser** dan refresh
2. **Restart dev server** frontend:
   ```bash
   cd frontend
   npm run dev
   ```
3. **Cek error di terminal** dev server
4. **Verifikasi file sudah tersimpan** dengan benar

Sistem sekarang seharusnya sudah bisa diakses melalui menu sidebar untuk operator dan konselor.