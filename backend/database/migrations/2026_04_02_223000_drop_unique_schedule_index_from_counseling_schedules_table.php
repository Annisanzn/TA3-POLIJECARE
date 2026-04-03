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
            // Drop the unique constraint that prevents multiple sessions for same counselor/time
            $table->dropUnique('unique_counselor_schedule');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('counseling_schedules', function (Blueprint $table) {
            $table->unique(['counselor_id', 'tanggal', 'jam_mulai'], 'unique_counselor_schedule');
        });
    }
};
