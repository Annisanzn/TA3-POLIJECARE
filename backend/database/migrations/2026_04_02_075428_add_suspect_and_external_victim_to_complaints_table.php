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
        Schema::table('complaints', function (Blueprint $table) {
            $table->boolean('is_external_victim')->default(false)->after('victim_relationship');
            $table->string('victim_identity_proof')->nullable()->after('is_external_victim');
            $table->string('suspect_name')->nullable()->after('victim_identity_proof');
            $table->string('suspect_status')->nullable()->after('suspect_name');
            $table->string('suspect_affiliation')->nullable()->after('suspect_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('complaints', function (Blueprint $table) {
            $table->dropColumn([
                'is_external_victim',
                'victim_identity_proof',
                'suspect_name',
                'suspect_status',
                'suspect_affiliation',
            ]);
        });
    }
};
