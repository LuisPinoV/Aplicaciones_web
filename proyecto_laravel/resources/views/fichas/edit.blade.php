@extends('layouts.app')

@section('content')

<div class="container mt-4">

    <div class="card shadow p-4" style="max-width: 600px; margin:auto;">

        <h3 class="fw-bold mb-3 text-primary">Editar Ficha Médica</h3>

        <form method="POST" action="{{ route('fichas.update', $ficha->id) }}">
            @csrf
            @method('PUT')

            @include('fichas.form', ['ficha' => $ficha])

            <button class="btn btn-primary w-100 mt-3">Actualizar</button>
        </form>

    </div>

</div>

@endsection
