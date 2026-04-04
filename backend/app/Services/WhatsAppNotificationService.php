<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppNotificationService
{
    /**
     * Send WhatsApp notification via Fonnte API.
     *
     * @param string $phone   Nomor HP tujuan (format: 628xxx)
     * @param string $message Isi pesan
     * @return bool
     */
    public static function send(string $phone, string $message): bool
    {
        $token = config('services.fonnte.token');

        if (empty($token)) {
            Log::warning('WhatsApp notification skipped: FONNTE_TOKEN not configured');
            return false;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => $token,
            ])->post('https://api.fonnte.com/send', [
                'target'  => $phone,
                'message' => $message,
            ]);

            if ($response->successful()) {
                Log::info("WhatsApp notification sent to {$phone}");
                return true;
            }

            Log::error("WhatsApp notification failed: " . $response->body());
            return false;
        } catch (\Exception $e) {
            Log::error("WhatsApp notification error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Kirim notifikasi ke Satgas PPKS saat ada pengaduan baru.
     *
     * @param \App\Models\Complaint $complaint
     * @return bool
     */
    public static function notifyNewComplaint($complaint): bool
    {
        $satgasPhone = config('services.fonnte.satgas_phone');

        if (empty($satgasPhone)) {
            Log::warning('WhatsApp notification skipped: SATGAS_PHONE not configured');
            return false;
        }

        $pelapor = optional($complaint->user)->name ?? $complaint->guest_name ?? 'Mahasiswa/Umum';

        $kategori = optional($complaint->violenceCategory)->name ?? '-';

        $message = "🚨 *LAPORAN PENGADUAN BARU* 🚨\n\n"
            . "📋 *No. Laporan:* {$complaint->report_id}\n"
            . "👤 *Pelapor:* {$pelapor}\n"
            . "📁 *Kategori:* {$kategori}\n"
            . "📌 *Judul:* {$complaint->title}\n"
            . "📍 *Lokasi:* {$complaint->location}\n"
            . "⚠️ *Urgensi:* " . strtoupper($complaint->urgency_level) . "\n"
            . "📅 *Tanggal:* " . $complaint->created_at->format('d/m/Y H:i') . "\n\n"
            . "Segera tindak lanjuti laporan ini melalui dashboard Operator PPKS Polije.\n"
            . "🔗 https://ppks.polije.ac.id/operator/complaints";

        return self::send($satgasPhone, $message);
    }
}
