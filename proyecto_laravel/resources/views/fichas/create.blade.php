@extends('layouts.app')

@section('content')
<div class="container">
    <h2>Crear Ficha Médica</h2>

    <form action="{{ route('fichas.store') }}" method="POST">
        @csrf

        <label>Usuario</label>
        <select name="idUsuario" class="form-control">
            @foreach($usuarios as $u)
                <option value="{{ $u->idUsuario }}">{{ $u->nombre }} - {{ $u->rut }}</option>
            @endforeach
        </select>

        <label>Altura</label>
        <input type="number" name="altura" class="form-control">

        <label>Peso</label>
        <input type="number" name="peso" class="form-control">

        <label>Género</label>
        <input type="text" name="genero" class="form-control">

        <button class="btn btn-success mt-3">Guardar</button>
    </form>
</div>
@endsection
