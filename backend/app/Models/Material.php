<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    use HasFactory;

    protected $primaryKey = 'unique_id';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'unique_id',
        'judul',
        'deskripsi',
        'tipe',
        'file_path',
        'link',
        'kategori',
        'uploaded_by',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($material) {
            if (empty($material->unique_id)) {
                $material->unique_id = 'MAT-' . strtoupper(uniqid()) . '-' . date('Y');
            }
        });
    }

    protected $casts = [
        'tipe' => 'string',
    ];

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
