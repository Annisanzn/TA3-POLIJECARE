<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\CounselingSchedule;
use App\Models\User;
use App\Services\CounselingNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class CounselingController extends Controller
{
    /**
     * Get all counseling schedules based on user role
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = CounselingSchedule::with(['user', 'counselor', 'complaint.counselor']);

        // Role-based filtering
        if ($user->role === 'konselor') {
            $query->where('counselor_id', $user->id);
            // Show ONLY Pelapor (Reporter) sessions in the schedule list
            // Witness/Suspect meetings only appear in the Complaint Detail
            $query->where('counselee_type', 'pelapor');
            $query->where('is_record_only', false); 
        } elseif ($user->role === 'operator') {
            // Operator dashboard only shows active student schedules
            $query->where('counselee_type', 'pelapor');
            $query->where('is_record_only', false);
        } elseif ($user->role === 'user') {
            $query->where('user_id', $user->id);
        }

        // Apply filters
        if ($request->has('status') && $request->status !== 'all') {
            $statuses = array_map('trim', explode(',', $request->status));
            if (count($statuses) > 1) {
                $query->whereIn('status', $statuses);
            } else {
                $query->where('status', $statuses[0]);
            }
        } else {
            // "Jika belum di Approve, jangan di masukkan ke Jadwal Konseling"
            $query->whereIn('status', ['approved', 'completed', 'rejected', 'cancelled']);
        }

        if ($request->has('counselor_id') && $request->counselor_id) {
            $query->where('counselor_id', $request->counselor_id);
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->where('tanggal', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->where('tanggal', '<=', $request->date_to);
        }

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                })->orWhereHas('counselor', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'tanggal');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 10);
        $schedules = $query->paginate($perPage);

        // Flatten the collection and ensure name consistency
        $schedules->setCollection(
            $schedules->getCollection()->map(function ($s) {
                // Determine the actual reporter/user name and phone
                // 1. From the schedule's user relation
                // 2. From the linked complaint's user relation
                // 3. From the linked complaint's guest data
                $userName = optional($s->user)->name 
                            ?? optional($s->complaint->user)->name 
                            ?? optional($s->complaint)->guest_name 
                            ?? 'Pelapor';
                            
                $userPhone = optional($s->user)->phone 
                             ?? optional($s->complaint->user)->phone 
                             ?? optional($s->complaint)->guest_phone;
                
                return [
                    'id' => $s->id,
                    'complaint_id' => $s->complaint_id,
                    'user_id' => $s->user_id,
                    'user_name' => $userName,
                    'user_phone' => $userPhone,
                    'counselor_id' => $s->counselor_id,
                    'counselor_name' => optional($s->counselor)->name ?? optional($s->complaint->counselor)->name ?? 'Belum diplot',
                    'tanggal' => $s->tanggal,
                    'jam_mulai' => $s->jam_mulai,
                    'jam_selesai' => $s->jam_selesai,
                    'tempat' => $s->tempat,
                    'status' => $s->status,
                    'keterangan' => $s->keterangan,
                    // Complaint fields needed for the card UI
                    'title' => optional($s->complaint)->title,
                    'description' => optional($s->complaint)->description,
                    'report_id' => optional($s->complaint)->report_id,
                    'urgency_level' => optional($s->complaint)->urgency_level,
                    'is_anonymous' => optional($s->complaint)->is_anonymous,
                    // Keep the nested object for compatibility
                    'complaint' => $s->complaint
                ];
            })
        );

        return response()->json([
            'success' => true,
            'data' => $schedules,
            'message' => 'Counseling schedules retrieved successfully'
        ]);
    }

    /**
     * Get detail of a single counseling schedule (with complaint info)
     */
    public function show($id)
    {
        $user = Auth::user();
        $schedule = CounselingSchedule::with(['user', 'counselor', 'complaint'])->findOrFail($id);

        // Role-based access
        if ($user->role === 'konselor' && $schedule->counselor_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to view this schedule'
            ], 403);
        } elseif ($user->role === 'user' && $schedule->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to view this schedule'
            ], 403);
        }

        $complaint = $schedule->complaint;

        return response()->json([
            'success' => true,
            'data' => [
                'id'                => $schedule->id,
                'status'            => $schedule->status,
                'tanggal'           => $schedule->tanggal,
                'jam_mulai'         => $schedule->jam_mulai,
                'jam_selesai'       => $schedule->jam_selesai,
                'metode'            => $schedule->metode,
                'lokasi'            => $schedule->lokasi,
                'meeting_link'      => $schedule->meeting_link,
                'jenis_pengaduan'   => $schedule->jenis_pengaduan,
                'alasan_penolakan'  => $schedule->alasan_penolakan ?? $schedule->rejection_reason ?? null,
                'approved_at'       => $schedule->approved_at,
                'created_at'        => $schedule->created_at,
                'user' => $schedule->user ? [
                    'id'    => $schedule->user->id,
                    'name'  => $schedule->user->name,
                    'email' => $schedule->user->email,
                    'nim'   => $schedule->user->nim ?? null,
                ] : null,
                'counselor' => $schedule->counselor ? [
                    'id'    => $schedule->counselor->id,
                    'name'  => $schedule->counselor->name,
                    'email' => $schedule->counselor->email,
                ] : null,
                'complaint' => $complaint ? [
                    'id'            => $complaint->id,
                    'report_id'     => $complaint->report_id,
                    'title'         => $complaint->title,
                    'description'   => $complaint->description,
                    'chronology'    => $complaint->chronology,
                    'urgency_level' => $complaint->urgency_level,
                    'location'      => $complaint->location,
                    'status'        => $complaint->status,
                    'file_path'     => $complaint->file_path,
                    'is_anonymous'  => $complaint->is_anonymous,
                    'victim_type'   => $complaint->victim_type,
                    'victim_name'   => $complaint->victim_name,
                ] : null,
            ],
            'message' => 'Counseling schedule retrieved successfully'
        ]);
    }


    public function getCounselors()
    {
        $counselors = User::where('role', 'konselor')
            ->select('id', 'name', 'email', 'nim', 'profile_photo', 'bio')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $counselors,
            'message' => 'Counselors retrieved successfully'
        ]);
    }

    /**
     * Get counseling schedules belonging to the logged-in user (mahasiswa)
     * Filterable by complaint_id
     */
    public function userSchedules(Request $request)
    {
        $user = Auth::user();
        $query = CounselingSchedule::with(['counselor:id,name', 'complaint:id,title'])
            ->where('user_id', $user->id);

        if ($request->has('complaint_id') && $request->complaint_id) {
            $query->where('complaint_id', $request->complaint_id);
        }

        $schedules = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data'    => $schedules,
            'message' => 'Counseling schedules retrieved'
        ]);
    }

    /**
     * Get available time slots for a counselor on a specific date
     */
    public function getAvailableSlots(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'counselor_id' => 'required|exists:users,id',
            'tanggal' => 'required|date|after_or_equal:today',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
                'message' => 'Validation failed'
            ], 422);
        }

        $counselorId = $request->counselor_id;
        $tanggal = $request->tanggal;

        // Define available time slots (9 AM to 5 PM, 1-hour slots)
        $availableSlots = [];
        $startHour = 9;
        $endHour = 17;

        for ($hour = $startHour; $hour < $endHour; $hour++) {
            $startTime = sprintf('%02d:00:00', $hour);
            $endTime = sprintf('%02d:00:00', $hour + 1);

            // Check if slot is already booked
            $isBooked = CounselingSchedule::where('counselor_id', $counselorId)
                ->where('tanggal', $tanggal)
                ->where(function ($query) use ($startTime, $endTime) {
                    $query->where(function ($q) use ($startTime, $endTime) {
                        $q->where('jam_mulai', '<', $endTime)
                          ->where('jam_selesai', '>', $startTime);
                    });
                })
                ->whereIn('status', ['pending', 'approved'])
                ->exists();

            $availableSlots[] = [
                'jam_mulai' => $startTime,
                'jam_selesai' => $endTime,
                'available' => !$isBooked,
                'display' => sprintf('%02d:00 - %02d:00', $hour, $hour + 1),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'slots' => $availableSlots,
                'counselor_id' => $counselorId,
                'tanggal' => $tanggal,
            ],
            'message' => 'Available slots retrieved successfully'
        ]);
    }

    /**
     * Create a new counseling schedule request
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        // Only users (mahasiswa) and counselors can create schedule requests
        if ($user->role !== 'user' && $user->role !== 'konselor') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized role'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'counselor_id' => 'nullable|exists:users,id',
            'complaint_id' => 'nullable|exists:complaints,id',
            'jenis_pengaduan' => 'nullable|string|max:255',
            'tanggal' => 'required|date',
            'jam_mulai' => ['required', 'regex:/^\d{2}:\d{2}(:\d{2})?$/'],
            'jam_selesai' => ['required', 'regex:/^\d{2}:\d{2}(:\d{2})?$/'],
            'metode' => ['nullable', Rule::in(['online', 'offline'])],
            'lokasi' => 'nullable|string|max:255',
            'meeting_link' => 'nullable|string|max:500',
            'counselee_type' => 'nullable|string|max:255',
            'counselee_name' => 'nullable|string|max:255',
            'keterangan_pihak' => 'nullable|string',
            'saran_konselor' => 'nullable|string',
            'is_record_only' => 'nullable|boolean',
            'feedback_attachment' => 'nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
                'message' => 'Validation failed'
            ], 422);
        }

        // Normalize time
        $jamMulai = substr($request->jam_mulai, 0, 5);
        $jamSelesai = substr($request->jam_selesai, 0, 5);

        // Check for double booking (only for future/non-completed sessions)
        $targetCounselorId = $request->counselor_id ?? ($user->role === 'konselor' ? $user->id : null);
        $isRecordOnly = $request->boolean('is_record_only', false);
        
        if ($targetCounselorId && !$isRecordOnly) {
            $hasConflict = CounselingSchedule::where('counselor_id', $targetCounselorId)
                ->where('tanggal', $request->tanggal)
                ->timeOverlap($jamMulai, $jamSelesai)
                ->whereIn('status', ['pending', 'approved'])
                ->exists();

            if ($hasConflict) {
                return response()->json([
                    'success' => false,
                    'message' => 'Slot waktu ini sudah dipesan. Silakan pilih jadwal lain.'
                ], 409);
            }
        }

        $data = [
            'user_id' => $user->role === 'user' ? $user->id : null,
            'complaint_id' => $request->complaint_id,
            'counselor_id' => $targetCounselorId,
            'jenis_pengaduan' => $request->jenis_pengaduan,
            'tanggal' => $request->tanggal,
            'jam_mulai' => $jamMulai,
            'jam_selesai' => $jamSelesai,
            'metode' => $request->metode ?? 'offline',
            'lokasi' => $request->lokasi ?? 'Kantor Satgas',
            'meeting_link' => $request->meeting_link,
            'counselee_type' => $request->counselee_type ?? 'pelapor',
            'counselee_name' => $request->counselee_name,
            'keterangan_pihak' => $request->keterangan_pihak,
            'saran_konselor' => $request->saran_konselor,
            'is_record_only' => $isRecordOnly,
            'status' => 'pending',
            'approved_at' => null,
        ];

        // Jika konselor yang buat, langsung approve dan set selesai jika ini adalah record/note
        if ($user->role === 'konselor') {
            $data['status'] = 'approved';
            $data['approved_at'] = now();
            
            if ($isRecordOnly) {
                $data['status'] = 'completed';
            }
        }

        // Handle attachment
        if ($request->hasFile('feedback_attachment')) {
            try {
                $path = $request->file('feedback_attachment')->store('counseling_feedback', 'public');
                $data['feedback_attachment'] = $path;
            } catch (\Exception $e) {
                \Log::error('Feedback attachment upload failed: ' . $e->getMessage());
            }
        }

        try {
            $schedule = CounselingSchedule::create($data);

            // Update complaint if linked
            if ($request->complaint_id) {
                $complaint = \App\Models\Complaint::find($request->complaint_id);
                if ($complaint) {
                    $complaint->update([
                        'counseling_schedule' => $request->tanggal . ' ' . $jamMulai . ':00'
                    ]);
                }
            }

            // Send notifications (only for new requests, not quick notes)
            if (!$request->filled('feedback_notes')) {
                try {
                    $notificationService = new \App\Services\CounselingNotificationService();
                    $notificationService->sendRequestNotification($schedule);
                } catch (\Exception $e) {
                    \Log::error('Notification failed: ' . $e->getMessage());
                }
            }

            return response()->json([
                'success' => true,
                'data' => $schedule->load(['user', 'counselor']),
                'message' => 'Counseling schedule/note created successfully'
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Counseling creation failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan data: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Approve a counseling schedule
     */
    public function approve($id)
    {
        $user = Auth::user();
        $schedule = CounselingSchedule::findOrFail($id);

        // Check permission
        if (!($user->role === 'operator' || ($user->role === 'konselor' && $schedule->counselor_id === $user->id))) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to approve this schedule'
            ], 403);
        }

        // Check if schedule can be approved
        if (!$schedule->isPending()) {
            return response()->json([
                'success' => false,
                'message' => 'Only pending schedules can be approved'
            ], 400);
        }

        // Update schedule
        $schedule->update([
            'status' => CounselingSchedule::STATUS_APPROVED,
            'approved_at' => now(),
        ]);

        // Sync to complaint
        if ($schedule->complaint_id) {
            $complaint = \App\Models\Complaint::find($schedule->complaint_id);
            if ($complaint) {
                $complaint->update(['status' => 'approved']);
            }
        }

        // Send approval notification email
        $notificationService = new CounselingNotificationService();
        $notificationService->sendApprovalNotification($schedule);

        return response()->json([
            'success' => true,
            'data' => $schedule->load(['user', 'counselor']),
            'message' => 'Counseling schedule approved successfully'
        ]);
    }

    /**
     * Reject a counseling schedule
     */
    public function reject(Request $request, $id)
    {
        $user = Auth::user();
        $schedule = CounselingSchedule::findOrFail($id);

        // Check permission
        if (!($user->role === 'operator' || ($user->role === 'konselor' && $schedule->counselor_id === $user->id))) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to reject this schedule'
            ], 403);
        }

        // Check if schedule can be rejected
        if (!$schedule->isPending()) {
            return response()->json([
                'success' => false,
                'message' => 'Only pending schedules can be rejected'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'rejection_reason' => 'required|string|min:10|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
                'message' => 'Validation failed'
            ], 422);
        }

        // Update schedule
        $schedule->update([
            'status' => CounselingSchedule::STATUS_REJECTED,
            'rejection_reason' => $request->rejection_reason,
        ]);

        // Sync to complaint
        if ($schedule->complaint_id) {
            $complaint = \App\Models\Complaint::find($schedule->complaint_id);
            if ($complaint) {
                $complaint->update(['status' => 'rejected']);
            }
        }

        // Send rejection notification email
        $notificationService = new CounselingNotificationService();
        $notificationService->sendRejectionNotification($schedule, $request->rejection_reason);

        return response()->json([
            'success' => true,
            'data' => $schedule->load(['user', 'counselor']),
            'message' => 'Counseling schedule rejected successfully'
        ]);
    }

    /**
     * Update schedule status
     */
    public function updateStatus(Request $request, $id)
    {
        $user = Auth::user();
        $schedule = CounselingSchedule::findOrFail($id);

        // Only operator can update status to completed/cancelled
        if ($user->role !== 'operator') {
            return response()->json([
                'success' => false,
                'message' => 'Only operators can update schedule status'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => ['required', Rule::in(['completed', 'rejected'])],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
                'message' => 'Validation failed'
            ], 422);
        }

        $schedule->update([
            'status' => $request->status,
        ]);

        // Sync to complaint
        if ($schedule->complaint_id && in_array($request->status, ['completed', 'rejected'])) {
            $complaint = \App\Models\Complaint::find($schedule->complaint_id);
            if ($complaint) {
                $complaint->update(['status' => $request->status]);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $schedule->load(['user', 'counselor']),
            'message' => 'Schedule status updated successfully'
        ]);
    }

    /**
     * Submit counseling feedback
     */
    public function submitFeedback(Request $request, $id)
    {
        $user = Auth::user();
        $schedule = CounselingSchedule::findOrFail($id);

        if ($user->role !== 'konselor' || $schedule->counselor_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to submit feedback for this schedule'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'keterangan_pihak' => 'required_without:feedback_notes|string',
            'saran_konselor' => 'nullable|string',
            'feedback_notes' => 'nullable|string', // Support legacy
            'feedback_attachment' => 'nullable|file|mimes:jpg,jpeg,png,pdf,mp3,wav,mp4|max:20480',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
                'message' => 'Validation failed'
            ], 422);
        }

        $attachmentPath = $schedule->feedback_attachment;
        if ($request->hasFile('feedback_attachment')) {
            $attachmentPath = $request->file('feedback_attachment')->store('counseling_feedbacks', 'public');
        }

        $schedule->update([
            'status' => 'completed',
            'keterangan_pihak' => $request->keterangan_pihak ?? $request->feedback_notes,
            'saran_konselor' => $request->saran_konselor,
            'feedback_notes' => $request->feedback_notes, // Keep for legacy
            'feedback_attachment' => $attachmentPath,
        ]);

        // Sync to complaint
        if ($schedule->complaint_id) {
            $complaint = \App\Models\Complaint::find($schedule->complaint_id);
            if ($complaint) {
                $complaint->update(['status' => 'completed']);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $schedule->load(['user', 'counselor']),
            'message' => 'Feedback submitted and schedule marked as completed'
        ]);
    }

    /**
     * Reassign counselor for a scheduled session
     */
    public function reassignCounselor(Request $request, $id)
    {
        $user = Auth::user();
        if ($user->role !== 'operator') {
            return response()->json([
                'success' => false,
                'message' => 'Only operators can reassign counselors'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'counselor_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $counselor = User::find($request->counselor_id);
        if ($counselor->role !== 'konselor') {
            return response()->json([
                'success' => false,
                'message' => 'Selected user is not a counselor'
            ], 422);
        }

        $schedule = CounselingSchedule::findOrFail($id);

        $schedule->update([
            'counselor_id' => $request->counselor_id
        ]);

        return response()->json([
            'success' => true,
            'data' => $schedule->load(['user', 'counselor']),
            'message' => 'Counselor reassigned successfully'
        ]);
    }

    /**
     * Get schedule statistics
     */
    public function statistics()
    {
        $user = Auth::user();
        $query = CounselingSchedule::query();

        // Role-based filtering
        if ($user->role === 'konselor') {
            $query->where('counselor_id', $user->id);
        } elseif ($user->role === 'user') {
            $query->where('user_id', $user->id);
        }

        $today = now()->toDateString();
        $stats = [
            'total' => $query->count(),
            'pending' => (clone $query)->where('status', 'pending')->count(),
            'approved' => (clone $query)->where('status', 'approved')->count(),
            'rejected' => (clone $query)->where('status', 'rejected')->count(),
            'completed' => (clone $query)->where('status', 'completed')->count(),
            'cancelled' => (clone $query)->where('status', 'cancelled')->count(),
            'today' => (clone $query)->where('status', 'approved')->whereDate('tanggal', $today)->count(),
            'upcoming' => (clone $query)->where('status', 'approved')->whereDate('tanggal', '>', $today)->count(),
            'archived' => (clone $query)->where(function($q) use ($today) {
                $q->whereIn('status', ['completed', 'rejected', 'cancelled'])
                  ->orWhereDate('tanggal', '<', $today);
            })->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
            'message' => 'Statistics retrieved successfully'
        ]);
    }
}