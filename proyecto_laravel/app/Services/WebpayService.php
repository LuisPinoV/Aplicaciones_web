<?php

namespace App\Services;

use GuzzleHttp\Client;
use Transbank\Webpay\WebpayPlus;
use Transbank\Webpay\WebpayPlus\Transaction;

class WebpayService
{
    protected $transaction;

    public function __construct()
    {
        // Cliente Guzzle SIN verificar certificado SSL
        $client = new Client([
            'verify' => false
        ]);

        // Inyectar el cliente Guzzle al SDK
        WebpayPlus::setHttpClient($client);

        // Crear transacción
        $this->transaction = new Transaction();
    }

    public function createTransaction($amount, $sessionId, $buyOrder, $returnUrl)
    {
        return $this->transaction->create(
            $buyOrder,
            $sessionId,
            $amount,
            $returnUrl
        );
    }

    public function commitTransaction($token)
    {
        return $this->transaction->commit($token);
    }
}
