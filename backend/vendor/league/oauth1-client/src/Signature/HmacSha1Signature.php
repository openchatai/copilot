<?php

namespace League\OAuth1\Client\Signature;

class HmacSha1Signature extends Signature implements SignatureInterface
{
    use EncodesUrl;

    /**
     * @inheritDoc
     */
    public function method()
    {
        return 'HMAC-SHA1';
    }

    /**
     * @inheritDoc
     */
    public function sign($uri, array $parameters = [], $method = 'POST')
    {
        $url = $this->createUrl($uri);

        $baseString = $this->baseString($url, $method, $parameters);

        return base64_encode($this->hash($baseString));
    }

    /**
     * Hashes a string with the signature's key.
     *
     * @param string $string
     *
     * @return string
     */
    protected function hash($string)
    {
        return hash_hmac('sha1', $string, $this->key(), true);
    }
}
