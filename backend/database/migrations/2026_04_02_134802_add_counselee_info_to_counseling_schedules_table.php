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
            $table->foreignId('user_id')->nullable()->change();
            $table->enum('counselee_type', ['pelapor', 'terlapor', 'saksi'])->default('pelapor')->after('user_id');
            $table->string('counselee_name')->nullable()->after('counselee_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('counseling_schedules', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable(false)->change();
            $table->dropColumn(['counselee_type', 'counselee_name']);
        });
    }
};
