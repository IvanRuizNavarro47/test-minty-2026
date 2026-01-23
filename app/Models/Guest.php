<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class Guest extends Model
{
    use HasFactory;

    //fillable solo acepta los campos que se le nombra
    protected $fillable = ['booking_id', 'name', 'email', 'phone'];


    /**
     * Relación: un Guest pertenece a un Booking
     * - la clave foránea es booking_id
     * - la clave primaria es id
     */
    public function booking():BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
