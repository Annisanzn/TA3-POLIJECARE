<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    use HasFactory;

    protected $fillable = [
        'judul',
        'deskripsi',
        'tipe',
        'file_path',
        'link',
        'kategori',
        'uploaded_by',
    ];

    protected $casts = [
        'tipe' => 'string',
    ];

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
