<?php

namespace App\Http\Controllers;

use App\Models\Guest;
use Illuminate\Http\Request;

class GuestController extends Controller
{
    //listar todos los guests GET
    public function index() {
        return Guest::all();

    }


    //Guarda un nuevo invitado POST
    public function store(Request $request)
    {
       $validated = $request->validate([
                'booking_id' => 'required|exists:bookings,id',
                'name' => 'required|string',
                'email' => 'nullable|email',
                'phone' => 'nullable|string',
            ]);
    //Crea el invitado a partir de los datos del modelo
    //Importante: tiene que tener $fillable definido
    return Guest::create($request->all());
    }

    //Muestra guest por id GET guests/{id}
    public function show(Guest $guest) //al poner guest reconoce el modelo del que le hablamos que se busca en base de datos
    {
           return $guest;

    }

    //Actualiza los datos del guest existente PUT
    public function update(Request $request, Guest $guest)
    {
           $guest->update($request->all());
           return $guest;
    }

    //Elimina el guest DELETE
    public function destroy(Guest $guest)
    {
      $guest->delete();
         return response()->noContent();
    }
}
