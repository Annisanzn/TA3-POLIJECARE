<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ViolenceCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ViolenceCategoryController extends Controller
{
    public function index(Request $request)
    {
        // Check if user is operator
        if (auth()->user()->role !== 'operator') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only operators can access this resource.',
            ], 403);
        }

        $query = ViolenceCategory::query();

        // Search by name
        if ($request->has('search') && !empty($request->search)) {
            $query->where('name', 'LIKE', '%' . $request->search . '%');
        }

        $categories = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 10);

        return response()->json([
            'categories' => $categories->items(),
            'pagination' => [
                'total' => $categories->total(),
                'per_page' => $categories->perPage(),
                'current_page' => $categories->currentPage(),
                'total_pages' => $categories->lastPage(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        // Check if user is operator
        if (auth()->user()->role !== 'operator') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only operators can access this resource.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:violence_categories,name',
            'description' => 'nullable|string|max:1000',
        ], [
            'name.required' => 'Nama kategori wajib diisi',
            'name.unique' => 'Nama kategori sudah ada',
            'name.max' => 'Nama kategori maksimal 255 karakter',
            'description.max' => 'Deskripsi maksimal 1000 karakter',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $category = ViolenceCategory::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Kategori kekerasan berhasil ditambahkan',
            'data' => $category,
        ], 201);
    }

    public function update(Request $request, $unique_id)
    {
        // Check if user is operator
        if (auth()->user()->role !== 'operator') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only operators can access this resource.',
            ], 403);
        }

        $category = ViolenceCategory::findOrFail($unique_id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:violence_categories,name,' . $unique_id,
            'description' => 'nullable|string|max:1000',
        ], [
            'name.required' => 'Nama kategori wajib diisi',
            'name.unique' => 'Nama kategori sudah ada',
            'name.max' => 'Nama kategori maksimal 255 karakter',
            'description.max' => 'Deskripsi maksimal 1000 karakter',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $category->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Kategori kekerasan berhasil diperbarui',
            'data' => $category,
        ]);
    }

    public function destroy($unique_id)
    {
        // Check if user is operator
        if (auth()->user()->role !== 'operator') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only operators can access this resource.',
            ], 403);
        }

        $category = ViolenceCategory::findOrFail($unique_id);

        // For now, allow deletion since complaints relation is not properly set up
        // TODO: Add complaints count check when relation is fixed

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kategori kekerasan berhasil dihapus',
        ]);
    }
}
