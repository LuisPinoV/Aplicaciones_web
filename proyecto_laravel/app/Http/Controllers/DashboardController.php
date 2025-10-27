<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;

class DashboardController extends Controller
{
    private $baseUrl;

    public function __construct()
    {
        $this->baseUrl = config('services.backend.base_url');
    }

    public function dashboard()
    {
        try {
            $endpoints = [
                'diagnosticos' => '/dashboard/diagnosticos',
                'medicamentos' => '/dashboard/medicamentos',
                'examenes' => '/dashboard/examenes',
                'alergias' => '/dashboard/alergias',
                'cirugias' => '/dashboard/cirugias',
            ];

            $data = [];
            $errors = [];

            foreach ($endpoints as $key => $endpoint) {
                try {
                    $response = Http::withoutVerifying()->get($this->baseUrl . $endpoint);
                    if ($response->successful()) {
                        $data[$key] = $response->json()['data'] ?? $response->json();
                    } else {
                        $data[$key] = [];
                        $errors[$key] = "Error {$response->status()} al obtener {$key}";
                    }
                } catch (\Exception $e) {
                    $data[$key] = [];
                    $errors[$key] = "Excepción al obtener {$key}: " . $e->getMessage();
                }
            }

            return view('dashboard', [
                'data' => $data,
                'errors' => $errors,
            ]);
        } catch (\Exception $e) {
            return view('dashboard', [
                'data' => [],
                'errors' => ['general' => 'Error general: ' . $e->getMessage()],
            ]);
        }
    }
}
