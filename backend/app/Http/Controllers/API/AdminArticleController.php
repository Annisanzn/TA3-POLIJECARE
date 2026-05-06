<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AdminArticleController extends Controller
{
    /**
     * Daftar semua artikel (untuk operator dashboard).
     * Mendukung pagination, search, dan filter status.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Article::latest();

            // Filter by search
            if ($request->filled('search')) {
                $query->where('title', 'like', '%' . $request->search . '%');
            }

            // Filter by status
            if ($request->filled('status')) {
                $now = now();
                switch ($request->status) {
                    case 'published':
                        $query->where('is_active', true)
                              ->where('is_published', true)
                              ->where('published_at', '<=', $now);
                        break;
                    case 'scheduled':
                        $query->where('is_published', true)
                              ->where('published_at', '>', $now);
                        break;
                    case 'draft':
                        $query->where(function ($q) {
                            $q->where('is_published', false)
                              ->orWhereNull('published_at');
                        });
                        break;
                    case 'inactive':
                        $query->where('is_active', false);
                        break;
                }
            }

            $perPage = $request->input('per_page', 10);
            $articles = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'articles' => $articles->map(fn($a) => $this->formatArticle($a)),
                    'pagination' => [
                        'current_page' => $articles->currentPage(),
                        'last_page'    => $articles->lastPage(),
                        'per_page'     => $articles->perPage(),
                        'total'        => $articles->total(),
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data artikel: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Buat artikel baru.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title'        => 'required|string|max:255',
            'content'      => 'required|string',
            'image'        => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'published_at' => 'nullable|date',
            'is_active'    => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            $data = $validator->validated();

            // Upload gambar
            if ($request->hasFile('image')) {
                $data['image'] = $request->file('image')->store('articles', 'public');
            }

            // Auto slug
            $data['slug']         = $this->generateSlug($data['title']);
            $data['is_published'] = !empty($data['published_at']);
            $data['is_active']    = $request->boolean('is_active', true);

            $article = Article::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Artikel berhasil dibuat',
                'data'    => $this->formatArticle($article),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat artikel: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update artikel yang ada.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $article = Article::find($id);
        if (!$article) {
            return response()->json(['success' => false, 'message' => 'Artikel tidak ditemukan'], 404);
        }

        $validator = Validator::make($request->all(), [
            'title'        => 'required|string|max:255',
            'content'      => 'required|string',
            'image'        => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'published_at' => 'nullable|date',
            'is_active'    => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            $data = $validator->validated();

            // Upload gambar baru — hapus yang lama
            if ($request->hasFile('image')) {
                if ($article->image) {
                    Storage::disk('public')->delete($article->image);
                }
                $data['image'] = $request->file('image')->store('articles', 'public');
            }

            // Update slug jika judul berubah
            if ($article->title !== $data['title']) {
                $data['slug'] = $this->generateSlug($data['title']);
            }

            $data['is_published'] = !empty($data['published_at']);
            $data['is_active']    = $request->boolean('is_active', $article->is_active);

            $article->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Artikel berhasil diperbarui',
                'data'    => $this->formatArticle($article->fresh()),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui artikel: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Hapus artikel + gambarnya.
     */
    public function destroy(string $id): JsonResponse
    {
        $article = Article::find($id);
        if (!$article) {
            return response()->json(['success' => false, 'message' => 'Artikel tidak ditemukan'], 404);
        }

        try {
            // Hapus gambar dari storage
            if ($article->image) {
                Storage::disk('public')->delete($article->image);
            }

            $article->delete();

            return response()->json([
                'success' => true,
                'message' => 'Artikel berhasil dihapus',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus artikel: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Toggle is_active (aktif/nonaktif).
     */
    public function toggle(string $id): JsonResponse
    {
        $article = Article::find($id);
        if (!$article) {
            return response()->json(['success' => false, 'message' => 'Artikel tidak ditemukan'], 404);
        }

        try {
            $article->update(['is_active' => !$article->is_active]);

            return response()->json([
                'success' => true,
                'message' => $article->is_active ? 'Artikel diaktifkan' : 'Artikel dinonaktifkan',
                'data'    => $this->formatArticle($article->fresh()),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengubah status artikel: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Format artikel untuk response JSON.
     */
    private function formatArticle(Article $article): array
    {
        $now = now();

        // Tentukan status label
        if (!$article->is_active) {
            $statusLabel = 'Nonaktif';
        } elseif (!$article->published_at) {
            $statusLabel = 'Draft';
        } elseif ($article->published_at->gt($now)) {
            $statusLabel = 'Terjadwal';
        } else {
            $statusLabel = 'Publish';
        }

        return [
            'id'           => $article->id,
            'title'        => $article->title,
            'slug'         => $article->slug,
            'image'        => $article->image ? asset('storage/' . $article->image) : null,
            'image_path'   => $article->image,
            'excerpt'      => Str::limit(strip_tags($article->content), 150),
            'content'      => $article->content,
            'is_published' => $article->is_published,
            'is_active'    => $article->is_active,
            'published_at' => $article->published_at?->toISOString(),
            'status_label' => $statusLabel,
            'created_at'   => $article->created_at->toISOString(),
            'updated_at'   => $article->updated_at->toISOString(),
        ];
    }

    /**
     * Generate slug unik dari judul.
     */
    private function generateSlug(string $title): string
    {
        $slug  = Str::slug($title);
        $count = Article::where('slug', 'like', $slug . '%')->count();
        return $count > 0 ? $slug . '-' . ($count + 1) : $slug;
    }
}
