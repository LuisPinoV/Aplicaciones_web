<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;

class FichasController extends Controller
{
    public function index()
    {
        try {
            // URL completa del backend Serverless
            $url = config('services.backend.base_url') . '/fichas';

            // Petición GET (sin verificación SSL en entorno local)
            $response = Http::withoutVerifying()->get($url);

            // Si falla la petición (404, 500, etc.)
            if ($response->failed()) {
                return view('fichas', [
                    'fichas' => [],
                    'error' => 'Error al conectar con el backend. Código: ' . $response->status(),
                ]);
            }

            // Obtener el JSON
            $data = $response->json();

            // Asegurarse de que existe la clave "data"
            $fichas = isset($data['data']) && is_array($data['data']) ? $data['data'] : [];

            // Enviar a la vista
            return view('fichas', [
                'fichas' => $fichas,
                'error' => null,
            ]);

        } catch (\Exception $e) {
            // Manejar cualquier otro error (cURL, conexión, etc.)
            return view('fichas', [
                'fichas' => [],
                'error' => 'Excepción: ' . $e->getMessage(),
            ]);
        }
    }
}
