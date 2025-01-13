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
            $table->dropColumn('name');
            $table->string('photo', 255)->nullable()->after('id');
            $table->string('first_name', 255)->after('photo');
            $table->string('last_name', 255)->after('first_name');
            $table->tinyInteger('gender')->nullable()->after('last_name');
            $table->string('address', 255)->nullable()->after('gender');
            $table->string('phone')->nullable()->after('email');
            $table->tinyInteger('role')->after('phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('name')->after('id');

            $table->dropColumn('first_name');
            $table->dropColumn('last_name');
            $table->dropColumn('gender');
            $table->dropColumn('address');
            $table->dropColumn('phone');
            $table->dropColumn('photo');
            $table->dropColumn('role');
        });
    }
};
