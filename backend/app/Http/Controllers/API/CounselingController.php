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
        $query = CounselingSchedule::with(['user', 'counselor', 'complaint']);

        // Role-based filtering
        if ($user->role === 'konselor') {
            $query->where('counselor_id', $user->id);
        } elseif ($user->role === 'user') {
            $query->where('user_id', $user->id);
        }
        // Operator can see all schedules (no filter)

        // Apply filters
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
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

        return response()->json([
            'success' => true,
            'data' => $schedules,
            'message' => 'Counseling schedules retrieved successfully'
        ]);
    }

    /**
     * Get available counselors
     */
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

        // Only users (mahasiswa) can create schedule requests
        if ($user->role !== 'user') {
            return response()->json([
                'success' => false,
                'message' => 'Only students can request counseling schedules'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'counselor_id' => 'required|exists:users,id',
            'complaint_id' => 'nullable|exists:complaints,id',
            'jenis_pengaduan' => 'nullable|string|max:255',
            'tanggal' => 'required|date|after_or_equal:today',
            'jam_mulai' => ['required', 'regex:/^\d{2}:\d{2}(:\d{2})?$/'],
            'jam_selesai' => ['required', 'regex:/^\d{2}:\d{2}(:\d{2})?$/'],
            'metode' => ['required', Rule::in(['online', 'offline'])],
            'lokasi' => 'nullable|string|max:255',
            'meeting_link' => 'nullable|string|max:500',
        ]);

        // Normalize time to H:i format
        $jamMulai = substr($request->jam_mulai, 0, 5);
        $jamSelesai = substr($request->jam_selesai, 0, 5);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
                'message' => 'Validation failed'
            ], 422);
        }

        // Check for double booking
        $hasConflict = CounselingSchedule::where('counselor_id', $request->counselor_id)
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

        // Create the schedule
        $schedule = CounselingSchedule::create([
            'user_id' => $user->id,
            'counselor_id' => $request->counselor_id,
            'complaint_id' => $request->complaint_id,
            'jenis_pengaduan' => $request->jenis_pengaduan,
            'tanggal' => $request->tanggal,
            'jam_mulai' => $jamMulai,
            'jam_selesai' => $jamSelesai,
            'metode' => $request->metode,
            'lokasi' => $request->lokasi,
            'meeting_link' => $request->meeting_link,
            'status' => CounselingSchedule::STATUS_PENDING,
        ]);

        if ($request->complaint_id) {
            $complaint = \App\Models\Complaint::find($request->complaint_id);
            if ($complaint) {
                $complaint->update([
                    'counseling_schedule' => $request->tanggal . ' ' . $jamMulai . ':00'
                ]);
            }
        }

        // Send email notifications
        $notificationService = new CounselingNotificationService();
        $notificationService->sendRequestNotification($schedule);

        return response()->json([
            'success' => true,
            'data' => $schedule->load(['user', 'counselor']),
            'message' => 'Counseling schedule request created successfully'
        ], 201);
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

        $stats = [
            'total' => $query->count(),
            'pending' => $query->clone()->where('status', 'pending')->count(),
            'approved' => $query->clone()->where('status', 'approved')->count(),
            'rejected' => $query->clone()->where('status', 'rejected')->count(),
            'completed' => $query->clone()->where('status', 'completed')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
            'message' => 'Statistics retrieved successfully'
        ]);
    }
}