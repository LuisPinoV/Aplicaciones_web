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
        $usuarios = Usuario::all();
        return view('fichas.create', compact('usuarios'));
    }

    public function store(Request $request)
    {
        FichaMedica::create($request->all());
        return redirect()->route('fichas.index');
    }

    public function edit($id)
    {
        $ficha = FichaMedica::findOrFail($id);
        $usuarios = Usuario::all();
        return view('fichas.edit', compact('ficha','usuarios'));
    }

    public function update(Request $request, $id)
    {
        $ficha = FichaMedica::findOrFail($id);

        $usuario = $ficha->usuario;
        $usuario->nombre = $request->nombre;
        $usuario->rut = $request->rut;
        $usuario->sexo = $request->sexo;
        $usuario->fechaNacimiento = $request->fechaNacimiento;
        $usuario->tipoSangre = $request->tipoSangre;
        $usuario->save();

        $ficha->genero = $request->genero;
        $ficha->altura = $request->altura;
        $ficha->peso = $request->peso;
        $ficha->save();

        return redirect()->route('fichas.index');
    }

    public function destroy($id)
    {
    $ficha = FichaMedica::findOrFail($id);
    $ficha->consultas()->delete();
    $ficha->delete();

    return redirect()->route('fichas.index');
    }
}
