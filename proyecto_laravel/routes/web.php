<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\WebpayController;
use App\Services\WebpayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Página de bienvenida
Route::get('/', function () {
    return view('welcome');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'dashboard'])->name('dashboard');

    // CRUD Fichas medicas
    Route::resource('fichas', App\Http\Controllers\FichasController::class);


    // PERFIL
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

});


Route::match(['GET', 'POST'], '/pago', [WebpayController::class, 'pago'])->name('webpay.pago');
Route::get('/retorno', [WebpayController::class, 'retorno'])->name('webpay.retorno');

Route::view('/auth', 'auth.index')->name('auth.index');

use App\Http\Controllers\Auth\GoogleController;

Route::get('/auth/google/redirect', [GoogleController::class, 'redirect'])->name('auth.google.redirect');

Route::get('/auth/google/callback', [GoogleController::class, 'callback'])->name('auth.google.callback');

// Rutas Auth Breeze
require __DIR__.'/auth.php';
