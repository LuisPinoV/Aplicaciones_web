<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @vite(['resources/css/app.css', 'resources/js/app.js'])
        <style>
            :root{
                --green-700: #047857;
                --green-600: #059669;
                --green-500: #10b981;
                --accent: #064e3b;
                --bg: #f1f5f4;
                --card: #ffffff;
                --muted: #6b7280;
                --text: #0f172a;
            }
            body{background:var(--bg); color:var(--text);}
            header.appbar{background:linear-gradient(90deg,var(--green-700),var(--green-500)); color:#fff; padding:14px 18px; display:flex; align-items:center; justify-content:space-between}
            header .brand{display:flex; gap:12px; align-items:center}
            header .brand h1{font-size:18px; margin:0}
            header nav{display:flex; gap:12px; align-items:center}
            header nav a{color:rgba(255,255,255,0.95); text-decoration:none; padding:8px 12px; border-radius:8px}
            header nav .btn-ghost{background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.95); border:0; cursor:pointer; padding:8px 12px; border-radius:8px}
            footer.site-footer{max-width:1200px;margin:28px auto;padding:18px;border-radius:8px;color:var(--muted);text-align:center}
        </style>
    </head>
    <body class="font-sans antialiased">
        <header class="appbar">
            <div class="brand">
                <div style="width:44px;height:44px;border-radius:10px;background:rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;font-weight:700">MD</div>
                <div>
                    <h1>{{ config('app.name', 'Laravel') }}</h1>
                    <p style="margin:0;font-size:12px;opacity:0.9">Panel · {{ now()->format('d M Y') }}</p>
                </div>
            </div>

            <nav>
                <a href="{{ route('dashboard') }}">Dashboard</a>
                <a href="{{ route('profile.edit') }}" class="btn-ghost">Mi perfil</a>
                <form id="logout-form" style="display:inline-block;margin:0;padding:0" method="POST" action="{{ route('logout') }}">
                    @csrf
                    <button type="button" class="btn-ghost" onclick="logoutUser(event)">Cerrar sesión</button>
                </form>
            </nav>
        </header>

        <div class="min-h-screen">
            <!-- Page Heading -->
            @isset($header)
                <header class="bg-white shadow" style="padding:12px 18px">
                    <div class="max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-8">
                        {{ $header }}
                    </div>
                </header>
            @endisset

            <!-- Page Content -->
            <main>
                <div style="max-width:1200px;margin:28px auto;padding:0 18px">{{ $slot }}</div>
            </main>

            <footer class="site-footer">{{ config('app.name', 'Laravel') }} · &copy; {{ date('Y') }}</footer>
        </div>

        <script>
            function logoutUser(e){
                e.preventDefault();
                const url = "{{ route('logout') }}";
                const loginUrl = "{{ route('login') }}";
                const token = '{{ csrf_token() }}';

                fetch(url, {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': token,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    credentials: 'same-origin'
                }).then(() => {
                    try{ sessionStorage.clear(); localStorage.removeItem('auth'); }catch(e){}
                    window.location.replace(loginUrl);
                }).catch(()=>{
                    const f = document.createElement('form'); f.method='POST'; f.action=url;
                    const i = document.createElement('input'); i.type='hidden'; i.name='_token'; i.value=token; f.appendChild(i); document.body.appendChild(f); f.submit();
                });
            }
        </script>
    </body>
</html>
