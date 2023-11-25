<?php

namespace Spatie\WebhookServer\Signer;

interface Signer
{
    public function signatureHeaderName(): string;

    public function calculateSignature(string $webhookUrl, array $payload, string $secret): string;
}
