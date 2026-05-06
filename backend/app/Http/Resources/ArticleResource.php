<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class ArticleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $now = now();

        if (!$this->is_active) {
            $statusLabel = 'Nonaktif';
        } elseif (!$this->published_at) {
            $statusLabel = 'Draft';
        } elseif ($this->published_at->gt($now)) {
            $statusLabel = 'Terjadwal';
        } else {
            $statusLabel = 'Publish';
        }

        return [
            'id'           => $this->id,
            'title'        => $this->title,
            'slug'         => $this->slug,
            'image'        => $this->image ? asset('storage/' . $this->image) : null,
            'excerpt'      => Str::limit(strip_tags($this->content), 150),
            'content'      => $this->content,
            'is_published' => $this->is_published,
            'is_active'    => $this->is_active,
            'status_label' => $statusLabel,
            'published_at' => $this->published_at?->toISOString(),
            'created_at'   => $this->created_at,
            'updated_at'   => $this->updated_at,
        ];
    }
}
