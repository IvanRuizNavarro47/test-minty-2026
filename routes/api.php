<?php

use App\Http\Controllers\MintyTestController;
use App\Http\Controllers\GuestController;
use Illuminate\Support\Facades\Route;

Route::get('/bookings', [MintyTestController::class, 'getBookings']);
Route::apiResource('guests', GuestController::class);

Route::get('/bookings/{booking}/guests', function ($bookingId) {
    return \App\Models\Guest::where('booking_id', $bookingId)->get();
}); 
