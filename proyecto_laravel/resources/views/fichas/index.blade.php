@extends('layouts.app')

@section('content')
<div class="container">
    <h2>Fichas Médicas</h2>

    <a href="{{ route('fichas.create') }}"
       class="px-4 py-2 bg-green-600 text-black rounded-md inline-block mb-3 border-2 border-green-700">
        Agregar Ficha
    </a>

    <table class="w-full border-collapse border border-gray-300">
        <thead>
            <tr class="bg-gray-200">
                <th class="border p-2">Nombre</th>
                <th class="border p-2">RUT</th>
                <th class="border p-2">Sexo</th>
                <th class="border p-2">Género</th>
                <th class="border p-2">Fecha Nacimiento</th>
                <th class="border p-2">Altura</th>
                <th class="border p-2">Peso</th>
                <th class="border p-2">Tipo Sangre</th>
                <th class="border p-2">Acciones</th>
            </tr>
        </thead>

        <tbody>
            @foreach($fichas as $ficha)
            <tr>
                <td class="border p-2">{{ $ficha->usuario->nombre }}</td>
                <td class="border p-2">{{ $ficha->usuario->rut }}</td>
                <td class="border p-2">{{ $ficha->usuario->sexo }}</td>
                <td class="border p-2">{{ $ficha->genero }}</td>
                <td class="border p-2">{{ $ficha->usuario->fechaNacimiento }}</td>
                <td class="border p-2">{{ $ficha->altura }}</td>
                <td class="border p-2">{{ $ficha->peso }}</td>
                <td class="border p-2">{{ $ficha->usuario->tipoSangre }}</td>
                <td class="border p-2">
                    <div class="flex gap-2">

                        <a href="{{ route('fichas.edit', $ficha->idFichaMedica) }}"
                           class="px-3 py-1 bg-green-600 text-black border-2 border-green-700 rounded-md">
                            Editar
                        </a>

                        <form action="{{ route('fichas.destroy', $ficha->idFichaMedica) }}" method="POST">
                            @csrf
                            @method('DELETE')
                            <button class="px-3 py-1 bg-red-600 text-white border-2 border-red-700 rounded-md"
                                    onclick="return confirm('Eliminar ficha?')">
                                Eliminar
                            </button>
                        </form>

                    </div>
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="mt-4">
        {{ $fichas->links() }}
    </div>
</div>
@endsection
