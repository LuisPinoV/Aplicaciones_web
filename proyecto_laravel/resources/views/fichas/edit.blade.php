@extends('layouts.app')

@section('content')
<div class="container">
    <h2>Editar Ficha Médica</h2>

    <form action="{{ route('fichas.update', $ficha->idFichaMedica) }}" method="POST">
        @csrf
        @method('PUT')

        <label>Usuario</label>
        <select name="idUsuario" class="form-control">
            @foreach($usuarios as $u)
                <option value="{{ $u->idUsuario }}" @if($ficha->idUsuario == $u->idUsuario) selected @endif>
                    {{ $u->nombre }} - {{ $u->rut }}
                </option>
            @endforeach
        </select>

        <label>Altura</label>
        <input type="number" name="altura" value="{{ $ficha->altura }}" class="form-control">

        <label>Peso</label>
        <input type="number" name="peso" value="{{ $ficha->peso }}" class="form-control">

        <label>Género</label>
        <input type="text" name="genero" value="{{ $ficha->genero }}" class="form-control">

        <button class="btn btn-primary mt-3">Actualizar</button>
    </form>
</div>
@endsection
