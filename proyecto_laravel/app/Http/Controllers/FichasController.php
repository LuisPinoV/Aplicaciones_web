<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;

class FichasController extends Controller
{
    public function index()
    {
        try {
            $url = config('services.backend.base_url') . '/fichas';
            $response = Http::withoutVerifying()->get($url);
            if ($response->failed()) {
                return view('fichas', [
                    'fichas' => [],
                    'error' => 'Error al conectar con el backend. Código: ' . $response->status(),
                ]);
            }
            $data = $response->json();
            $fichas = isset($data['data']) && is_array($data['data']) ? $data['data'] : [];

            return view('fichas', [
                'fichas' => $fichas,
                'error' => null,
            ]);

        } catch (\Exception $e) {
            return view('fichas', [
                'fichas' => [],
                'error' => 'Excepción: ' . $e->getMessage(),
            ]);
        }
    }
}
