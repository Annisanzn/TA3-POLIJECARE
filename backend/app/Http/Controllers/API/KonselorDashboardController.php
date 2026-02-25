<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\CounselingSchedule;
use App\Models\Material;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class KonselorDashboardController extends Controller
{
    /**
     * GET /api/konselor/dashboard
     * Statistik untuk dashboard konselor yang sedang login.
     */
    public function stats(): JsonResponse
    {
        $userId = Auth::id();

        // ── Jadwal Konseling (counseling_schedules where counselor_id = me) ──
        $jadwalQuery = CounselingSchedule::where('counselor_id', $userId);

        $totalJadwal    = (clone $jadwalQuery)->count();
        $pending        = (clone $jadwalQuery)->where('status', 'pending')->count();
        $approved       = (clone $jadwalQuery)->where('status', 'approved')->count();
        $completed      = (clone $jadwalQuery)->where('status', 'completed')->count();
        $cancelled      = (clone $jadwalQuery)->where('status', 'cancelled')->count();
        $today          = (clone $jadwalQuery)->whereDate('tanggal', today())->count();
        $upcoming       = (clone $jadwalQuery)
            ->whereDate('tanggal', '>', today())
            ->whereIn('status', ['pending', 'approved'])
            ->count();

        // ── Total mahasiswa unik yang pernah konseling dengan saya ──
        $mahasiswaCount = (clone $jadwalQuery)->distinct('user_id')->count('user_id');

        // ── Materi milik saya ──
        $materiCount = Material::where('uploaded_by', $userId)->count();

        return response()->json([
            'success' => true,
            'data'    => [
                'jadwal' => [
                    'total'     => $totalJadwal,
                    'pending'   => $pending,
                    'approved'  => $approved,
                    'completed' => $completed,
                    'cancelled' => $cancelled,
                    'today'     => $today,
                    'upcoming'  => $upcoming,
                ],
                'mahasiswa' => $mahasiswaCount,
                'materi'    => $materiCount,
            ],
            'message' => 'Statistik dashboard konselor berhasil diambil',
        ]);
    }

    /**
     * GET /api/konselor/pengaduan
     * Pengaduan yang terkait dengan jadwal konseling konselor ini.
     */
    public function pengaduan(): JsonResponse
    {
        $userId = Auth::id();

        // Ambil complaint IDs yang terkait dengan counseling sessions konselor ini
        $counselingIds = CounselingSchedule::where('counselor_id', $userId)
            ->pluck('complaint_id')
            ->filter()
            ->unique()
            ->toArray();

        if (empty($counselingIds)) {
            return response()->json([
                'success' => true,
                'data'    => [],
                'message' => 'Belum ada pengaduan yang ditangani',
            ]);
        }

        $complaints = \App\Models\Complaint::with(['user', 'category', 'counselingSchedule'])
            ->whereIn('id', $counselingIds)
            ->latest()
            ->get()
            ->map(function ($c) {
                return [
                    'id'          => $c->id,
                    'mahasiswa'   => $c->user?->name ?? 'Mahasiswa',
                    'nim'         => $c->user?->nim ?? '-',
                    'kategori'    => $c->category?->name ?? '-',
                    'deskripsi'   => $c->description ?? '',
                    'status'      => $c->status,
                    'catatan'     => $c->catatan ?? '',
                    'created_at'  => $c->created_at,
                    'updated_at'  => $c->updated_at,
                ];
            });

        return response()->json([
            'success' => true,
            'data'    => $complaints,
            'message' => 'Pengaduan berhasil diambil',
        ]);
    }
}
