@extends('layouts.app')

@section('content')

<div class="container mt-4">

    <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="fw-bold">Fichas Médicas</h2>
        <a href="{{ route('fichas.create') }}" class="btn btn-primary">Crear Ficha</a>
    </div>

    @if(session('success'))
        <div class="alert alert-success">{{ session('success') }}</div>
    @endif

    <div class="card shadow-sm p-3">

        <div class="table-responsive">
            <table class="table table-bordered table-striped align-middle mb-0">
                <thead class="table-primary">
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>RUT</th>
                        <th>Altura</th>
                        <th>Peso</th>
                        <th>Género</th>
                        <th style="width:180px">Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    @forelse($fichas as $ficha)
                        <tr>
                            <td class="align-middle">{{ $ficha->idFichaMedica }}</td>
                            <td class="align-middle">{{ optional($ficha->usuario)->nombre ?? '—' }}</td>
                            <td class="align-middle">{{ optional($ficha->usuario)->rut ?? '—' }}</td>
                            <td class="align-middle">{{ $ficha->altura }} cm</td>
                            <td class="align-middle">{{ $ficha->peso }} kg</td>
                            <td class="align-middle">{{ $ficha->genero }}</td>

                            <td class="align-middle">
                                <div class="actions-box d-flex justify-content-center">
                                    <a href="{{ route('fichas.edit', $ficha->idFichaMedica) }}" class="btn btn-sm btn-outline-warning">
                                        <i class="bi bi-pencil"></i> Editar
                                    </a>

                                    <form action="{{ route('fichas.destroy', $ficha->idFichaMedica) }}" method="POST" onsubmit="return confirmDelete(event)" class="m-0">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="btn btn-sm btn-outline-danger ms-2">
                                            <i class="bi bi-trash"></i> Eliminar
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="text-center py-4">No hay fichas médicas.</td>
                        </tr>
                    @endforelse
                </tbody>

            </table>
        </div>

        <!-- Pagination centered and styled like buttons -->
        <div class="d-flex justify-content-center mt-3">
            {{ $fichas->links('pagination::bootstrap-4') }}
        </div>

    </div>
</div>

<!-- Optional: Bootstrap Icons CDN (used for pencil/trash icons). If ya lo tienes en layout, puedes quitar esta línea -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">

<style>
/* Make action buttons look like a compact boxed group */
.actions-box .btn {
    min-width: 96px;
    padding: .35rem .6rem;
    border-radius: .35rem;
    font-size: .9rem;
}

/* Slight card padding tweak for visual balance */
.card .table {
    margin-bottom: 0;
}

/* Improve table row height for readability */
.table tbody tr td {
    vertical-align: middle;
}

/* Pagination buttons appear more button-like on small widths */
.pagination .page-link {
    min-width: 38px;
    text-align: center;
    border-radius: .35rem;
}
</style>

<script>
function confirmDelete(e) {
    if (!confirm('¿Confirmar eliminación de la ficha?')) {
        e.preventDefault();
        return false;
    }
    return true;
}
</script>

@endsection
