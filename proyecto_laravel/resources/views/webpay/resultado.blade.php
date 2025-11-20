<h1>Resultado del Pago</h1>

@if ($response->isApproved())
    <p>Pago aprobado ✔</p>
    <p>Monto: {{ $response->amount }}</p>
    <p>Orden: {{ $response->buyOrder }}</p>
@else
    <p>Pago rechazado ❌</p>
@endif
