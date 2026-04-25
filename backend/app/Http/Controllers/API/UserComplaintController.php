<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class UserComplaintController extends Controller
{
    /**
     * Display a listing of complaints for the authenticated user.
     */
    public function index(Request $request)
    {
        $perPage = $request->query('per_page', 10);
        $search = $request->query('search', '');
        $status = $request->query('status', '');

        $query = Complaint::with(['counselor:id,name', 'violenceCategory:unique_id,name'])
            ->where('user_id', auth()->id());

        // Search by title or report_id
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('report_id', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if (!empty($status) && $status !== 'all') {
            $query->where('status', $status);
        }

        $complaints = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $complaints->items(),
            'meta' => [
                'current_page' => $complaints->currentPage(),
                'last_page' => $complaints->lastPage(),
                'per_page' => $complaints->perPage(),
                'total' => $complaints->total(),
            ]
        ]);
    }

    /**
     * Display the specified complaint for the authenticated user.
     */
    public function show($id)
    {
        $complaint = Complaint::with(['counselor:id,name', 'violenceCategory:unique_id,name', 'attachments'])
            ->find($id);

        if (!$complaint) {
            return response()->json([
                'success' => false,
                'message' => 'Laporan tidak ditemukan.'
            ], 404);
        }

        // Authorization format: Return 403 if it doesn't belong to the logged-in user
        if ((int) $complaint->user_id !== (int) auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke laporan ini.'
            ], 403);
        }


        return response()->json([
            'success' => true,
            'data' => $complaint
        ]);
    }

    /**
     * Store a newly created complaint in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'violence_category_id' => 'required|exists:violence_categories,unique_id',
            'victim_type' => 'required|in:self,other',
            'victim_name' => 'required_if:victim_type,other|nullable|string|max:255',
            'victim_relationship' => 'required_if:victim_type,other|nullable|string|max:255',
            'is_external_victim' => 'boolean',
            'suspect_name' => 'required|string|max:255',
            'suspect_status' => 'required|string|max:255',
            'suspect_affiliation' => 'required|string|max:255',
            'suspect_phone' => 'nullable|string|max:30',
            'chronology' => 'required|string',
            'urgency_level' => 'required|in:low,medium,high,critical',
            'counselor_id' => 'required|exists:users,id',
            'location' => 'required|string|max:255',
            'incident_date' => Schema::hasColumn('complaints', 'incident_date') ? 'required|date|before_or_equal:today' : 'nullable',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'attachments.*' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:10240',
            'victim_identity_proof' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:10240',
            'guest_name' => 'nullable|string|max:255',
            'guest_email' => 'required|email|max:255',
            'guest_phone' => 'required|string|max:20',
        ]);

        try {
            $identityProofPath = null;
            if ($request->hasFile('victim_identity_proof')) {
                $identityProofPath = $request->file('victim_identity_proof')->store('identity_proofs', 'public');
            }

            $complaint = Complaint::create([
                'user_id' => auth()->id(),
                'counselor_id' => $validated['counselor_id'],
                'violence_category_id' => $validated['violence_category_id'],
                'title' => $validated['title'],
                'description' => $validated['description'],
                'victim_type' => $validated['victim_type'],
                'victim_name' => $validated['victim_name'] ?? null,
                'victim_relationship' => $validated['victim_relationship'] ?? null,
                'is_external_victim' => $request->boolean('is_external_victim', false),
                'victim_identity_proof' => $identityProofPath,
                'suspect_name' => $validated['suspect_name'],
                'suspect_status' => $validated['suspect_status'],
                'suspect_affiliation' => $validated['suspect_affiliation'],
                'suspect_phone' => $validated['suspect_phone'] ?? null,
                'chronology' => $validated['chronology'],
                'urgency_level' => $validated['urgency_level'],
                'location' => $validated['location'],
                'latitude' => $validated['latitude'] ?? null,
                'longitude' => $validated['longitude'] ?? null,
                'incident_date' => Schema::hasColumn('complaints', 'incident_date') ? ($validated['incident_date'] ?? null) : null,
                'file_path' => null, // Will be set to the first attachment if any
                'guest_name' => $validated['guest_name'] ?? null,
                'guest_email' => $validated['guest_email'] ?? null,
                'guest_phone' => $validated['guest_phone'] ?? null,

                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'status' => 'pending',
            ]);

            // Handle multiple attachments
            if ($request->hasFile('attachments')) {
                $files = $request->file('attachments');
                if (!is_array($files)) {
                    $files = [$files];
                }

                foreach ($files as $index => $file) {
                    $path = $file->store('complaint_attachments', 'public');
                    
                    $complaint->attachments()->create([
                        'file_path' => $path,
                        'file_name' => $file->getClientOriginalName(),
                        'file_type' => $file->getClientMimeType(),
                        'file_size' => $file->getSize(),
                    ]);

                    // Set the first attachment as the main file_path for backward compatibility
                    if ($index === 0) {
                        $complaint->update(['file_path' => $path]);
                    }
                }
            }
            // Backward compatibility for single 'attachment' field
            elseif ($request->hasFile('attachment')) {
                $file = $request->file('attachment');
                $path = $file->store('complaint_attachments', 'public');
                $complaint->update(['file_path' => $path]);
                $complaint->attachments()->create([
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'file_type' => $file->getClientMimeType(),
                    'file_size' => $file->getSize(),
                ]);
            }

            // Load relations for response and WhatsApp
            $complaint->load(['user', 'violenceCategory', 'attachments']);

            // Send WhatsApp notification
            try {
                \App\Services\WhatsAppNotificationService::notifyNewComplaint($complaint);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::warning('WhatsApp notification failed: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Laporan berhasil dibuat.',
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
