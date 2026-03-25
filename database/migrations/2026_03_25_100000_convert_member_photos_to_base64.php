<?php

use App\Models\Member;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->longText('photo_data')->nullable()->after('photo_path');
            $table->string('photo_mime')->nullable()->after('photo_data');
        });

        foreach (Member::whereNotNull('photo_path')->get() as $member) {
            if (Storage::disk('public')->exists($member->photo_path)) {
                $contents = Storage::disk('public')->get($member->photo_path);
                $mime = Storage::disk('public')->mimeType($member->photo_path);
                $member->update([
                    'photo_data' => base64_encode($contents),
                    'photo_mime' => $mime,
                ]);
                Storage::disk('public')->delete($member->photo_path);
            }
        }

        Schema::table('members', function (Blueprint $table) {
            $table->dropColumn('photo_path');
        });
    }

    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->string('photo_path')->nullable()->after('address_country');
        });

        Schema::table('members', function (Blueprint $table) {
            $table->dropColumn(['photo_data', 'photo_mime']);
        });
    }
};
