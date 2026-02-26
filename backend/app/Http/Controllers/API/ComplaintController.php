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
                    'user_name' => $c->is_anonymous ? 'Anonim' : optional($c->user)->name,
                    'victim_type' => $c->victim_type,
                    'victim_name' => $c->victim_name,
                    'victim_relationship' => $c->victim_relationship,
                    'location' => $c->location,
                    'description' => $c->description,
                    'status' => $c->status,
                    'counseling_schedule' => optional($c->counseling_schedule)->toDateTimeString(),
                    'urgency_level' => $c->urgency_level,
                    'counselor_name' => optional($c->counselor)->name,
                    'created_at' => $c->created_at->toDateTimeString(),
                ];
            })
        );

        return response()->json($paginator);
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
        $process = (clone $baseQuery)->where('status', 'process')->count();
        $completed = (clone $baseQuery)->where('status', 'completed')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'pending' => $pending,
                'process' => $process,
                'completed' => $completed,
            ],
        ]);
    }

    public function updateStatus(Request $request, Complaint $complaint)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,process,scheduled,completed,rejected',
        ]);

        $complaint->update([
            'status' => $validated['status'],
        ]);

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
            'status' => 'scheduled',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Schedule updated successfully',
            'data' => $complaint,
        ]);
    }
}
