<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Fichas Médicas</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
</head>
<body class="bg-light p-4">
<div class="container">
    <h1 class="mb-4">Fichas Médicas</h1>

    @if ($error)
        <div class="alert alert-danger">
            <strong>Error:</strong> {{ $error }}
        </div>
    @endif

    @if (count($fichas) > 0)
        <table class="table table-bordered table-hover shadow-sm">
            <thead class="table-dark text-center">
                <tr>
                    <th>ID Ficha</th>
                    <th>RUT</th>
                    <th>Nombre</th>
                    <th>Fecha Nacimiento</th>
                    <th>Sexo</th>
                    <th>Tipo de Sangre</th>
                    <th>Altura (m)</th>
                    <th>Peso (kg)</th>
                    <th>Género</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($fichas as $ficha)
                    <tr class="text-center align-middle">
                        <td>{{ $ficha['idFichaMedica'] ?? '' }}</td>
                        <td>{{ $ficha['Rut'] ?? '' }}</td>
                        <td>{{ $ficha['nombre'] ?? '' }}</td>
                        <td>
                            {{ \Carbon\Carbon::parse($ficha['fechaNacimiento'])->format('d/m/Y') ?? '' }}
                        </td>
                        <td>{{ $ficha['sexo'] ?? '' }}</td>
                        <td>{{ $ficha['tipoSangre'] ?? '' }}</td>
                        <td>{{ number_format($ficha['altura'] ?? 0, 2) }}</td>
                        <td>{{ number_format($ficha['peso'] ?? 0, 2) }}</td>
                        <td>{{ $ficha['genero'] ?? '' }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <p class="text-muted">No se encontraron fichas médicas.</p>
    @endif
</div>
</body>
</html>
