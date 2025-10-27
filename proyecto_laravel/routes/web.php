<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

use App\Http\Controllers\FichasController;

Route::get('/fichas', [FichasController::class, 'index']);

use App\Http\Controllers\DashboardController;

Route::get('/dashboard', [DashboardController::class, 'dashboard']);
