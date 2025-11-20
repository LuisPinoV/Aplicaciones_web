<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\WebpayService;

class WebpayController extends Controller
{
    public function pago(WebpayService $wp)
    {
        $response = $wp->crearTransaccion(1000);

        return redirect($response->getUrl() . '?token_ws=' . $response->getToken());
    }

    public function retorno()
    {
        return "Transacción finalizada";
    }
}
