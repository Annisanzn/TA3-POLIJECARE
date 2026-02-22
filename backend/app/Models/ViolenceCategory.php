<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ViolenceCategory extends Model
{
    use HasFactory;

    protected $primaryKey = 'unique_id';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'unique_id',
        'name',
        'description',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($category) {
            if (empty($category->unique_id)) {
                $category->unique_id = 'CAT-' . strtoupper(uniqid()) . '-' . date('Y');
            }
        });
    }

    public function complaints()
    {
        return $this->hasMany(Complaint::class);
    }
}
