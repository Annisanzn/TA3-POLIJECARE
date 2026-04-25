<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PublicComplaintController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'guest_name' => 'required|string|max:255',
            'guest_email' => 'required|email|max:255',
            'guest_phone' => 'required|string|max:20',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'violence_category_id' => 'required|exists:violence_categories,unique_id',
            'victim_type' => 'required|in:self,other',
            'victim_name' => 'required_if:victim_type,other|nullable|string|max:255',
            'victim_relationship' => 'required_if:victim_type,other|nullable|string|max:255',
            'suspect_name' => 'required|string|max:255',
            'suspect_status' => 'required|string|max:255',
            'suspect_affiliation' => 'required|string|max:255',
            'suspect_phone' => 'nullable|string|max:30',
            'chronology' => 'required|string',
            'urgency_level' => 'required|in:low,medium,high,critical',
            'location' => 'required|string|max:255',
            'incident_date' => 'required|date|before_or_equal:today',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'attachments.*' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:10240',
            'victim_identity_proof' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:10240',
        ]);

        try {
            $attachmentPath = null;
            if ($request->hasFile('attachment')) {
                $attachmentPath = $request->file('attachment')->store('complaint_attachments', 'public');
            }

            $identityProofPath = null;
            if ($request->hasFile('victim_identity_proof')) {
                $identityProofPath = $request->file('victim_identity_proof')->store('identity_proofs', 'public');
            }

            $complaint = Complaint::create([
                'user_id' => null, // Guest report
                'counselor_id' => null, // Unassigned
                'guest_name' => $validated['guest_name'],
                'guest_email' => $validated['guest_email'] ?? null,
                'guest_phone' => $validated['guest_phone'],
                'violence_category_id' => $validated['violence_category_id'],
                'title' => $validated['title'],
                'description' => $validated['description'],
                'victim_type' => $validated['victim_type'],
                'victim_name' => $validated['victim_name'] ?? null,
                'victim_relationship' => $validated['victim_relationship'] ?? null,
                'is_external_victim' => true,
                'victim_identity_proof' => $identityProofPath,
                'suspect_name' => $validated['suspect_name'],
                'suspect_status' => $validated['suspect_status'],
                'suspect_affiliation' => $validated['suspect_affiliation'],
                'suspect_phone' => $validated['suspect_phone'] ?? null,
                'chronology' => $validated['chronology'],
                'urgency_level' => $validated['urgency_level'],
                'location' => $validated['location'],
                'incident_date' => $validated['incident_date'] ?? null,
                'latitude' => $validated['latitude'] ?? null,
                'longitude' => $validated['longitude'] ?? null,
                'file_path' => $attachmentPath,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'status' => 'pending',
            ]);

            // Handle multiple attachments if present
            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $path = $file->store('complaint_attachments', 'public');
                    \App\Models\ComplaintAttachment::create([
                        'complaint_id' => $complaint->id,
                        'file_path' => $path,
                        'file_name' => $file->getClientOriginalName(),
                        'file_type' => $file->getClientMimeType(),
                        'file_size' => $file->getSize(),
                    ]);
                }
            } elseif ($attachmentPath) {
                // If only legacy single file is present, also add to attachments table for consistency
                \App\Models\ComplaintAttachment::create([
                    'complaint_id' => $complaint->id,
                    'file_path' => $attachmentPath,
                    'file_name' => $request->file('attachment')->getClientOriginalName(),
                    'file_type' => $request->file('attachment')->getClientMimeType(),
                    'file_size' => $request->file('attachment')->getSize(),
                ]);
            }

            // Notify via WA (optional)
            try {
                \App\Services\WhatsAppNotificationService::notifyNewComplaint($complaint);
            } catch (\Exception $e) {
                Log::warning('WhatsApp notification failed: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Laporan publik berhasil dibuat. Nomor Registrasi: ' . $complaint->report_id,
                'data' => $complaint
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menyimpan laporan: ' . $e->getMessage()
            ], 500);
        }
    }
}
