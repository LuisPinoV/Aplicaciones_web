<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>{{ config('app.name', 'Laravel') }}</title>

    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
</head>

<body class="bg-white dark:bg-[#161615]">

    <x-guest-layout>

        <div class="w-full h-screen flex items-center justify-center">
            <img src="{{ asset('images/Logo 1.jpg') }}" 
                 alt="Logo"
                 class="w-auto h-[80vh] object-contain">
        </div>

    </x-guest-layout>

</body>
</html>
