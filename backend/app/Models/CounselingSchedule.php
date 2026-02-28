<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CounselingSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'complaint_id',
        'user_id',
        'counselor_id',
        'jenis_pengaduan',
        'tanggal',
        'jam_mulai',
        'jam_selesai',
        'metode',
        'lokasi',
        'meeting_link',
        'status',
        'rejection_reason',
        'approved_at',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'jam_mulai' => 'datetime:H:i',
        'jam_selesai' => 'datetime:H:i',
        'approved_at' => 'datetime',
    ];

    /**
     * Status constants
     */
    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_COMPLETED = 'completed';

    /**
     * Method constants
     */
    public const METHOD_ONLINE = 'online';
    public const METHOD_OFFLINE = 'offline';

    /**
     * Get the user (mahasiswa) that owns the schedule
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the counselor that owns the schedule
     */
    public function counselor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'counselor_id');
    }

    /**
     * Get the complaint associated with the schedule
     */
    public function complaint(): BelongsTo
    {
        return $this->belongsTo(Complaint::class, 'complaint_id');
    }

    /**
     * Check if the schedule is pending
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if the schedule is approved
     */
    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    /**
     * Check if the schedule is rejected
     */
    public function isRejected(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }

    /**
     * Check if the schedule is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Check if the schedule is cancelled (mapped to rejected now)
     */
    public function isCancelled(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }

    /**
     * Check if the schedule is active (pending or approved)
     */
    public function isActive(): bool
    {
        return in_array($this->status, [self::STATUS_PENDING, self::STATUS_APPROVED]);
    }

    /**
     * Scope for pending schedules
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope for approved schedules
     */
    public function scopeApproved($query)
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    /**
     * Scope for rejected schedules
     */
    public function scopeRejected($query)
    {
        return $query->where('status', self::STATUS_REJECTED);
    }

    /**
     * Scope for completed schedules
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    /**
     * Scope for schedules by counselor
     */
    public function scopeByCounselor($query, $counselorId)
    {
        return $query->where('counselor_id', $counselorId);
    }

    /**
     * Scope for schedules by user (mahasiswa)
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope for schedules on a specific date
     */
    public function scopeOnDate($query, $date)
    {
        return $query->where('tanggal', $date);
    }

    /**
     * Scope for schedules with time overlap
     */
    public function scopeTimeOverlap($query, $startTime, $endTime)
    {
        return $query->where(function ($q) use ($startTime, $endTime) {
            $q->where(function ($q2) use ($startTime, $endTime) {
                // Check if new schedule starts during existing schedule
                $q2->where('jam_mulai', '<=', $startTime)
                   ->where('jam_selesai', '>', $startTime);
            })->orWhere(function ($q2) use ($startTime, $endTime) {
                // Check if new schedule ends during existing schedule
                $q2->where('jam_mulai', '<', $endTime)
                   ->where('jam_selesai', '>=', $endTime);
            })->orWhere(function ($q2) use ($startTime, $endTime) {
                // Check if new schedule completely contains existing schedule
                $q2->where('jam_mulai', '>=', $startTime)
                   ->where('jam_selesai', '<=', $endTime);
            });
        });
    }

    /**
     * Get formatted date and time
     */
    public function getFormattedDateTimeAttribute(): string
    {
        return $this->tanggal->format('d/m/Y') . ' ' . $this->jam_mulai . ' - ' . $this->jam_selesai;
    }

    /**
     * Get status badge color
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            self::STATUS_PENDING => 'warning',
            self::STATUS_APPROVED => 'success',
            self::STATUS_REJECTED => 'danger',
            self::STATUS_COMPLETED => 'info',
            default => 'secondary',
        };
    }

    /**
     * Get method badge color
     */
    public function getMethodColorAttribute(): string
    {
        return match($this->metode) {
            self::METHOD_ONLINE => 'primary',
            self::METHOD_OFFLINE => 'success',
            default => 'secondary',
        };
    }
}