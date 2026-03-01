<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use Illuminate\Http\Request;

class ComplaintController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 100));

        $search = $request->query('search');
        $status = $request->query('status');
        $urgency = $request->query('urgency');
        $dateFrom = $request->query('date_from');
        $dateTo = $request->query('date_to');

        $authUser = $request->user();

        $query = Complaint::query()
            ->with([
                'user:id,name',
                'counselor:id,name',
                'violenceCategory',
            ])
            ->when($authUser && $authUser->role === 'konselor', function ($q) use ($authUser) {
                $q->where('counselor_id', $authUser->id);
            })
            ->when($search, function ($q) use ($search) {
                $q->where(function ($qq) use ($search) {
                    $qq->where('report_id', 'like', "%{$search}%")
                        ->orWhere('location', 'like', "%{$search}%");
                });
            })
            ->when($status && $status !== 'all', function ($q) use ($status) {
                $q->where('status', $status);
            })
            ->when($urgency && $urgency !== 'all', function ($q) use ($urgency) {
                $q->where('urgency_level', $urgency);
            })
            ->when($dateFrom, function ($q) use ($dateFrom) {
                $q->whereDate('created_at', '>=', $dateFrom);
            })
            ->when($dateTo, function ($q) use ($dateTo) {
                $q->whereDate('created_at', '<=', $dateTo);
            })
            ->orderBy('created_at', 'desc');

        $paginator = $query->paginate($perPage);

        $paginator->setCollection(
            $paginator->getCollection()->map(function ($c) {
                return [
                    'id' => $c->id,
                    'report_id' => $c->report_id,
                    'user_id' => $c->user_id,
                    'user_name' => $c->is_anonymous ? 'Anonim' : optional($c->user)->name,
                    'counselor_id' => $c->counselor_id,
                    'counselor_name' => optional($c->counselor)->name,
                    'violence_category_id' => $c->violence_category_id,
                    'violence_category_name' => optional($c->violenceCategory)->name ?? optional($c->violenceCategory)->kategori,
                    'title' => $c->title,
                    'description' => $c->description,
                    'chronology' => $c->chronology,
                    'victim_type' => $c->victim_type,
                    'victim_name' => $c->victim_name,
                    'victim_relationship' => $c->victim_relationship,
                    'location' => $c->location,
                    'latitude' => $c->latitude,
                    'longitude' => $c->longitude,
                    'status' => $c->status,
                    'counseling_schedule' => optional($c->counseling_schedule)->toDateTimeString(),
                    'urgency_level' => $c->urgency_level,
                    'is_anonymous' => $c->is_anonymous,
                    'ip_address' => $c->ip_address,
                    'user_agent' => $c->user_agent,
                    'file_path' => $c->file_path,
                    'created_at' => $c->created_at->toDateTimeString(),
                    'updated_at' => $c->updated_at->toDateTimeString(),
                ];
            })
        );

        return response()->json($paginator);
    }

    public function show(Request $request, Complaint $complaint)
    {
        $authUser = $request->user();

        // If counselor, ensure they're authorized to see this complaint
        if ($authUser && $authUser->role === 'konselor') {
            $isAssignedDirectly = $complaint->counselor_id === $authUser->id;
            
            // Check if there's a counseling schedule linking this counselor to the complaint
            $hasSchedule = \App\Models\CounselingSchedule::where('complaint_id', $complaint->id)
                ->where('counselor_id', $authUser->id)
                ->exists();

            \Illuminate\Support\Facades\Log::info('Counselor Auth Debug', [
                'authUserId' => $authUser->id,
                'complaintId' => $complaint->id,
                'complaintCounselorId' => $complaint->counselor_id,
                'isAssignedDirectly' => $isAssignedDirectly,
                'hasSchedule' => $hasSchedule
            ]);

            if (!$isAssignedDirectly && !$hasSchedule) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to this complaint',
                ], 403);
            }
        }

        $complaint->load([
            'user:id,name',
            'counselor:id,name',
            'violenceCategory',
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $complaint->id,
                'report_id' => $complaint->report_id,
                'user_id' => $complaint->user_id,
                'user_name' => $complaint->is_anonymous ? 'Anonim' : optional($complaint->user)->name,
                'counselor_id' => $complaint->counselor_id,
                'counselor_name' => optional($complaint->counselor)->name,
                'violence_category_id' => $complaint->violence_category_id,
                'violence_category_name' => optional($complaint->violenceCategory)->name ?? optional($complaint->violenceCategory)->kategori,
                'title' => $complaint->title,
                'description' => $complaint->description,
                'chronology' => $complaint->chronology,
                'victim_type' => $complaint->victim_type,
                'victim_name' => $complaint->victim_name,
                'victim_relationship' => $complaint->victim_relationship,
                'location' => $complaint->location,
                'latitude' => $complaint->latitude,
                'longitude' => $complaint->longitude,
                'status' => $complaint->status,
                'counseling_schedule' => optional($complaint->counseling_schedule)->toDateTimeString(),
                'urgency_level' => $complaint->urgency_level,
                'is_anonymous' => $complaint->is_anonymous,
                'ip_address' => $complaint->ip_address,
                'user_agent' => $complaint->user_agent,
                'file_path' => $complaint->file_path,
                'created_at' => $complaint->created_at->toDateTimeString(),
                'updated_at' => $complaint->updated_at->toDateTimeString(),
            ]
        ]);
    }

    public function stats(Request $request)
    {
        $authUser = $request->user();

        $baseQuery = Complaint::query();
        if ($authUser && $authUser->role === 'konselor') {
            $baseQuery->where('counselor_id', $authUser->id);
        }

        $total = (clone $baseQuery)->count();
        $pending = (clone $baseQuery)->where('status', 'pending')->count();
        $approved = (clone $baseQuery)->where('status', 'approved')->count();
        $completed = (clone $baseQuery)->where('status', 'completed')->count();
        $rejected = (clone $baseQuery)->where('status', 'rejected')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'pending' => $pending,
                'approved' => $approved,
                'completed' => $completed,
                'rejected' => $rejected,
            ],
        ]);
    }

    public function updateStatus(Request $request, Complaint $complaint)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,completed,rejected',
        ]);

        $complaint->update([
            'status' => $validated['status'],
        ]);

        // Sync status to associated counseling schedules
        \App\Models\CounselingSchedule::where('complaint_id', $complaint->id)
            ->update(['status' => $validated['status']]);

        return response()->json([
            'success' => true,
            'message' => 'Status updated successfully',
            'data' => $complaint,
        ]);
    }

    public function schedule(Request $request, Complaint $complaint)
    {
        $validated = $request->validate([
            'counselor_id' => 'nullable|exists:users,id',
            'counseling_schedule' => 'required|date',
        ]);

        $complaint->update([
            'counselor_id' => $validated['counselor_id'] ?? $complaint->counselor_id,
            'counseling_schedule' => $validated['counseling_schedule'],
            'status' => 'approved',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Schedule updated successfully',
            'data' => $complaint,
        ]);
    }
}
