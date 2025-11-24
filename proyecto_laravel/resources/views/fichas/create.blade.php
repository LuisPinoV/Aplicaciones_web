@extends('layouts.app')

@section('content')
<div class="container">

    <div class="card shadow-lg p-4" style="max-width: 600px; margin: auto;">
        <h3 class="mb-4 text-center">Crear Ficha Médica Completa</h3>

        <form action="{{ route('fichas.store') }}" method="POST">
            @csrf

            <h4>Datos del Usuario</h4>

            <div class="mb-3">
                <label class="form-label">Nombre</label>
                <input type="text" name="nombre" class="form-control">
            </div>

            <div class="mb-3">
                <label class="form-label">RUT</label>
                <input type="text" name="rut" class="form-control">
            </div>

            <div class="mb-3">
                <label class="form-label">Sexo</label>
                <input type="text" name="sexo" class="form-control">
            </div>

            <div class="mb-3">
                <label class="form-label">Fecha de Nacimiento</label>
                <input type="date" name="fechaNacimiento" class="form-control">
            </div>

            <div class="mb-3">
                <label class="form-label">Tipo de Sangre</label>
                <input type="text" name="tipoSangre" class="form-control">
            </div>


            <h4 class="mt-4">Datos Médicos</h4>

            <div class="mb-3">
                <label class="form-label">Género</label>
                <input type="text" name="genero" class="form-control">
            </div>

            <div class="mb-3">
                <label class="form-label">Altura</label>
                <input type="number" name="altura" class="form-control">
            </div>

            <div class="mb-3">
                <label class="form-label">Peso</label>
                <input type="number" name="peso" class="form-control">
            </div>

            <button class="btn btn-success w-100 mt-3">Crear Ficha Médica</button>
        </form>
    </div>

</div>
@endsection
