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
        Schema::create('counselor_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('counselor_id')->constrained('users')->onDelete('cascade');
            $table->enum('hari', ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']);
            $table->time('jam_mulai');
            $table->time('jam_selesai');
            $table->integer('slot_duration')->default(60); // dalam menit
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Unique constraint untuk mencegah jadwal ganda pada hari dan jam yang sama untuk konselor yang sama
            $table->unique(['counselor_id', 'hari', 'jam_mulai', 'jam_selesai'], 'unique_counselor_day_time');
            
            // Index untuk performa query
            $table->index('counselor_id');
            $table->index('hari');
            $table->index('is_active');
            $table->index(['counselor_id', 'hari']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('counselor_schedules');
    }
};