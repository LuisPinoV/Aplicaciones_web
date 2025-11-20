<x-guest-layout>
    <div class="text-center">
        <h1 class="text-2xl font-bold mb-6">Iniciar sesión</h1>

        <a href="{{ route('auth.google.redirect') }}"
           class="px-4 py-2 bg-red-500 text-white rounded">
            Iniciar sesión con Google
        </a>
    </div>
</x-guest-layout>
