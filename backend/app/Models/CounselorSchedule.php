<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CounselorSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'counselor_id',
        'hari',
        'jam_mulai',
        'jam_selesai',
        'slot_duration',
        'is_active',
    ];

    protected $casts = [
        'jam_mulai' => 'datetime:H:i',
        'jam_selesai' => 'datetime:H:i',
        'slot_duration' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Days constants
     */
    public const DAYS = [
        'Senin' => 'Senin',
        'Selasa' => 'Selasa',
        'Rabu' => 'Rabu',
        'Kamis' => 'Kamis',
        'Jumat' => 'Jumat',
        'Sabtu' => 'Sabtu',
        'Minggu' => 'Minggu',
    ];

    /**
     * Get the counselor that owns the schedule.
     */
    public function counselor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'counselor_id');
    }

    /**
     * Generate time slots based on start time, end time, and slot duration.
     *
     * @return array
     */
    public function generateTimeSlots(): array
    {
        $slots = [];
        $start = \Carbon\Carbon::createFromTimeString($this->jam_mulai);
        $end = \Carbon\Carbon::createFromTimeString($this->jam_selesai);
        $duration = $this->slot_duration ?? 60;

        while ($start->copy()->addMinutes($duration) <= $end) {
            $slotEnd = $start->copy()->addMinutes($duration);
            $slots[] = [
                'start' => $start->format('H:i'),
                'end' => $slotEnd->format('H:i'),
                'is_available' => true,
            ];
            $start = $slotEnd;
        }

        return $slots;
    }

    /**
     * Check if this schedule overlaps with another schedule.
     *
     * @param CounselorSchedule $other
     * @return bool
     */
    public function overlapsWith(CounselorSchedule $other): bool
    {
        if ($this->counselor_id !== $other->counselor_id || $this->hari !== $other->hari) {
            return false;
        }

        $thisStart = \Carbon\Carbon::createFromTimeString($this->jam_mulai);
        $thisEnd = \Carbon\Carbon::createFromTimeString($this->jam_selesai);
        $otherStart = \Carbon\Carbon::createFromTimeString($other->jam_mulai);
        $otherEnd = \Carbon\Carbon::createFromTimeString($other->jam_selesai);

        return $thisStart < $otherEnd && $thisEnd > $otherStart;
    }

    /**
     * Scope a query to only include active schedules.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include schedules for a specific counselor.
     */
    public function scopeForCounselor($query, $counselorId)
    {
        return $query->where('counselor_id', $counselorId);
    }

    /**
     * Scope a query to only include schedules for a specific day.
     */
    public function scopeForDay($query, $day)
    {
        return $query->where('hari', $day);
    }
}