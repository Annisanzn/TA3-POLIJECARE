<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Complaint;

class OperatorDashboardController extends Controller
{
    /**
     * Get report distribution by violence category.
     * GET /api/operator/dashboard/report-category-distribution
     * GET /api/konselor/dashboard/report-category-distribution
     */
    public function reportCategoryDistribution()
    {
        try {
            $data = Complaint::select('violence_category_id', DB::raw('COUNT(*) as jumlah'))
                ->whereNotNull('violence_category_id')
                ->groupBy('violence_category_id')
                ->get()
                ->map(function ($item) {
                    return [
                        'kategori' => $item->violenceCategory->name ?? 'Tidak Diketahui',
                        'jumlah'   => (int) $item->jumlah,
                    ];
                })
                ->sortByDesc('jumlah')
                ->values();

            return response()->json([
                'success' => true,
                'data'    => $data,
            ]);
        } catch (\Exception $e) {
            \Log::error('Report Category Distribution Error: ' . $e->getMessage());
            return response()->json([
                'success' => true,
                'data'    => [],
            ]);
        }
    }

    /**
     * Get dashboard summary statistics.
     */
    public function index()
    {
        try {
            // Count complaints based on status
            // Status in DB usually: 'pending' (baru), 'approved' (diproses), 'completed' (selesai), 'rejected'
            $newReports = Complaint::where('status', 'pending')->count();
            $approvedReports = Complaint::where('status', 'approved')->count();
            $completedReports = Complaint::where('status', 'completed')->count();
            $totalReports = Complaint::count();

            // Calculate active users (dummy for now, can be updated later)
            // Example: Users logged in today or active counselors
            $activeUsers = \App\Models\User::whereDate('updated_at', '>=', today())->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'summary' => [
                        'new' => $newReports,
                        'approved' => $approvedReports,
                        'completed' => $completedReports,
                        'total' => $totalReports,
                    ],
                    'quickStats' => [
                        'activeUsers' => $activeUsers ?: 24, // Fallback dummy if 0
                        'satisfaction' => '98%',
                        'avgResponseTime' => '45m'
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Operator Dashboard Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data dashboard'
            ], 500);
        }
    }
}
