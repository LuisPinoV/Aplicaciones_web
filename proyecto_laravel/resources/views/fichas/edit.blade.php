@extends('layouts.app')

@section('content')

<style>
    label {
        display: block !important;
        margin-bottom: 5px;
    }

    input.form-control {
        display: block !important;
        width: 100% !important;
    }
</style>

<div class="container">

    <div class="card shadow-lg p-4" 
         style="max-width: 450px; margin: 30px auto; border-radius: 12px;">
        
        <h3 class="mb-4 text-center">Editar Ficha Médica</h3>

        <form action="{{ route('fichas.update', $ficha->idFichaMedica) }}" method="POST">
            @csrf
            @method('PUT')

            <h5 class="mb-3">Datos del Usuario</h5>

            <div class="mb-3">
                <label>Nombre</label>
                <input type="text" name="nombre" value="{{ $ficha->usuario->nombre }}" class="form-control">
            </div>

            <div class="mb-3">
                <label>RUT</label>
                <input type="text" name="rut" value="{{ $ficha->usuario->rut }}" class="form-control">
            </div>

            <div class="mb-3">
                <label>Sexo</label>
                <input type="text" name="sexo" value="{{ $ficha->usuario->sexo }}" class="form-control">
            </div>

            <div class="mb-3">
                <label>Fecha de Nacimiento</label>
                <input type="text" name="fechaNacimiento" value="{{ $ficha->usuario->fechaNacimiento }}" class="form-control">
            </div>

            <div class="mb-4">
                <label>Tipo de Sangre</label>
                <input type="text" name="tipoSangre" value="{{ $ficha->usuario->tipoSangre }}" class="form-control">
            </div>

            <div class="mb-3">
                <label>Género</label>
                <input type="text" name="genero" value="{{ $ficha->genero }}" class="form-control">
            </div>

            <div class="mb-3">
                <label>Altura</label>
                <input type="text" name="altura" value="{{ $ficha->altura }}" class="form-control">
            </div>

            <div class="mb-4">
                <label>Peso</label>
                <input type="text" name="peso" value="{{ $ficha->peso }}" class="form-control">
            </div>

            <button class="btn btn-primary w-100 mt-3">Actualizar</button>

        </form>
    </div>

</div>
@endsection
