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
        Schema::table('usuarios', function (Blueprint $table) {
            if (!Schema::hasColumn('usuarios', 'nombre')) {
                $table->string('nombre')->nullable();
            }
            if (!Schema::hasColumn('usuarios', 'rut')) {
                $table->string('rut')->nullable();
            }
            if (!Schema::hasColumn('usuarios', 'fechaNacimiento')) {
                $table->date('fechaNacimiento')->nullable();
            }
            if (!Schema::hasColumn('usuarios', 'sexo')) {
                $table->string('sexo')->nullable();
            }
            if (!Schema::hasColumn('usuarios', 'tipoSangre')) {
                $table->string('tipoSangre')->nullable();
            }
            if (!Schema::hasColumn('usuarios', 'contraseña')) {
                $table->string('contraseña')->nullable();
            }
        });

        Schema::table('ficha_medicas', function (Blueprint $table) {
            if (!Schema::hasColumn('ficha_medicas', 'idUsuario')) {
                $table->unsignedBigInteger('idUsuario')->nullable()->index();
            }
            if (!Schema::hasColumn('ficha_medicas', 'altura')) {
                $table->decimal('altura', 8, 2)->nullable();
            }
            if (!Schema::hasColumn('ficha_medicas', 'peso')) {
                $table->decimal('peso', 8, 2)->nullable();
            }
            if (!Schema::hasColumn('ficha_medicas', 'genero')) {
                $table->string('genero')->nullable();
            }

            // add foreign key if not exists
            try {
                $table->foreign('idUsuario')->references('id')->on('usuarios')->onDelete('cascade');
            } catch (\Throwable $e) {
                // ignore if FK cannot be added
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ficha_medicas', function (Blueprint $table) {
            try {
                $table->dropForeign(['idUsuario']);
            } catch (\Throwable $e) {
                // ignore
            }
            $table->dropColumn(['idUsuario','altura','peso','genero']);
        });

        Schema::table('usuarios', function (Blueprint $table) {
            $table->dropColumn(['nombre','rut','fechaNacimiento','sexo','tipoSangre','contraseña']);
        });
    }
};
