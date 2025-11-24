@extends('layouts.app')

@section('content')
<div class="container">
    <h2>Fichas Médicas</h2>
    <a href="{{ route('fichas.create') }}" class="btn btn-success mb-3">Agregar Ficha</a>

    <table class="table table-bordered">
        <thead>
            <tr>
                <th>Nombre</th>
                <th>RUT</th>
                <th>Sexo</th>
                <th>Género</th>
                <th>Fecha Nacimiento</th>
                <th>Altura</th>
                <th>Peso</th>
                <th>Tipo Sangre</th>
                <th>Acciones</th>
            </tr>
        </thead>

        <tbody>
            @foreach($fichas as $ficha)
            <tr>
                <td>{{ $ficha->usuario->nombre }}</td>
                <td>{{ $ficha->usuario->rut }}</td>
                <td>{{ $ficha->usuario->sexo }}</td>
                <td>{{ $ficha->genero }}</td>
                <td>{{ $ficha->usuario->fechaNacimiento }}</td>
                <td>{{ $ficha->altura }}</td>
                <td>{{ $ficha->peso }}</td>
                <td>{{ $ficha->usuario->tipoSangre }}</td>
                <td>
                    <a href="{{ route('fichas.edit', $ficha->idFichaMedica) }}" class="btn btn-primary">Editar</a>

                    <form action="{{ route('fichas.destroy', $ficha->idFichaMedica) }}" method="POST" style="display:inline-block">
                        @csrf
                        @method('DELETE')
                        <button class="btn btn-danger" onclick="return confirm('Eliminar ficha?')">Eliminar</button>
                    </form>
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>

    {{ $fichas->links() }}
</div>
@endsection
