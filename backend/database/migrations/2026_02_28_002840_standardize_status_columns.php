<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add 'approved' to complaints enum temporarily
        DB::statement("ALTER TABLE complaints MODIFY COLUMN status ENUM('pending', 'process', 'scheduled', 'completed', 'rejected', 'approved') DEFAULT 'pending'");
        // Update existing data in complaints table
        DB::table('complaints')->whereIn('status', ['process', 'scheduled'])->update(['status' => 'approved']);
        // Alter status column in complaints table to final state
        DB::statement("ALTER TABLE complaints MODIFY COLUMN status ENUM('pending', 'approved', 'completed', 'rejected') DEFAULT 'pending'");

        // Add 'rejected' to counseling_schedules if it isn't there (it usually is, but just in case)
        DB::statement("ALTER TABLE counseling_schedules MODIFY COLUMN status ENUM('pending', 'approved', 'rejected', 'completed', 'cancelled') DEFAULT 'pending'");
        // Update existing data in counseling_schedules table
        DB::table('counseling_schedules')->where('status', 'cancelled')->update(['status' => 'rejected']);
        // Alter status column in counseling_schedules table to final state
        DB::statement("ALTER TABLE counseling_schedules MODIFY COLUMN status ENUM('pending', 'approved', 'completed', 'rejected') DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Alter status column in complaints table back to its original state
        DB::statement("ALTER TABLE complaints MODIFY COLUMN status ENUM('pending', 'process', 'scheduled', 'completed', 'rejected') DEFAULT 'pending'");

        // Alter status column in counseling_schedules table back to its original state
        DB::statement("ALTER TABLE counseling_schedules MODIFY COLUMN status ENUM('pending', 'approved', 'rejected', 'completed', 'cancelled') DEFAULT 'pending'");
    }
};
