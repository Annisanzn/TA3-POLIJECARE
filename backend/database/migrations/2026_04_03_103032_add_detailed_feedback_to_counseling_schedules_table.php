<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('counseling_schedules', function (Blueprint $table) {
            $table->text('keterangan_pihak')->nullable()->after('feedback_notes');
            $table->text('saran_konselor')->nullable()->after('keterangan_pihak');
            $table->boolean('is_record_only')->default(false)->after('saran_konselor');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('counseling_schedules', function (Blueprint $table) {
            $table->dropColumn(['keterangan_pihak', 'saran_konselor', 'is_record_only']);
        });
    }
};
