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
            $table->string('title')->nullable()->after('violence_category_id');
            $table->text('description')->nullable()->after('title');
            $table->text('chronology')->nullable()->after('description');
            $table->string('ip_address', 45)->nullable()->after('is_anonymous');
            $table->text('user_agent')->nullable()->after('ip_address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('complaints', function (Blueprint $table) {
            $table->dropColumn(['title', 'description', 'chronology', 'ip_address', 'user_agent']);
        });
    }
};
