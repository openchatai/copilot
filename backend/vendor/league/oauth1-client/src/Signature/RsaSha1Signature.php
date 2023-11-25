<?php

namespace League\OAuth1\Client\Signature;

use League\OAuth1\Client\Credentials\RsaClientCredentials;

class RsaSha1Signature extends Signature implements SignatureInterface
{
    use EncodesUrl;

    /**
     * @inheritDoc
     */
    public function method()
    {
        return 'RSA-SHA1';
    }

    /**
     * @inheritDoc
     */
    public function sign($uri, array $parameters = [], $method = 'POST')
    {
        $url = $this->createUrl($uri);
        $baseString = $this->baseString($url, $method, $parameters);

        /** @var RsaClientCredentials $clientCredentials */
        $clientCredentials = $this->clientCredentials;
        $privateKey = $clientCredentials->getRsaPrivateKey();

        openssl_sign($baseString, $signature, $privateKey);

        return base64_encode($signature);
    }
}
