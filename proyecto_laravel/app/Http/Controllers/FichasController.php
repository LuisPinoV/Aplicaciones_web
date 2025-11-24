<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Models\FichaMedica;
use Illuminate\Http\Request;

class FichasController extends Controller
{
    public function index()
    {
        $fichas = FichaMedica::with('usuario')->paginate(10);

        return view('fichas.index', compact('fichas'));
    }

    public function create()
    {
        return view('fichas.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'rut' => 'required',
            'nombre' => 'required',
            'fechaNacimiento' => 'required|date',
            'sexo' => 'required',
            'tipoSangre' => 'required',
            'altura' => 'required|numeric',
            'peso' => 'required|numeric',
            'genero' => 'required'
        ]);

        $usuario = Usuario::create([
            'rut' => $request->rut,
            'contraseña' => bcrypt('123456'), 
            'fechaNacimiento' => $request->fechaNacimiento,
            'nombre' => $request->nombre,
            'sexo' => $request->sexo,
            'tipoSangre' => $request->tipoSangre
        ]);

        FichaMedica::create([
            'idUsuario' => $usuario->id,
            'altura' => $request->altura,
            'peso' => $request->peso,
            'genero' => $request->genero
        ]);

        return redirect()->route('fichas.index')
            ->with('success', 'Ficha creada correctamente.');
    }

    public function edit($idFichaMedica)
    {
        $ficha = FichaMedica::with('usuario')->findOrFail($id);

        return view('fichas.edit', compact('ficha'));
    }

    public function update(Request $request, $idFichaMedica)
    {
        $ficha = FichaMedica::findOrFail($idFichaMedica);

        $request->validate([
            'rut' => 'required',
            'nombre' => 'required',
            'fechaNacimiento' => 'required|date',
            'sexo' => 'required',
            'tipoSangre' => 'required',
            'altura' => 'required|numeric',
            'peso' => 'required|numeric',
            'genero' => 'required'
        ]);

        $usuario = $ficha->usuario;

        $usuario->update([
            'rut' => $request->rut,
            'fechaNacimiento' => $request->fechaNacimiento,
            'nombre' => $request->nombre,
            'sexo' => $request->sexo,
            'tipoSangre' => $request->tipoSangre
        ]);

        $ficha->update([
            'altura' => $request->altura,
            'peso' => $request->peso,
            'genero' => $request->genero
        ]);

        return redirect()->route('fichas.index')
            ->with('success', 'Ficha actualizada correctamente.');
    }

    public function destroy($idFichaMedica)
    {
        $ficha = FichaMedica::findOrFail($idFichaMedica);
        $usuario = $ficha->usuario;

        $ficha->delete();
        $usuario->delete();

        return redirect()->route('fichas.index')
            ->with('success', 'Ficha eliminada.');
    }
}
