<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Complaint;

class OperatorDashboardController extends Controller
{
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
