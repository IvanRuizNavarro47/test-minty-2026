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
    Schema::create('guests', function (Blueprint $table) {

        // Clave primaria autoincremental (BIGINT por defecto en Laravel)
        $table->id();

        // Relación con bookings:
        // - foreignId crea un BIGINT UNSIGNED
        // - constrained() asume la tabla 'bookings' y la columna 'id'
        // - onDelete('cascade') elimina los guests si se borra la reserva
        $table->foreignId('booking_id')
              ->constrained()
              ->onDelete('cascade');

        // Nombre del invitado
        $table->string('name');

        // email del invitado
        $table->string('email')->nullable();

        // Teléfono del invitado
        // Se usa string en lugar de integer para:
        // - permitir prefijos (+34)
        // - evitar pérdida de ceros iniciales
        $table->string('phone')->nullable();

        // created_at y updated_at se crean a partir de timestamps
        // útiles para auditoría y ordenación
        $table->timestamps();
    });
}


    /**
     * Reverse the migrations. por si hay que hacer rollback
     */
    public function down(): void
    {
        Schema::table('guests', function (Blueprint $table) {
            //
        });
    }
};
