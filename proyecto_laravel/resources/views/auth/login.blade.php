<x-guest-layout>
    <!-- Session Status -->
    <x-auth-session-status class="mb-4" :status="session('status')" />

    <form method="POST" action="{{ route('login') }}">
        @csrf

        <!-- Email Address -->
        <div>
            <x-input-label for="email" :value="__('Email')" />
            <x-text-input id="email" class="block mt-1 w-full" type="email" name="email" :value="old('email')" required autofocus autocomplete="username" />
            <x-input-error :messages="$errors->get('email')" class="mt-2" />
        </div>

        <!-- Password -->
        <div class="mt-4">
            <x-input-label for="password" :value="__('Password')" />

            <x-text-input id="password" class="block mt-1 w-full"
                            type="password"
                            name="password"
                            required autocomplete="current-password" />

            <x-input-error :messages="$errors->get('password')" class="mt-2" />
        </div>

        <!-- Remember Me -->
        <div class="block mt-4">
            <label for="remember_me" class="inline-flex items-center">
                <input id="remember_me" type="checkbox" class="rounded dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-indigo-600 shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:focus:ring-offset-gray-800" name="remember">
                <span class="ms-2 text-sm text-gray-600 dark:text-gray-400">{{ __('Remember me') }}</span>
            </label>
        </div>

        <div class="flex items-center justify-end mt-4">
            @if (Route::has('password.request'))
                <a class="underline text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800" href="{{ route('password.request') }}">
                    {{ __('Forgot your password?') }}
                </a>
            @endif

            <x-primary-button class="ms-3">
                {{ __('Log in') }}
            </x-primary-button>
        </div>
    </form>

    <!-- 🔥 BOTÓN DE INICIO CON GOOGLE AQUÍ -->
    <div class="mt-6">
        <a href="{{ route('auth.google.redirect') }}"
           class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition">
           
            <!-- Icono Google -->
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.61l6.85-6.85C35.23 2.72 29.92.5 24 .5 14.96.5 7.21 5.74 3.58 13.26l7.98 6.2C14 13.46 18.68 9.5 24 9.5z"/>
                <path fill="#34A853" d="M46.1 24.5c0-1.64-.15-3.23-.42-4.76H24v9.01h12.39c-.54 2.89-2.16 5.33-4.6 6.98l7.09 5.51C43.79 36.07 46.1 30.64 46.1 24.5z"/>
                <path fill="#FBBC05" d="M11.56 28.96c-.5-1.49-.78-3.08-.78-4.71s.28-3.22.78-4.71l-7.98-6.2C1.58 16.1.5 20.16.5 24.25s1.08 8.15 3.08 11.91l7.98-6.2z"/>
                <path fill="#4285F4" d="M24 46c6.52 0 12.01-2.15 16.02-5.8l-7.09-5.51c-2.01 1.35-4.61 2.19-7.93 2.19-5.32 0-9.99-3.96-11.52-9.31l-7.98 6.2C7.21 42.26 14.96 46 24 46z"/>
            </svg>

            Iniciar sesión con Google
        </a>
    </div>
</x-guest-layout>
