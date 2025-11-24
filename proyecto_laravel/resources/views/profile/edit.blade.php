@extends('layouts.app')

@section('content')

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
            <div class="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                <div class="max-w-xl">
                    <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100">{{ __('Profile') }}</h2>
                    @include('profile.partials.update-profile-information-form')

                    {{-- Send password reset link form (to allow setting a password without knowing the current one) --}}
                    <div class="mt-6">
                        @if(session('status') === 'password-link-sent')
                            <div class="text-sm text-green-600 dark:text-green-400">Se ha enviado un enlace para restablecer la contraseña a tu correo.</div>
                        @elseif(session('status') === 'password-link-failed')
                            <div class="text-sm text-red-600 dark:text-red-400">No se pudo enviar el enlace. Intenta de nuevo más tarde.</div>
                        @endif

                        <form method="POST" action="{{ route('profile.send-password-link') }}" class="mt-3">
                            @csrf
                            <button type="submit" class="px-3 py-2 bg-yellow-500 text-white rounded">Enviar enlace para restablecer contraseña</button>
                        </form>
                    </div>
                </div>
            </div>

            <div class="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                <div class="max-w-xl">
                    @include('profile.partials.update-password-form')
                </div>
            </div>

            <div class="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                <div class="max-w-xl">
                    @include('profile.partials.delete-user-form')
                </div>
            </div>
        </div>
    </div>

@endsection
