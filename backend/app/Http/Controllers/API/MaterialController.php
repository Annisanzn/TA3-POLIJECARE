<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Material;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class MaterialController extends Controller
{
    public function index(Request $request)
    {
        $query = Material::with('uploader:id,name,role');

        // Role-based access
        if (auth()->user()->role === 'konselor') {
            $query->where('uploaded_by', auth()->id());
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('judul', 'like', "%{$search}%")
                  ->orWhere('kategori', 'like', "%{$search}%");
            });
        }

        // Filter by kategori
        if ($request->filled('kategori')) {
            $query->where('kategori', $request->kategori);
        }

        // Filter by tipe
        if ($request->filled('tipe')) {
            $query->where('tipe', $request->tipe);
        }

        // Pagination
        $perPage = $request->get('per_page', 10);
        $materials = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => [
                'materials' => $materials->items(),
                'pagination' => [
                    'total' => $materials->total(),
                    'per_page' => $materials->perPage(),
                    'current_page' => $materials->currentPage(),
                    'total_pages' => $materials->lastPage(),
                ],
            ],
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'judul' => 'required|string|max:255',
                'deskripsi' => 'nullable|string|max:1000',
                'tipe' => 'required|in:file,link',
                'kategori' => 'required|string|max:100',
                'file' => 'required_if:tipe,file|file|mimes:pdf,doc,docx|max:5120',
                'link' => 'required_if:tipe,link|url|max:500',
            ], [
                'judul.required' => 'Judul wajib diisi',
                'judul.max' => 'Judul maksimal 255 karakter',
                'deskripsi.max' => 'Deskripsi maksimal 1000 karakter',
                'tipe.required' => 'Tipe materi wajib dipilih',
                'kategori.required' => 'Kategori wajib dipilih',
                'file.required_if' => 'File wajib diupload untuk tipe file',
                'file.mimes' => 'File harus berformat PDF, DOC, atau DOCX',
                'file.max' => 'Ukuran file maksimal 5MB',
                'link.required_if' => 'Link wajib diisi untuk tipe link',
                'link.url' => 'Format link tidak valid',
            ]);

            if ($validator->fails()) {
                $errors = $validator->errors()->all();
                $errorMessage = count($errors) > 0 ? $errors[0] : 'Validation error';
                
                return response()->json([
                    'success' => false,
                    'message' => $errorMessage,
                    'errors' => $validator->errors(),
                ], 422);
            }

            $data = [
                'judul' => $request->judul,
                'deskripsi' => $request->deskripsi,
                'tipe' => $request->tipe,
                'kategori' => $request->kategori,
                'uploaded_by' => auth()->id(),
            ];

            if ($request->tipe === 'file') {
                try {
                    $file = $request->file('file');
                    
                    // Check if file was uploaded
                    if (!$file) {
                        return response()->json([
                            'success' => false,
                            'message' => 'File tidak ditemukan dalam request',
                        ], 422);
                    }
                    
                    // Check file size (max 5MB = 5 * 1024 * 1024 bytes)
                    if ($file->getSize() > 5 * 1024 * 1024) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Ukuran file terlalu besar. Maksimal 5MB',
                        ], 422);
                    }
                    
                    $filename = time() . '_' . $file->getClientOriginalName();
                    $path = $file->storeAs('materials', $filename, 'public');
                    
                    if (!$path) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Gagal menyimpan file ke storage',
                        ], 500);
                    }
                    
                    $data['file_path'] = $path;
                } catch (\Exception $e) {
                    Log::error('File upload error: ' . $e->getMessage());
                    return response()->json([
                        'success' => false,
                        'message' => 'Gagal mengupload file: ' . $e->getMessage(),
                    ], 500);
                }
            } else {
                $data['link'] = $request->link;
            }

            $material = Material::create($data);
            $material->load('uploader:id,name,role');

            return response()->json([
                'success' => true,
                'message' => 'Material berhasil ditambahkan',
                'data' => $material,
            ], 201);
            
        } catch (\Exception $e) {
            Log::error('Material store error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan server: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        $material = Material::findOrFail($id);

        // Authorization: operator or uploader
        if (auth()->user()->role !== 'operator' && $material->uploaded_by !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        // Delete file if exists
        if ($material->tipe === 'file' && $material->file_path) {
            Storage::disk('public')->delete($material->file_path);
        }

        $material->delete();

        return response()->json([
            'success' => true,
            'message' => 'Material berhasil dihapus',
        ]);
    }
}
