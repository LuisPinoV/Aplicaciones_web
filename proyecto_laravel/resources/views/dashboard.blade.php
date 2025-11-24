<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Dashboard</title>
    <!-- Prevent caching so after logout the browser won't show a cached dashboard -->
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <style>
        :root{
            --bg: #f1f5f4;
            --card: #ffffff;
            --muted: #6b7280;
            --text: #0f172a;
            --green-700: #047857;
            --green-500: #10b981;
            --green-600: #059669;
            --accent: #064e3b;
        }

        *{box-sizing:border-box}
        body { font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background: var(--bg); margin: 0; color: var(--text); }

        /* Header */
        header.appbar{background:linear-gradient(90deg,var(--green-700),var(--green-500)); color:#fff; padding:14px 28px; display:flex; align-items:center; justify-content:space-between}
        header .brand{display:flex; gap:14px; align-items:center}
        header .brand h1{font-size:20px; margin:0; letter-spacing:0.2px}
        header .brand p{margin:0; font-size:13px; opacity:0.9}
        header nav{display:flex; gap:12px; align-items:center}
        header nav a{color:rgba(255,255,255,0.95); text-decoration:none; padding:8px 12px; border-radius:8px}
    header nav a.btn-ghost{background:rgba(255,255,255,0.08)}
    /* also style button logout to match profile link */
    header nav .btn-ghost{background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.95); border:0; cursor:pointer; padding:8px 12px; border-radius:8px}

        /* Layout */
        .page{max-width:1200px; margin:28px auto; padding:0 18px}
        .metrics{display:flex; gap:18px; flex-wrap:wrap; margin:18px 0 26px}
        .metric-card{background:var(--card); padding:18px; border-radius:12px; width:220px; box-shadow:0 6px 18px rgba(2,6,23,0.06); border-left:4px solid var(--green-500)}
        .metric-title{font-size:13px; color:var(--muted)}
        .metric-value{font-size:24px; font-weight:700; margin-top:6px; color:var(--accent)}

        /* Grid*/
        .main-grid{display:grid; grid-template-columns: 1fr 360px; gap:24px}

        .card{background:var(--card); border-radius:12px; padding:18px; box-shadow:0 6px 18px rgba(2,6,23,0.06)}
        .card h3{margin:0 0 14px 0; color:var(--accent)}

        /* Make charts responsive: use viewport-relative sizes with sensible max heights */
        .big-chart{width:100%; height:min(56vh,420px); position:relative}
        .small-chart{width:100%; height:min(34vh,220px); position:relative}

        /* Ensure canvas elements fill their parent containers */
        .big-chart canvas,
        .small-chart canvas,
        .chart-canvas {
            display:block;
            width:100% !important;
            height:100% !important;
        }

        /* Tweak heights for very small viewports (inspect device presets) */
        @media (max-width: 420px) {
            .big-chart{height:40vh}
            .small-chart{height:26vh}
        }

        .right-col .small-cards{display:flex; flex-direction:column; gap:16px}

        .right-col .small-cards{display:flex; flex-direction:column; gap:16px}

        @media (max-width: 940px){.main-grid{grid-template-columns:1fr}.right-col{order:2}}

        footer.site-footer{max-width:1200px;margin:28px auto;padding:18px;border-radius:8px;color:var(--muted);text-align:center}

        @media (max-width: 940px){.main-grid{grid-template-columns:1fr}.right-col{order:2}}
    </style>
</head>

<body>

    <header class="appbar">
        <div class="brand">
            <div style="width:44px;height:44px;border-radius:10px;background:rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;font-weight:700">MD</div>
            <div>
                <h1>MediNet — Dashboard</h1>
                <p>Visión general clínica · Última actualización: {{ now()->format('d M Y') }}</p>
            </div>
        </div>

        <nav>
            <a href="{{ route('fichas.index') }}" class="btn-ghost">Fichas</a>
            <a href="/profile" class="btn-ghost">Mi perfil</a>
            {{-- Logout via POST (uses fetch for smooth redirect to login) --}}
            <form id="logout-form" style="display:inline-block;margin:0;padding:0">
                @csrf
                <button type="button" class="btn-ghost" onclick="logoutUser(event)">Cerrar sesión</button>
            </form>
        </nav>
    </header>

    <script>
        function logoutUser(e){
            e.preventDefault();
            const url = "{{ route('logout') }}";
            const loginUrl = "{{ route('login') }}";
            const token = '{{ csrf_token() }}';

            // Try to logout via fetch; on success redirect to login.
            fetch(url, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': token,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin'
            }).then(response => {
                // Use replace so the login replaces the current history entry
                // (prevents going back to the protected page using back button)
                try {
                    // Clear any sensitive client-side state
                    sessionStorage.clear();
                    localStorage.removeItem('auth');
                } catch (e) {}
                window.location.replace(loginUrl);
            }).catch(() => {
                // fallback: create and submit a traditional form
                const f = document.createElement('form');
                f.method = 'POST';
                f.action = url;
                const i = document.createElement('input');
                i.type = 'hidden'; i.name = '_token'; i.value = token;
                f.appendChild(i);
                document.body.appendChild(f);
                f.submit();
            });
        }
    </script>

    

    <div class="page">

        @if (!empty($errors))
            <div style="margin:12px 0; padding:12px; border-radius:8px; background:#fff3f2; color:#7f1d1d">Se han detectado errores. Revisa los registros.</div>
        @endif

        <!-- MÉTRICAS SUPERIORES -->
        <div class="metrics">
            <div class="metric-card">
                <p class="metric-title">Diagnósticos distintos</p>
                <p class="metric-value">{{ count($data['diagnosticos'] ?? []) }}</p>
            </div>

            <div class="metric-card">
                <p class="metric-title">Medicamentos distintos</p>
                <p class="metric-value">{{ count($data['medicamentos'] ?? []) }}</p>
            </div>

            <div class="metric-card">
                <p class="metric-title">Tipos de exámenes</p>
                <p class="metric-value">{{ count($data['examenes'] ?? []) }}</p>
            </div>

            <div class="metric-card">
                <p class="metric-title">Tipos de alergias</p>
                <p class="metric-value">{{ count($data['alergias'] ?? []) }}</p>
            </div>
        </div>

        <div class="main-grid">
            <div>
                <div class="card">
                    <h3>Pacientes y actividad</h3>
                    <div class="big-chart">
                        <canvas id="chartDiagnosticos" class="chart-canvas"></canvas>
                    </div>
                </div>

                <div style="height:24px"></div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:18px">
                    <div class="card">
                        <h3>Medicamentos recetados</h3>
                        <div class="small-chart"><canvas id="chartMedicamentos" class="chart-canvas"></canvas></div>
                    </div>
                    <div class="card">
                        <h3>Cirugías</h3>
                        <div class="small-chart"><canvas id="chartCirugias" class="chart-canvas"></canvas></div>
                    </div>
                </div>
            </div>

            <aside class="right-col">
                <div class="small-cards">
                    <div class="card">
                        <h3>Distribución por Exámenes</h3>
                        <div class="small-chart"><canvas id="chartExamenes" class="chart-canvas"></canvas></div>
                    </div>

                    <div class="card">
                        <h3>Alergias más comunes</h3>
                        <div class="small-chart"><canvas id="chartAlergias" class="chart-canvas"></canvas></div>
                    </div>
                </div>
            </aside>
        </div>

    </div>

    <footer class="site-footer">MediNet · Datos de ejemplo · &copy; {{ date('Y') }}</footer>

    <script>
        const data = @json($data);

        // Store original datasets so filters can restore them
        const originalDatasets = {
            diagnosticos: data.diagnosticos || [],
            medicamentos: data.medicamentos || [],
            examenes: data.examenes || [],
            alergias: data.alergias || [],
            cirugias: data.cirugias || []
        };

        const chartsMap = {}; // datasetName -> Chart instance
        const chartConfigs = {}; // datasetName -> {labelField, valueField, container}

        // Función generadora de gráficos (responsive) - accepts datasetName key
        const makeChart = (id, datasetName, labelField, valueField, type, colors) => {
            const el = document.getElementById(id);
            const dataset = originalDatasets[datasetName] || [];
            if (!el) return;

            el.style.width = '100%';
            el.style.height = '100%';

            // prepare data arrays
            const labels = dataset.map(x => x[labelField]);
            const values = dataset.map(x => x[valueField]);
            const background = labels.map((_, i) => colors[i % colors.length]);

            const chart = new Chart(el, {
                type,
                data: {
                    labels,
                    datasets: [{
                        label: 'Cantidad',
                        data: values,
                        backgroundColor: background,
                        borderColor: '#111827',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: type === 'bar' || type === 'horizontalBar'
                        ? { y: { beginAtZero: true } }
                        : {},
                    plugins: { legend: { display: type !== 'bar' } }
                }
            });

            chartsMap[datasetName] = chart;
            // container: nearest .card (if present) otherwise parent element
            const container = el.closest('.card') || el.parentElement || document.getElementById(id);
            chartConfigs[datasetName] = { labelField, valueField, container };

            return chart;
        };

        // Paleta de verdes para aspecto médico
        const greens = [
            '#ecfccb', // 100
            '#bbf7d0', // 200
            '#86efac', // 300
            '#34d399', // 400
            '#059669'  // 500
        ];

        // Create charts and keep instances
        makeChart('chartDiagnosticos', 'diagnosticos', 'descripcion', 'cantidad', 'bar', greens);
        makeChart('chartMedicamentos', 'medicamentos', 'medicamento', 'vecesPrescrito', 'line', greens);
        makeChart('chartExamenes', 'examenes', 'tipoExamen', 'cantidad', 'doughnut', greens);
        makeChart('chartAlergias', 'alergias', 'alergia', 'cantidad', 'pie', greens);
        makeChart('chartCirugias', 'cirugias', 'cirujia', 'cantidad', 'bar', greens);

        
    </script>

</body>
</html>
