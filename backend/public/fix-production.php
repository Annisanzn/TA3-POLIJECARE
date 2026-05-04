<?php
/**
 * PolijeCare - Production Fix Script
 * 
 * PENTING: HAPUS FILE INI SETELAH SELESAI DIGUNAKAN!
 * 
 * Cara pakai:
 * 1. Upload file ini ke folder public/ di server production
 * 2. Akses via browser: https://api.polijecare.my.id/fix-production.php
 * 3. Klik tombol-tombol yang tersedia
 * 4. Setelah selesai, HAPUS file ini dari server!
 */

// ─── Security: Simple password protection ────────────────────────────────────
$PASSWORD = 'polijecare2024fix'; // Ganti jika mau lebih aman
$authenticated = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['password'])) {
    if ($_POST['password'] === $PASSWORD) {
        $_SESSION['auth'] = true;
    }
}

session_start();
if (isset($_SESSION['auth']) && $_SESSION['auth'] === true) {
    $authenticated = true;
}

// ─── Artisan Runner ───────────────────────────────────────────────────────────
function runArtisan($command) {
    $basePath = dirname(__DIR__); // Naik satu level dari /public ke root Laravel
    $phpBin   = PHP_BINARY; // Path ke php binary di server
    $artisan  = $basePath . '/artisan';
    
    $fullCmd = escapeshellcmd("$phpBin $artisan $command") . ' 2>&1';
    $output  = shell_exec($fullCmd);
    
    return $output ?: '(tidak ada output)';
}

function storageLink() {
    // Coba via artisan dulu
    $output = runArtisan('storage:link --force');
    
    // Jika artisan tidak bisa, coba manual symlink
    $target = dirname(__DIR__) . '/storage/app/public';
    $link   = dirname(__DIR__) . '/public/storage';
    
    $info = ['artisan_output' => $output];
    
    if (!file_exists($link)) {
        if (function_exists('symlink')) {
            $result = @symlink($target, $link);
            $info['manual_symlink'] = $result ? 'Berhasil buat symlink manual!' : 'Gagal buat symlink manual (coba folder permissions)';
        } else {
            $info['manual_symlink'] = 'Fungsi symlink tidak tersedia di server ini';
        }
    } else {
        $info['symlink_exists'] = 'Symlink sudah ada di: ' . $link;
    }
    
    return $info;
}

function checkStorageStatus() {
    $basePath    = dirname(__DIR__);
    $storagePath = $basePath . '/storage/app/public';
    $linkPath    = $basePath . '/public/storage';
    $articlesPath = $storagePath . '/articles';
    
    $files = [];
    if (is_dir($articlesPath)) {
        $files = array_values(array_diff(scandir($articlesPath), ['.', '..']));
    }
    
    return [
        'storage_exists'      => is_dir($storagePath),
        'symlink_exists'      => file_exists($linkPath) || is_link($linkPath),
        'symlink_is_link'     => is_link($linkPath),
        'articles_dir_exists' => is_dir($articlesPath),
        'article_files'       => $files,
        'article_count'       => count($files),
        'php_binary'          => PHP_BINARY,
        'base_path'           => $basePath,
    ];
}

// ─── Handle AJAX Actions ──────────────────────────────────────────────────────
if ($authenticated && isset($_GET['action'])) {
    header('Content-Type: application/json');
    
    $action = $_GET['action'];
    $result = [];
    
    switch ($action) {
        case 'clear_all':
            $result = [
                'config_clear'  => runArtisan('config:clear'),
                'route_clear'   => runArtisan('route:clear'),
                'cache_clear'   => runArtisan('cache:clear'),
                'view_clear'    => runArtisan('view:clear'),
            ];
            break;
            
        case 'storage_link':
            $result = storageLink();
            break;
            
        case 'check_status':
            $result = checkStorageStatus();
            break;
            
        case 'cache_rebuild':
            $result = [
                'config_cache' => runArtisan('config:cache'),
                'route_cache'  => runArtisan('route:cache'),
            ];
            break;
            
        case 'fix_permissions':
            $basePath = dirname(__DIR__);
            $dirs = [
                $basePath . '/storage',
                $basePath . '/bootstrap/cache',
            ];
            foreach ($dirs as $dir) {
                if (is_dir($dir)) {
                    @chmod($dir, 0775);
                    // Rekursif
                    $iterator = new RecursiveIteratorIterator(
                        new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS)
                    );
                    foreach ($iterator as $item) {
                        @chmod($item, $item->isDir() ? 0775 : 0664);
                    }
                }
            }
            $result = ['message' => 'Permission telah diubah ke 775/664 untuk folder storage dan bootstrap/cache'];
            break;
            
        case 'run_all':
            $result['1_fix_permissions'] = ['message' => 'Permission diubah'];
            // fix permissions
            $basePath = dirname(__DIR__);
            foreach ([$basePath.'/storage', $basePath.'/bootstrap/cache'] as $dir) {
                if (is_dir($dir)) {
                    @chmod($dir, 0775);
                    $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS));
                    foreach ($it as $item) @chmod($item, $item->isDir() ? 0775 : 0664);
                }
            }
            
            $result['2_clear_all'] = [
                'config:clear' => runArtisan('config:clear'),
                'route:clear'  => runArtisan('route:clear'),
                'cache:clear'  => runArtisan('cache:clear'),
                'view:clear'   => runArtisan('view:clear'),
            ];
            $result['3_storage_link'] = storageLink();
            $result['4_cache_rebuild'] = [
                'config:cache' => runArtisan('config:cache'),
                'route:cache'  => runArtisan('route:cache'),
            ];
            $result['5_status'] = checkStorageStatus();
            break;
    }
    
    echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PolijeCare - Production Fix Tool</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; padding: 2rem; }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { color: #38bdf8; font-size: 1.5rem; margin-bottom: 0.5rem; }
        .warning { background: #7f1d1d; border: 1px solid #ef4444; border-radius: 8px; padding: 1rem; margin: 1rem 0; color: #fca5a5; font-size: 0.9rem; }
        .card { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 1.5rem; margin: 1rem 0; }
        .card h2 { font-size: 1rem; color: #94a3b8; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 1px; }
        .btn { display: inline-block; padding: 0.6rem 1.2rem; border-radius: 8px; border: none; cursor: pointer; font-size: 0.9rem; font-weight: 600; transition: opacity 0.2s; }
        .btn:hover { opacity: 0.8; }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-blue   { background: #2563eb; color: white; }
        .btn-green  { background: #16a34a; color: white; }
        .btn-orange { background: #d97706; color: white; }
        .btn-red    { background: #dc2626; color: white; }
        .btn-purple { background: #7c3aed; color: white; }
        .btn-row { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
        .output { background: #0f172a; border: 1px solid #1e293b; border-radius: 6px; padding: 1rem; margin-top: 1rem; font-family: monospace; font-size: 0.82rem; white-space: pre-wrap; max-height: 400px; overflow-y: auto; color: #86efac; display: none; }
        .output.show { display: block; }
        .status-ok  { color: #4ade80; }
        .status-err { color: #f87171; }
        .login-form { max-width: 400px; margin: 5rem auto; }
        .login-form input { width: 100%; padding: 0.7rem 1rem; background: #1e293b; border: 1px solid #334155; border-radius: 8px; color: white; margin: 0.5rem 0; font-size: 1rem; }
        .login-form input:focus { outline: none; border-color: #38bdf8; }
        .spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; vertical-align: middle; margin-right: 6px; }
        @keyframes spin { to { transform: rotate(360deg); } }
    </style>
</head>
<body>
<div class="container">

<?php if (!$authenticated): ?>
<!-- Login Form -->
<div class="card login-form">
    <h1>🔧 PolijeCare Fix Tool</h1>
    <p style="color:#94a3b8; margin: 1rem 0; font-size:0.9rem;">Masukkan password untuk mengakses tool ini.</p>
    <form method="POST">
        <input type="password" name="password" placeholder="Password..." autofocus>
        <button type="submit" class="btn btn-blue" style="width:100%; margin-top:0.5rem;">Masuk →</button>
    </form>
    <?php if (isset($_POST['password'])): ?>
        <p style="color:#f87171; margin-top:1rem;">❌ Password salah!</p>
    <?php endif; ?>
</div>

<?php else: ?>
<!-- Main Tool -->
<h1>🔧 PolijeCare - Production Fix Tool</h1>
<div class="warning">
    ⚠️ <strong>PENTING:</strong> Hapus file <code>fix-production.php</code> dari folder public/ server setelah selesai menggunakan tool ini!
</div>

<!-- Status Check -->
<div class="card">
    <h2>📊 Status Storage</h2>
    <div class="btn-row">
        <button class="btn btn-blue" onclick="runAction('check_status', this)">🔍 Cek Status</button>
    </div>
    <div id="output-check_status" class="output"></div>
</div>

<!-- Fix All (One Click) -->
<div class="card">
    <h2>⚡ Fix Semua Sekaligus (Rekomendasi)</h2>
    <p style="color:#94a3b8; font-size:0.85rem; margin-bottom:1rem;">Jalankan semua perbaikan sekaligus: fix permissions → clear cache → storage link → rebuild cache</p>
    <div class="btn-row">
        <button class="btn btn-green" onclick="runAction('run_all', this)">🚀 Jalankan Semua Fix</button>
    </div>
    <div id="output-run_all" class="output"></div>
</div>

<!-- Individual Actions -->
<div class="card">
    <h2>🔧 Fix Manual (Satu per Satu)</h2>
    <div class="btn-row">
        <button class="btn btn-orange" onclick="runAction('fix_permissions', this)">🔒 Fix Permissions</button>
        <button class="btn btn-blue"   onclick="runAction('clear_all', this)">🧹 Clear Semua Cache</button>
        <button class="btn btn-purple" onclick="runAction('storage_link', this)">🔗 Storage Link</button>
        <button class="btn btn-blue"   onclick="runAction('cache_rebuild', this)">⚙️ Rebuild Cache</button>
    </div>
    <div id="output-fix_permissions" class="output"></div>
    <div id="output-clear_all" class="output"></div>
    <div id="output-storage_link" class="output"></div>
    <div id="output-cache_rebuild" class="output"></div>
</div>

<!-- Checklist -->
<div class="card">
    <h2>✅ Checklist Setelah Selesai</h2>
    <ul style="color:#94a3b8; font-size:0.9rem; line-height:2; padding-left:1.5rem;">
        <li>✅ Symlink storage sudah terbuat (<code>public/storage → storage/app/public</code>)</li>
        <li>✅ Config cache sudah di-clear dan dibangun ulang</li>
        <li>✅ Route cache sudah di-clear (Google callback sekarang bisa diakses)</li>
        <li>✅ Upload gambar baru dari halaman artikel untuk menguji</li>
        <li>🗑️ <strong style="color:#f87171">HAPUS file ini dari server!</strong></li>
    </ul>
</div>

<script>
async function runAction(action, btn) {
    const output = document.getElementById('output-' + action);
    const originalText = btn.innerHTML;
    
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>Proses...';
    output.classList.add('show');
    output.textContent = 'Memproses...';
    
    try {
        const res = await fetch('?action=' + action);
        const data = await res.json();
        output.textContent = JSON.stringify(data, null, 2);
    } catch(e) {
        output.textContent = 'Error: ' + e.message;
        output.style.color = '#f87171';
    }
    
    btn.disabled = false;
    btn.innerHTML = originalText;
}
</script>

<?php endif; ?>
</div>
</body>
</html>
