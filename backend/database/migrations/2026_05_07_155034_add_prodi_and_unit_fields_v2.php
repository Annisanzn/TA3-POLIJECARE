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
        Schema::table('users', function (Blueprint $table) {
            $table->string('prodi')->nullable()->after('unit');
        });

        Schema::table('complaints', function (Blueprint $table) {
            $table->string('guest_prodi')->nullable()->after('guest_nim');
            $table->string('guest_unit')->nullable()->after('guest_prodi');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('prodi');
        });

        Schema::table('complaints', function (Blueprint $table) {
            $table->dropColumn(['guest_prodi', 'guest_unit']);
        });
    }
};
