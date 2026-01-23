<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'checkin_at',
        'checkout_at',
        'status',
    ];

    //casts = datetime con mas funcionalidades
    protected function casts(): array
    {
        return [
        //se obtieen un cast y no un string en los dos casos
            'checkin_at' => 'datetime',
            'checkout_at' => 'datetime',
        ];
    }

    //Relación: una Booking tiene muchos Guests
    public function guests():hasMany
    {
        return $this->hasMany(Guest::class);
    }

}
