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
            $table->string('counselee_type')->default('pelapor')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('counseling_schedules', function (Blueprint $table) {
            $table->enum('counselee_type', ['pelapor', 'terlapor', 'saksi'])->default('pelapor')->change();
        });
    }
};
