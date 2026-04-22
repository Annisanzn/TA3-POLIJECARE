<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Complaint;
use App\Models\CounselingSchedule;
use App\Models\Article;

class UserDashboardController extends Controller
{
    /**
     * Get aggregate data for the user dashboard.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // 1. Complaint Statistics
        $complaintsQuery = Complaint::where('user_id', $user->id);
        $totalComplaints = $complaintsQuery->count();
        $processingComplaints = (clone $complaintsQuery)->whereIn('status', ['pending', 'approved'])->count();
        $completedComplaints = (clone $complaintsQuery)->where('status', 'completed')->count();

        // 2. Recent Complaints
        $recentComplaints = Complaint::with('counselor:id,name', 'violenceCategory:unique_id,name')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get();

        // 3. Upcoming Counseling Schedule
        // Approved status and date >= today. Limit to 1 for the widget.
        $upcomingSchedule = CounselingSchedule::with('counselor:id,name')
            ->where('user_id', $user->id)
            ->where('status', 'approved')
            ->whereDate('tanggal', '>=', now()->toDateString())
            ->orderBy('tanggal', 'asc')
            ->orderBy('jam_mulai', 'asc')
            ->first();

        // 4. Recent Educational Articles (limit 3)
        $recentArticlesDb = Article::published()
            ->latest()
            ->limit(3)
            ->get(['id', 'title', 'slug', 'content', 'image', 'published_at']);

        $recentArticles = $recentArticlesDb->map(function ($article) {
            return [
                'id' => $article->id,
                'title' => $article->title,
                'slug' => $article->slug,
                'excerpt' => $article->excerpt,
                'cover_image' => $article->image ? asset('storage/' . $article->image) : null,
                'published_at' => $article->published_at,
            ];
        });

        // Quick contacts for Satgas (static for now, could be dynamic)
        $satgasContact = [
            'phone' => '+62 812-3456-7890',
            'email' => 'satgas.ppks@polije.ac.id',
            'location' => 'Gedung Rektorat Lt. 1, Politeknik Negeri Jember'
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => [
                    'total' => $totalComplaints,
                    'processing' => $processingComplaints,
                    'completed' => $completedComplaints,
                ],
                'recent_complaints' => $recentComplaints,
                'upcoming_schedule' => $upcomingSchedule,
                'recent_articles' => $recentArticles,
                'satgas_contact' => $satgasContact,
            ]
        ]);
    }
}
