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
        $ficha->update($request->all());
        return redirect()->route('fichas.index');
    }

    public function destroy($id)
    {
        FichaMedica::destroy($id);
        return redirect()->route('fichas.index');
    }
}
