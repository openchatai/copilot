<?php

namespace FiveamCode\LaravelNotionApi\Exceptions;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Arr;

/**
 * Class NotionException.
 */
class NotionException extends LaravelNotionAPIException
{
    /**
     * @param  string  $message
     * @param  array  $payload
     * @return NotionException
     */
    public static function instance(string $message, array $payload = []): NotionException
    {
        $code = 0;

        $responseDataExists = array_key_exists('responseData', $payload);

        if ($responseDataExists) {
            $responseData = $payload['responseData'];

            $code = array_key_exists('status', $responseData) ? $responseData['status'] : 0;
        }

        $e = new NotionException($message, $code);
        $e->payload = $payload;

        return $e;
    }

    /**
     * Handy method to create a NotionException
     * from a failed request.
     *
     * @param  Response  $response
     * @return NotionException
     */
    public static function fromResponse(Response $response): NotionException
    {
        $responseBody = json_decode($response->getBody()->getContents(), true);

        $errorCode = $errorMessage = '';
        if (Arr::exists($responseBody ?? [], 'code')) {
            $errorCode = "({$responseBody['code']})";
        }

        if (Arr::exists($responseBody ?? [], 'code')) {
            $errorMessage = "({$responseBody['message']})";
        }

        $message = "{$response->getReasonPhrase()}: {$errorCode} {$errorMessage}";

        return new NotionException(
            $message,
            $response->status(),
            $response->toException()
        );
    }
}
