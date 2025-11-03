<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Dashboard Médico</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: Arial, sans-serif; background: #f9fafb; margin: 0; padding: 20px; }
        h1 { text-align: center; color: #333; }
        .container { display: flex; flex-wrap: wrap; justify-content: center; gap: 30px; margin-top: 30px; }
        .chart-box {
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 20px;
            width: 500px;
        }
        .error { color: red; text-align: center; }
        canvas { width: 100% !important; height: 300px !important; }
    </style>
</head>
<body>

    <h1>Dashboard Médico</h1>

    @if (!empty($errors))
        <div class="error">
            @foreach ($errors as $key => $msg)
                <p> {{ ucfirst($key) }}: {{ $msg }}</p>
            @endforeach
        </div>
    @endif

    <div class="container">
        <div class="chart-box">
            <h3>Top 10 Diagnósticos</h3>
            <canvas id="chartDiagnosticos"></canvas>
        </div>

        <div class="chart-box">
            <h3>Top 10 Medicamentos más Recetados</h3>
            <canvas id="chartMedicamentos"></canvas>
        </div>

        <div class="chart-box">
            <h3>Tipos de Exámenes</h3>
            <canvas id="chartExamenes"></canvas>
        </div>

        <div class="chart-box">
            <h3>Top 10 Alergias</h3>
            <canvas id="chartAlergias"></canvas>
        </div>

        <div class="chart-box">
            <h3>Top 10 Cirugías</h3>
            <canvas id="chartCirugias"></canvas>
        </div>
    </div>

    <script>
        const data = @json($data);

        const makeChart = (ctxId, dataset, labelField, valueField, chartType = 'bar', color='#36A2EB') => {
            const ctx = document.getElementById(ctxId);
            if (!dataset || dataset.length === 0) return;

            new Chart(ctx, {
                type: chartType,
                data: {
                    labels: dataset.map(d => d[labelField]),
                    datasets: [{
                        label: 'Cantidad',
                        data: dataset.map(d => d[valueField]),
                        backgroundColor: color + '88',
                        borderColor: color,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } }
                }
            });
        };

        // Crear gráficos
        makeChart('chartDiagnosticos', data.diagnosticos, 'descripcion', 'cantidad', 'bar', '#36A2EB');
        makeChart('chartMedicamentos', data.medicamentos, 'medicamento', 'vecesPrescrito', 'bar', '#FF9F40');
        makeChart('chartExamenes', data.examenes, 'tipoExamen', 'cantidad', 'bar', '#4BC0C0');
        makeChart('chartAlergias', data.alergias, 'alergia', 'cantidad', 'bar', '#FFCD56');
        makeChart('chartCirugias', data.cirugias, 'cirujia', 'cantidad', 'bar', '#36A2EB');
    </script>

</body>
</html>
s', data.cirugias, 'cirujia', 'cantidad', 'bar', '#36A2EB');
    </script>

</body>
</html>
s', data.cirugias, 'cirujia', 'cantidad', 'bar', '#36A2EB');
    </script>

</body>
</html>
