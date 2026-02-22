<?php

namespace App\Services;

use App\Mail\CounselingScheduleRequested;
use App\Mail\CounselingScheduleApproved;
use App\Mail\CounselingScheduleRejected;
use App\Models\CounselingSchedule;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class CounselingNotificationService
{
    /**
     * Send notification when a new counseling schedule is requested
     */
    public function sendRequestNotification(CounselingSchedule $schedule): void
    {
        // Send to counselor
        $counselor = $schedule->counselor;
        if ($counselor && $counselor->email) {
            Mail::to($counselor->email)
                ->queue(new CounselingScheduleRequested($schedule, 'counselor'));
        }

        // Send to all operators
        $operators = User::where('role', 'operator')->get();
        foreach ($operators as $operator) {
            if ($operator->email) {
                Mail::to($operator->email)
                    ->queue(new CounselingScheduleRequested($schedule, 'operator'));
            }
        }
    }

    /**
     * Send notification when a counseling schedule is approved
     */
    public function sendApprovalNotification(CounselingSchedule $schedule): void
    {
        // Send to student (user)
        $student = $schedule->user;
        if ($student && $student->email) {
            Mail::to($student->email)
                ->queue(new CounselingScheduleApproved($schedule));
        }
    }

    /**
     * Send notification when a counseling schedule is rejected
     */
    public function sendRejectionNotification(CounselingSchedule $schedule, string $reason): void
    {
        // Send to student (user)
        $student = $schedule->user;
        if ($student && $student->email) {
            Mail::to($student->email)
                ->queue(new CounselingScheduleRejected($schedule, $reason));
        }
    }

    /**
     * Format date for email display
     */
    public function formatDateForEmail($date): string
    {
        return $date->format('d F Y');
    }

    /**
     * Format time for email display
     */
    public function formatTimeForEmail($time): string
    {
        return date('H:i', strtotime($time));
    }

    /**
     * Get method display text
     */
    public function getMethodDisplay($method): string
    {
        return $method === 'online' ? 'Online' : 'Offline';
    }

    /**
     * Get status display text
     */
    public function getStatusDisplay($status): string
    {
        return match($status) {
            'pending' => 'Menunggu Konfirmasi',
            'approved' => 'Disetujui',
            'rejected' => 'Ditolak',
            'completed' => 'Selesai',
            'cancelled' => 'Dibatalkan',
            default => $status,
        };
    }
}