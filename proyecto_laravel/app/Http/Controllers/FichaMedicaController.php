<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Models\FichaMedica;
use Illuminate\Http\Request;

class FichaController extends Controller
{
    public function index()
    {
        $fichas = Usuario::with('fichaMedica')->get();
        return view('fichas.index', compact('fichas'));
    }

    public function create()
    {
        return view('fichas.create');
    }

    public function store(Request $request)
    {
        $usuario = Usuario::create([
            'rut' => $request->rut,
            'contraseña' => $request->contraseña,
            'fechaNacimiento' => $request->fechaNacimiento,
            'nombre' => $request->nombre,
            'sexo' => $request->sexo,
            'tipoSangre' => $request->tipoSangre,
        ]);

        FichaMedica::create([
            'idUsuario' => $usuario->id,
            'altura' => $request->altura,
            'peso' => $request->peso,
            'genero' => $request->genero
        ]);

        return redirect()->route('fichas.index');
    }

    public function edit($id)
    {
        $usuario = Usuario::with('fichaMedica')->findOrFail($id);
        return view('fichas.edit', compact('usuario'));
    }

    public function update(Request $request, $id)
    {
        $usuario = Usuario::findOrFail($id);
        $usuario->update([
            'rut' => $request->rut,
            'contraseña' => $request->contraseña,
            'fechaNacimiento' => $request->fechaNacimiento,
            'nombre' => $request->nombre,
            'sexo' => $request->sexo,
            'tipoSangre' => $request->tipoSangre,
        ]);

        $usuario->fichaMedica->update([
            'altura' => $request->altura,
            'peso' => $request->peso,
            'genero' => $request->genero
        ]);

        return redirect()->route('fichas.index');
    }

    public function destroy($id)
    {
        $usuario = Usuario::findOrFail($id);
        $usuario->fichaMedica()->delete();
        $usuario->delete();
        return redirect()->route('fichas.index');
    }
}
