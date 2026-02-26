<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\CounselorSchedule;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class CounselorScheduleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = CounselorSchedule::with('counselor');

        // Filter berdasarkan role
        if ($user->role === 'konselor') {
            $query->where('counselor_id', $user->id);
        } elseif ($user->role === 'operator') {
            // Operator bisa melihat semua, tapi bisa filter
            if ($request->has('counselor_id')) {
                $query->where('counselor_id', $request->counselor_id);
            }
        } else {
            // Mahasiswa hanya bisa melihat jadwal aktif
            $query->active();
            if ($request->has('counselor_id')) {
                $query->where('counselor_id', $request->counselor_id);
            }
        }

        // Filter hari
        if ($request->has('hari')) {
            $query->where('hari', $request->hari);
        }

        // Filter status aktif
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active === 'true');
        }

        $schedules = $query->orderBy('hari')
            ->orderBy('jam_mulai')
            ->get();

        // Cross-check booked slots for mahasiswa view
        if ($user->role !== 'konselor' && $user->role !== 'operator') {
            $dayMap = [
                'Senin' => 1, 'Selasa' => 2, 'Rabu' => 3, 'Kamis' => 4,
                'Jumat' => 5, 'Sabtu' => 6, 'Minggu' => 0,
                'Monday' => 1, 'Tuesday' => 2, 'Wednesday' => 3, 'Thursday' => 4,
                'Friday' => 5, 'Saturday' => 6, 'Sunday' => 0,
            ];

            $schedules = $schedules->map(function ($slot) use ($dayMap) {
                // Calculate the next occurrence date of this day
                $dayNum = $dayMap[$slot->hari] ?? null;
                if ($dayNum !== null) {
                    $today = now();
                    $diff = $dayNum - $today->dayOfWeek;
                    if ($diff <= 0) $diff += 7;
                    $nextDate = $today->copy()->addDays($diff)->toDateString();

                    // Check if this slot is already booked on that date
                    // Use TIME() to handle format differences (H:i vs H:i:s)
                    $slotTime = is_object($slot->jam_mulai) ? $slot->jam_mulai->format('H:i:s') : $slot->jam_mulai;
                    $isBooked = \App\Models\CounselingSchedule::where('counselor_id', $slot->counselor_id)
                        ->where('tanggal', $nextDate)
                        ->whereRaw('TIME(jam_mulai) = TIME(?)', [$slotTime])
                        ->whereIn('status', ['pending', 'approved'])
                        ->exists();

                    $slot->is_booked = $isBooked;
                    $slot->next_date = $nextDate;
                } else {
                    $slot->is_booked = false;
                    $slot->next_date = null;
                }
                return $slot;
            });
        }

        return response()->json([
            'success' => true,
            'data' => $schedules,
            'message' => 'Data jadwal konselor berhasil diambil'
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $validator = Validator::make($request->all(), [
            'counselor_id' => $user->role === 'operator' ? 'required|exists:users,id' : 'nullable',
            'hari' => 'required|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu,Minggu',
            'jam_mulai' => 'required|date_format:H:i',
            'jam_selesai' => 'required|date_format:H:i|after:jam_mulai',
            'slot_duration' => 'nullable|integer|min:15|max:240',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
                'message' => 'Validasi gagal'
            ], 422);
        }

        // Tentukan counselor_id berdasarkan role
        $counselorId = $request->counselor_id;
        if ($user->role === 'konselor') {
            $counselorId = $user->id;
        } elseif (!$counselorId) {
            return response()->json([
                'success' => false,
                'message' => 'Counselor ID diperlukan untuk operator'
            ], 422);
        }

        // Validasi: cek apakah counselor memiliki role konselor
        $counselor = User::find($counselorId);
        if (!$counselor || $counselor->role !== 'konselor') {
            return response()->json([
                'success' => false,
                'message' => 'User yang dipilih bukan konselor'
            ], 422);
        }

        // Validasi: cek overlap jadwal
        $overlap = CounselorSchedule::where('counselor_id', $counselorId)
            ->where('hari', $request->hari)
            ->where(function ($query) use ($request) {
                $query->where(function ($q) use ($request) {
                    $q->where('jam_mulai', '<', $request->jam_selesai)
                        ->where('jam_selesai', '>', $request->jam_mulai);
                });
            })
            ->exists();

        if ($overlap) {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal bertabrakan dengan jadwal yang sudah ada'
            ], 422);
        }

        // Validasi: cek duplicate
        $duplicate = CounselorSchedule::where('counselor_id', $counselorId)
            ->where('hari', $request->hari)
            ->where('jam_mulai', $request->jam_mulai)
            ->where('jam_selesai', $request->jam_selesai)
            ->exists();

        if ($duplicate) {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal dengan waktu yang sama sudah ada'
            ], 422);
        }

        $schedule = CounselorSchedule::create([
            'counselor_id' => $counselorId,
            'hari' => $request->hari,
            'jam_mulai' => $request->jam_mulai,
            'jam_selesai' => $request->jam_selesai,
            'slot_duration' => $request->slot_duration ?? 60,
            'is_active' => $request->is_active ?? true,
        ]);

        return response()->json([
            'success' => true,
            'data' => $schedule->load('counselor'),
            'message' => 'Jadwal berhasil ditambahkan'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $user = Auth::user();
        $schedule = CounselorSchedule::with('counselor')->find($id);

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal tidak ditemukan'
            ], 404);
        }

        // Authorization check
        if ($user->role === 'konselor' && $schedule->counselor_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke jadwal ini'
            ], 403);
        }

        // Generate time slots
        $timeSlots = $schedule->generateTimeSlots();

        return response()->json([
            'success' => true,
            'data' => [
                'schedule' => $schedule,
                'time_slots' => $timeSlots,
            ],
            'message' => 'Detail jadwal berhasil diambil'
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $schedule = CounselorSchedule::find($id);

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal tidak ditemukan'
            ], 404);
        }

        // Authorization check
        if ($user->role === 'konselor' && $schedule->counselor_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin untuk mengedit jadwal ini'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'hari' => 'sometimes|required|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu,Minggu',
            'jam_mulai' => 'sometimes|required|date_format:H:i',
            'jam_selesai' => 'sometimes|required|date_format:H:i|after:jam_mulai',
            'slot_duration' => 'nullable|integer|min:15|max:240',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
                'message' => 'Validasi gagal'
            ], 422);
        }

        // Validasi overlap (kecuali dengan dirinya sendiri)
        if ($request->has('hari') || $request->has('jam_mulai') || $request->has('jam_selesai')) {
            $hari = $request->hari ?? $schedule->hari;
            $jamMulai = $request->jam_mulai ?? $schedule->jam_mulai;
            $jamSelesai = $request->jam_selesai ?? $schedule->jam_selesai;

            $overlap = CounselorSchedule::where('counselor_id', $schedule->counselor_id)
                ->where('hari', $hari)
                ->where('id', '!=', $id)
                ->where(function ($query) use ($jamMulai, $jamSelesai) {
                    $query->where(function ($q) use ($jamMulai, $jamSelesai) {
                        $q->where('jam_mulai', '<', $jamSelesai)
                            ->where('jam_selesai', '>', $jamMulai);
                    });
                })
                ->exists();

            if ($overlap) {
                return response()->json([
                    'success' => false,
                    'message' => 'Jadwal bertabrakan dengan jadwal yang sudah ada'
                ], 422);
            }
        }

        $schedule->update($request->only(['hari', 'jam_mulai', 'jam_selesai', 'slot_duration', 'is_active']));

        return response()->json([
            'success' => true,
            'data' => $schedule->load('counselor'),
            'message' => 'Jadwal berhasil diperbarui'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $schedule = CounselorSchedule::find($id);

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal tidak ditemukan'
            ], 404);
        }

        // Authorization check
        if ($user->role === 'konselor' && $schedule->counselor_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin untuk menghapus jadwal ini'
            ], 403);
        }

        $schedule->delete();

        return response()->json([
            'success' => true,
            'message' => 'Jadwal berhasil dihapus'
        ]);
    }

    /**
     * Get available time slots for a counselor on a specific day.
     */
    public function getAvailableSlots($counselorId, $day)
    {
        $schedules = CounselorSchedule::where('counselor_id', $counselorId)
            ->where('hari', $day)
            ->active()
            ->get();

        $allSlots = [];
        foreach ($schedules as $schedule) {
            $slots = $schedule->generateTimeSlots();
            
            // Check each slot availability against existing counseling sessions
            foreach ($slots as &$slot) {
                $isBooked = \App\Models\CounselingSchedule::where('counselor_id', $counselorId)
                    ->whereDate('tanggal', '>=', now()->toDateString())
                    ->where('jam_mulai', '<=', $slot['end'])
                    ->where('jam_selesai', '>=', $slot['start'])
                    ->whereIn('status', ['pending', 'approved'])
                    ->exists();
                
                $slot['is_available'] = !$isBooked;
                $slot['schedule_id'] = $schedule->id;
            }
            
            $allSlots = array_merge($allSlots, $slots);
        }

        return response()->json([
            'success' => true,
            'data' => $allSlots,
            'message' => 'Slot tersedia berhasil diambil'
        ]);
    }

    /**
     * Get counselors with their schedules.
     */
    public function getCounselorsWithSchedules()
    {
        $counselors = User::where('role', 'konselor')
            ->with(['counselorSchedules' => function ($query) {
                $query->active()->orderBy('hari')->orderBy('jam_mulai');
            }])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $counselors,
            'message' => 'Data konselor dengan jadwal berhasil diambil'
        ]);
    }
}