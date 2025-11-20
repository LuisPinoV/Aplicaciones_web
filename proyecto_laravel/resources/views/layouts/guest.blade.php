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
            }
            header.appbar{background:linear-gradient(90deg,var(--green-700),var(--green-500)); color:#fff; padding:14px 18px; display:flex; align-items:center; justify-content:space-between}
            header .brand{display:flex; gap:12px; align-items:center}
            header nav{display:flex; gap:12px; align-items:center}
            header nav a{color:rgba(255,255,255,0.95); text-decoration:none; padding:8px 12px; border-radius:8px}
            header nav .btn-ghost{background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.95); border:0; cursor:pointer; padding:8px 12px; border-radius:8px}
        </style>
    </head>
    <body class="font-sans text-gray-900 antialiased">
        <header class="appbar">
            <div class="brand">
                <div style="width:44px;height:44px;border-radius:10px;background:rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;font-weight:700">MD</div>
                <div>
                    <h1>{{ config('app.name', 'Laravel') }}</h1>
                    <p style="margin:0;font-size:12px;opacity:0.9">Bienvenido</p>
                </div>
            </div>

            <nav>
                @if (Route::has('login'))
                    <a href="{{ route('login') }}" class="btn-ghost">Iniciar sesión</a>
                @endif
                @if (Route::has('register'))
                    <a href="{{ route('register') }}" class="btn-ghost">Registro</a>
                @endif
            </nav>
        </header>

        <div class="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0" style="padding:28px 18px">
            <div style="max-width:440px;width:100%" class="mt-6 px-6 py-4 bg-white shadow-md overflow-hidden sm:rounded-lg">
                {{ $slot }}
            </div>
        </div>
    </body>
</html>
