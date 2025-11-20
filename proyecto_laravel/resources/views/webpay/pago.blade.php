<h1>Test Webpay</h1>

<form action="{{ route('pago.iniciar') }}" method="POST">
    @csrf
    <label>Monto:</label>
    <input type="number" name="amount" value="1000">

    <button type="submit">Pagar con Webpay</button>
</form>
