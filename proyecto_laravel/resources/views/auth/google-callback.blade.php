<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>Autenticación con Google</title>
</head>
<body>
    <p>Autenticación completada. Si la ventana no se cierra automáticamente, puedes <a id="continue-link" href="{{ $redirectUrl }}">continuar</a>.</p>

    <script>
        (function(){
            const payload = {
                provider: 'google',
                success: true,
                user: @json($user),
                redirectUrl: "{{ $redirectUrl }}"
            };

            try {
                if (window.opener && !window.opener.closed) {
                    // Use opener's origin as the target origin (best-effort).
                    const targetOrigin = (window.opener.location && window.opener.location.origin) ? window.opener.location.origin : window.location.origin;
                    // Send a message to the opener window (same-origin expected)
                    window.opener.postMessage(payload, targetOrigin);
                    // Give the browser a short moment to set cookies and the
                    // opener to process the message before closing the popup.
                    setTimeout(() => {
                        try { window.close(); } catch (e) { /* ignore */ }
                    }, 500);
                } else {
                    // Not opened as a popup - do a normal redirect
                    window.location.href = payload.redirectUrl;
                }
            } catch (e) {
                // If cross-origin or other issues occur, provide link fallback
                document.getElementById('continue-link').style.display = 'inline';
            }
        })();
    </script>
</body>
</html>