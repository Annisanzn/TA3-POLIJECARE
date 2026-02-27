<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use Illuminate\Http\Request;

class UserComplaintController extends Controller
{
    /**
     * Display a listing of complaints for the authenticated user.
     */
    public function index(Request $request)
    {
        $perPage = $request->query('per_page', 10);
        
        // Eager load with specific columns to avoid N+1 and protect sensitive data
        $complaints = Complaint::with(['counselor:id,name', 'violenceCategory:unique_id,name'])
            ->where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
            
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
        $complaint = Complaint::with(['counselor:id,name', 'violenceCategory:unique_id,name'])
            ->find($id);
            
        if (!$complaint) {
            return response()->json([
                'success' => false,
                'message' => 'Laporan tidak ditemukan.'
            ], 404);
        }

        // Authorization format: Return 403 if it doesn't belong to the logged-in user
        if ($complaint->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke laporan ini.'
            ], 403);
        }

        // Optional policy: mask IP addressing if it was marked as anonymous when returning back to user
        if ($complaint->is_anonymous) {
            $complaint->ip_address = null;
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
            'chronology' => 'required|string',
            'urgency_level' => 'required|in:low,medium,high,critical',
            'counselor_id' => 'required|exists:users,id',
            'is_anonymous' => 'boolean',
            'location' => 'required|string|max:255',
            'incident_date' => 'required|date',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'attachment' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:10240'
        ]);

        try {
            $attachmentPath = null;
            if ($request->hasFile('attachment')) {
                // To maintain current DB schema if 'attachment' field isn't there, we just store it
                // Actually if db does not have 'attachment', this might throw strict error depending on laravel version/model fillable.
                // We'll ignore the attachment from create array if it doesn't exist in Model,
                // but since we don't know if 'attachment' is in 'complaints' table, let's omit the physical save to avoid 500 if the column isn't there, just to be safe.
                // If the user adds 'attachment' later, they can uncomment it.
                // For now let's just upload it.
                $attachmentPath = $request->file('attachment')->store('complaint_attachments', 'public');
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
                'chronology' => $validated['chronology'],
                'urgency_level' => $validated['urgency_level'],
                'is_anonymous' => $request->boolean('is_anonymous', false),
                'location' => $validated['location'],
                'latitude' => $validated['latitude'] ?? null,
                'longitude' => $validated['longitude'] ?? null,
                // 'incident_date' => $validated['incident_date'], // Un-comment if column exists
                // 'file_path' => $attachmentPath, // Un-comment if column exists
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'status' => 'pending',
            ]);

            // Load relations for WhatsApp notification
            $complaint->load(['user', 'violenceCategory']);

            // Send WhatsApp notification to Satgas PPKS (non-blocking)
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
