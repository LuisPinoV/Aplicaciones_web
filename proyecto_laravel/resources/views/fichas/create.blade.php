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

        <h3 class="mb-4 text-center">Crear Ficha Médica</h3>

        <form action="{{ route('fichas.store') }}" method="POST">
            @csrf

            <h4 class="mb-3">Datos del Usuario</h4>

            <div class="mb-3">
                <label>Nombre</label>
                <input type="text" name="nombre" class="form-control">
            </div>

            <div class="mb-3">
                <label>RUT</label>
                <input type="text" name="rut" class="form-control">
            </div>

            <div class="mb-3">
                <label>Sexo</label>
                <input type="text" name="sexo" class="form-control">
            </div>

            <div class="mb-3">
                <label>Fecha de Nacimiento</label>
                <input type="date" name="fechaNacimiento" class="form-control">
            </div>

            <div class="mb-3">
                <label>Tipo de Sangre</label>
                <input type="text" name="tipoSangre" class="form-control">
            </div>

            <div class="mb-3">
                <label>Género</label>
                <input type="text" name="genero" class="form-control">
            </div>

            <div class="mb-3">
                <label>Altura</label>
                <input type="number" name="altura" class="form-control">
            </div>

            <div class="mb-3">
                <label>Peso</label>
                <input type="number" name="peso" class="form-control">
            </div>

            <button class="btn btn-success w-100 mt-3">Crear Ficha Médica</button>
        </form>
    </div>

</div>
@endsection
