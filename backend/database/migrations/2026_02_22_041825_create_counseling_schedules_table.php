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
        Schema::create('counseling_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('complaint_id')->nullable()->constrained('complaints')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('counselor_id')->constrained('users')->onDelete('cascade');
            $table->string('jenis_pengaduan')->nullable();
            $table->date('tanggal');
            $table->time('jam_mulai');
            $table->time('jam_selesai');
            $table->enum('metode', ['online', 'offline'])->default('online');
            $table->string('lokasi')->nullable();
            $table->string('meeting_link')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected', 'completed', 'cancelled'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            
            // Unique constraint untuk mencegah double booking
            $table->unique(['counselor_id', 'tanggal', 'jam_mulai'], 'unique_counselor_schedule');
            
            // Index untuk performa query
            $table->index('status');
            $table->index('user_id');
            $table->index('counselor_id');
            $table->index('tanggal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('counseling_schedules');
    }
};
