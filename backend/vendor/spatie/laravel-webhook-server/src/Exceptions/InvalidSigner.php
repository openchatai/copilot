<?php

namespace Spatie\WebhookServer\Exceptions;

use Exception;
use Spatie\WebhookServer\Signer\Signer;

class InvalidSigner extends Exception
{
    public static function doesNotImplementSigner(string $invalidClassName): self
    {
        $signerInterface = Signer::class;

        return new static("`{$invalidClassName}` is not a valid signer class because it does not implement `$signerInterface`");
    }
}
