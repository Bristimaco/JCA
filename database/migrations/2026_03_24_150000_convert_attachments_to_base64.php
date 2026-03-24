<?php

use App\Models\TournamentAttachment;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('tournament_attachments', function (Blueprint $table) {
            $table->longText('file_data')->nullable()->after('file_path');
            $table->string('mime_type')->nullable()->after('file_data');
        });

        // Migrate existing files to base64
        foreach (TournamentAttachment::all() as $attachment) {
            if ($attachment->file_path && Storage::disk('public')->exists($attachment->file_path)) {
                $contents = Storage::disk('public')->get($attachment->file_path);
                $mime = Storage::disk('public')->mimeType($attachment->file_path);
                $attachment->update([
                    'file_data' => base64_encode($contents),
                    'mime_type' => $mime,
                ]);
                Storage::disk('public')->delete($attachment->file_path);
            }
        }

        Schema::table('tournament_attachments', function (Blueprint $table) {
            $table->dropColumn('file_path');
        });
    }

    public function down(): void
    {
        Schema::table('tournament_attachments', function (Blueprint $table) {
            $table->string('file_path')->nullable()->after('tournament_id');
        });

        Schema::table('tournament_attachments', function (Blueprint $table) {
            $table->dropColumn(['file_data', 'mime_type']);
        });
    }
};
