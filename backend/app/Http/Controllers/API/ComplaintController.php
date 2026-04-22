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
                'user:id,name,phone',
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
                // Support comma-separated multiple statuses (e.g. 'pending,approved')
                $statuses = array_map('trim', explode(',', $status));
                if (count($statuses) > 1) {
                    $q->whereIn('status', $statuses);
                } else {
                    $q->where('status', $statuses[0]);
                }
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
                    'user_name' => $c->user_id ? optional($c->user)->name : $c->guest_name,
                    'user_phone' => $c->user_id ? optional($c->user)->phone : $c->guest_phone,
                    'guest_name' => $c->guest_name,
                    'guest_email' => $c->guest_email,
                    'guest_phone' => $c->guest_phone,
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
                    'is_external_victim' => $c->is_external_victim,
                    'victim_identity_proof' => $c->victim_identity_proof,
                    'suspect_name' => $c->suspect_name,
                    'suspect_status' => $c->suspect_status,
                    'suspect_affiliation' => $c->suspect_affiliation,
                    'suspect_phone' => $c->suspect_phone,
                    'location' => $c->location,
                    'latitude' => $c->latitude,
                    'longitude' => $c->longitude,
                    'status' => $c->status,
                    'rejection_reason' => $c->rejection_reason,
                    'counseling_schedule' => optional($c->counseling_schedule)->toDateTimeString(),
                    'urgency_level' => $c->urgency_level,
                    'is_anonymous' => $c->is_anonymous,
                    'ip_address' => $c->ip_address,
                    'user_agent' => $c->user_agent,
                    'file_path' => $c->file_path ? asset('storage/' . $c->file_path) : null,
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
            'user:id,name,email,phone',
            'counselor:id,name',
            'violenceCategory',
            'counselingSchedules' => function ($q) {
                $q->orderBy('created_at', 'desc');
            }
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $complaint->id,
                'report_id' => $complaint->report_id,
                'user_id' => $complaint->user_id,
                'user_name' => $complaint->user_id ? optional($complaint->user)->name : $complaint->guest_name,
                'user_email' => $complaint->guest_email ?: ($complaint->user_id ? optional($complaint->user)->email : null),
                'user_phone' => $complaint->guest_phone ?: ($complaint->user_id ? optional($complaint->user)->phone : null),
                'guest_name' => $complaint->guest_name,
                'guest_email' => $complaint->guest_email,
                'guest_phone' => $complaint->guest_phone,
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
                'is_external_victim' => $complaint->is_external_victim,
                'victim_identity_proof' => $complaint->victim_identity_proof ? asset('storage/' . $complaint->victim_identity_proof) : null,
                'suspect_name' => $complaint->suspect_name,
                'suspect_status' => $complaint->suspect_status,
                'suspect_affiliation' => $complaint->suspect_affiliation,
                'suspect_phone' => $complaint->suspect_phone,
                'location' => $complaint->location,
                'latitude' => $complaint->latitude,
                'longitude' => $complaint->longitude,
                'status' => $complaint->status,
                'rejection_reason' => $complaint->rejection_reason,
                'counseling_schedule' => optional($complaint->counseling_schedule)->toDateTimeString(),
                'urgency_level' => $complaint->urgency_level,
                'is_anonymous' => $complaint->is_anonymous,
                'ip_address' => $complaint->ip_address,
                'user_agent' => $complaint->user_agent,
                'file_path' => $complaint->file_path ? asset('storage/' . $complaint->file_path) : null,
                'created_at' => $complaint->created_at->toDateTimeString(),
                'updated_at' => $complaint->updated_at->toDateTimeString(),
                'counseling_notes' => $complaint->counselingSchedules->map(function ($s) {
                    return [
                        'id' => $s->id,
                        'counselee_type' => $s->counselee_type,
                        'counselee_name' => $s->counselee_name,
                        'tanggal' => $s->tanggal ? $s->tanggal->toDateString() : null,
                        'jam_mulai' => $s->jam_mulai,
                        'jam_selesai' => $s->jam_selesai,
                        'status' => $s->status,
                        'feedback_notes' => $s->feedback_notes,
                        'keterangan_pihak' => $s->keterangan_pihak,
                        'saran_konselor' => $s->saran_konselor,
                        'feedback_attachment' => $s->feedback_attachment ? asset('storage/' . $s->feedback_attachment) : null,
                        'created_at' => $s->created_at->toDateTimeString(),
                    ];
                }),
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
                'archived' => $completed + $rejected,
            ],
        ]);
    }

    public function export(Request $request)
    {
        $type = $request->query('type', 'all'); // all, daily, monthly, yearly
        $date = $request->query('date', now()->toDateString());

        $query = Complaint::with(['user', 'counselor', 'violenceCategory']);

        if ($type === 'daily') {
            $query->whereDate('created_at', $date);
        } elseif ($type === 'monthly') {
            $month = date('m', strtotime($date));
            $year = date('Y', strtotime($date));
            $query->whereMonth('created_at', $month)->whereYear('created_at', $year);
        } elseif ($type === 'yearly') {
            $year = date('Y', strtotime($date));
            $query->whereYear('created_at', $year);
        }

        $complaints = $query->orderBy('created_at', 'desc')->get();

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=laporan-pengaduan-" . now()->format('Ymd_His') . ".csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $callback = function() use($complaints) {
            $file = fopen('php://output', 'w');
            // Adding UTF-8 BOM for Excel compatibility
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            
            fputcsv($file, [
                'ID Laporan', 
                'Tanggal Lapor', 
                'Kategori Kekerasan', 
                'Tingkat Urgensi', 
                'Status', 
                'Nama Korban/Pelapor',
                'Tipe Korban',
                'Hubungan Korban',
                'Lokasi', 
                'Judul Aduan', 
                'Deskripsi', 
                'Konselor Penanggung Jawab', 
                'Jadwal Konseling',
                'Alasan Penolakan'
            ]);

            foreach ($complaints as $c) {
                fputcsv($file, [
                    $c->report_id,
                    $c->created_at->format('d/m/Y H:i'),
                    optional($c->violenceCategory)->name ?? optional($c->violenceCategory)->kategori,
                    $c->urgency_level,
                    strtoupper($c->status),
                    $c->user_id ? optional($c->user)->name : $c->guest_name,
                    $c->victim_type,
                    $c->victim_relationship,
                    $c->location,
                    $c->title,
                    $c->description,
                    optional($c->counselor)->name,
                    $c->counseling_schedule ? $c->counseling_schedule->format('d/m/Y H:i') : '-',
                    $c->rejection_reason ?? '-'
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function updateStatus(Request $request, Complaint $complaint)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,completed,rejected',
            'rejection_reason' => 'nullable|string',
        ]);

        if ($request->user()->role === 'konselor' && $complaint->counselor_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda hanya dapat memperbarui status laporan yang ditugaskan kepada Anda.'
            ], 403);
        }

        $complaint->update([
            'status' => $validated['status'],
            'rejection_reason' => $validated['rejection_reason'] ?? $complaint->rejection_reason,
        ]);

        // Sync status to associated counseling schedules
        \App\Models\CounselingSchedule::where('complaint_id', $complaint->id)
            ->update([
                'status' => $validated['status'],
                'approved_at' => ($validated['status'] === 'approved') ? now() : null
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
            'counseling_schedule' => 'nullable|date',
        ]);

        if ($request->user()->role === 'konselor' && $complaint->counselor_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda hanya dapat mengatur jadwal laporan yang ditugaskan kepada Anda.'
            ], 403);
        }

        $updateData = [
            'counselor_id' => $validated['counselor_id'] ?? $complaint->counselor_id,
            'status' => 'approved',
        ];
        // Only update schedule if provided
        if (!empty($validated['counseling_schedule'])) {
            $updateData['counseling_schedule'] = $validated['counseling_schedule'];
        }

        $complaint->update($updateData);

        // Sync status & counselor to associated counseling schedules
        \App\Models\CounselingSchedule::where('complaint_id', $complaint->id)
            ->update([
                'status' => 'approved',
                'counselor_id' => $updateData['counselor_id'] ?? $complaint->counselor_id,
                'approved_at' => now()
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Schedule and status updated successfully',
            'data' => $complaint,
        ]);
    }
}
