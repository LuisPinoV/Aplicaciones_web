@extends('layouts.app')

@section('content')
<div class="container">
    <h2 class="mb-4">Editar Ficha Médica</h2>

    <form action="{{ route('fichas.update', $ficha->idFichaMedica) }}" method="POST">
        @csrf
        @method('PUT')

        <h4 class="mt-3 mb-3">Datos del Usuario</h4>

        <div class="mb-3">
            <label class="form-label">Nombre</label>
            <input type="text" name="nombre" value="{{ $ficha->usuario->nombre }}" class="form-control">
        </div>

        <div class="mb-3">
            <label class="form-label">RUT</label>
            <input type="text" name="rut" value="{{ $ficha->usuario->rut }}" class="form-control">
        </div>

        <div class="mb-3">
            <label class="form-label">Sexo</label>
            <input type="text" name="sexo" value="{{ $ficha->usuario->sexo }}" class="form-control">
        </div>

        <div class="mb-3">
            <label class="form-label">Fecha de Nacimiento</label>
            <input type="text" name="fechaNacimiento" value="{{ $ficha->usuario->fechaNacimiento }}" class="form-control">
        </div>

        <div class="mb-4">
            <label class="form-label">Tipo de Sangre</label>
            <input type="text" name="tipoSangre" value="{{ $ficha->usuario->tipoSangre }}" class="form-control">
        </div>

        <h4 class="mt-4 mb-3">Datos Médicos</h4>

        <div class="mb-3">
            <label class="form-label">Género</label>
            <input type="text" name="genero" value="{{ $ficha->genero }}" class="form-control">
        </div>

        <div class="mb-3">
            <label class="form-label">Altura</label>
            <input type="text" name="altura" value="{{ $ficha->altura }}" class="form-control">
        </div>

        <div class="mb-4">
            <label class="form-label">Peso</label>
            <input type="text" name="peso" value="{{ $ficha->peso }}" class="form-control">
        </div>

        <button class="btn btn-primary mt-3">Actualizar</button>
    </form>
</div>
@endsection
