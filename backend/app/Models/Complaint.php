<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Complaint extends Model
{
    use HasFactory;

    protected $fillable = [
        'report_id',
        'user_id',
        'counselor_id',
        'violence_category_id',
        'title',
        'description',
        'victim_type',
        'victim_name',
        'victim_relationship',
        'chronology',
        'ip_address',
        'user_agent',
        'location',
        'latitude',
        'longitude',
        'status',
        'counseling_schedule',
        'urgency_level',
        'is_anonymous',
    ];

    protected $appends = ['report_reference'];

    public function getReportReferenceAttribute()
    {
        return $this->report_id;
    }

    protected $casts = [
        'counseling_schedule' => 'datetime',
        'is_anonymous' => 'boolean',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
    ];

    protected static function booted()
    {
        static::creating(function (self $complaint) {
            if ($complaint->report_id) {
                return;
            }

            $complaint->report_id = static::generateReportId();
        });
    }

    public static function generateReportId(): string
    {
        $date = now()->format('Ymd');
        $prefix = "LPR-{$date}-";

        return DB::transaction(function () use ($prefix) {
            $last = DB::table('complaints')
                ->where('report_id', 'like', $prefix . '%')
                ->lockForUpdate()
                ->orderBy('report_id', 'desc')
                ->value('report_id');

            $nextNumber = 1;
            if ($last) {
                $lastNumber = (int) substr($last, strlen($prefix));
                $nextNumber = $lastNumber + 1;
            }

            $numberPart = str_pad((string) $nextNumber, 4, '0', STR_PAD_LEFT);
            return $prefix . $numberPart;
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function counselor()
    {
        return $this->belongsTo(User::class, 'counselor_id');
    }

    public function violenceCategory()
    {
        return $this->belongsTo(ViolenceCategory::class, 'violence_category_id');
    }
}
