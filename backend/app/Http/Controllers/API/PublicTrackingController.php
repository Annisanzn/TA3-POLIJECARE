<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use Illuminate\Http\Request;

class PublicTrackingController extends Controller
{
    public function track(Request $request)
    {
        $validated = $request->validate([
            'report_id' => 'required|string',
            'tracking_code' => 'required|string|size:6',
        ]);

        $complaint = Complaint::where('report_id', $validated['report_id'])
            ->where('tracking_code', strtoupper($validated['tracking_code']))
            ->with(['violenceCategory', 'counselingSchedules' => function($q) {
                $q->orderBy('created_at', 'desc');
            }])
            ->first();

        if (!$complaint) {
            return response()->json([
                'success' => false,
                'message' => 'Laporan tidak ditemukan. Silakan periksa kembali Nomor Laporan dan Kode Akses Anda.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'report_id' => $complaint->report_id,
                'status' => $complaint->status,
                'title' => $complaint->title,
                'category' => optional($complaint->violenceCategory)->name ?? optional($complaint->violenceCategory)->kategori,
                'created_at' => $complaint->created_at->toDateTimeString(),
                'updated_at' => $complaint->updated_at->toDateTimeString(),
                'urgency_level' => $complaint->urgency_level,
                'history' => $complaint->counselingSchedules->map(function($s) {
                    return [
                        'status' => $s->status,
                        'tanggal' => $s->tanggal ? $s->tanggal->toDateString() : null,
                        'jam_mulai' => $s->jam_mulai,
                        'notes' => $s->feedback_notes,
                        'created_at' => $s->created_at->toDateTimeString(),
                    ];
                })
            ]
        ]);
    }
}
