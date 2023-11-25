# Send webhooks from Laravel apps

[![Latest Version on Packagist](https://img.shields.io/packagist/v/spatie/laravel-webhook-server.svg?style=flat-square)](https://packagist.org/packages/spatie/laravel-webhook-server)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/spatie/laravel-webhook-server/run-tests?label=tests)
[![Total Downloads](https://img.shields.io/packagist/dt/spatie/laravel-webhook-server.svg?style=flat-square)](https://packagist.org/packages/spatie/laravel-webhook-server)

A webhook is a way for an app to provide information to another app about a particular event. The way the two apps communicate is with a simple HTTP request. 

This package allows you to configure and send webhooks in a Laravel app easily. It has support for [signing calls](https://github.com/spatie/laravel-webhook-server#how-signing-requests-works), [retrying calls and backoff strategies](https://github.com/spatie/laravel-webhook-server#retrying-failed-webhooks).

If you need to receive and process webhooks take a look at our [laravel-webhook-client](https://github.com/spatie/laravel-webhook-client) package.

## Support us

[<img src="https://github-ads.s3.eu-central-1.amazonaws.com/laravel-webhook-server.jpg?t=1" width="419px" />](https://spatie.be/github-ad-click/laravel-webhook-server)

We invest a lot of resources into creating [best in class open source packages](https://spatie.be/open-source). You can support us by [buying one of our paid products](https://spatie.be/open-source/support-us).

We highly appreciate you sending us a postcard from your hometown, mentioning which of our package(s) you are using. You'll find our address on [our contact page](https://spatie.be/about-us). We publish all received postcards on [our virtual postcard wall](https://spatie.be/open-source/postcards).

## Installation

You can install the package via composer:

```bash
composer require spatie/laravel-webhook-server
```

You can publish the config file with:
```bash
php artisan vendor:publish --provider="Spatie\WebhookServer\WebhookServerServiceProvider"
```

This is the contents of the file that will be published at `config/webhook-server.php`:

```php
return [

    /*
     *  The default queue that should be used to send webhook requests.
     */
    'queue' => 'default',

    /*
     * The default http verb to use.
     */
    'http_verb' => 'post',

    /*
     * This class is responsible for calculating the signature that will be added to
     * the headers of the webhook request. A webhook client can use the signature
     * to verify the request hasn't been tampered with.
     */
    'signer' => \Spatie\WebhookServer\Signer\DefaultSigner::class,

    /*
     * This is the name of the header where the signature will be added.
     */
    'signature_header_name' => 'Signature',

    /*
     * These are the headers that will be added to all webhook requests.
     */
    'headers' => [],

    /*
     * If a call to a webhook takes longer that this amount of seconds
     * the attempt will be considered failed.
     */
    'timeout_in_seconds' => 3,

    /*
     * The amount of times the webhook should be called before we give up.
     */
    'tries' => 3,

    /*
     * This class determines how many seconds there should be between attempts.
     */
    'backoff_strategy' => \Spatie\WebhookServer\BackoffStrategy\ExponentialBackoffStrategy::class,
        
    /*
     * This class is used to dispatch webhooks on to the queue.
     */
    'webhook_job' => \Spatie\WebhookServer\CallWebhookJob::class,

    /*
     * By default we will verify that the ssl certificate of the destination
     * of the webhook is valid.
     */
    'verify_ssl' => true,
    
    /*
     * When set to true, an exception will be thrown when the last attempt fails
     */
    'throw_exception_on_failure' => false,

    /*
     * When using Laravel Horizon you can specify tags that should be used on the
     * underlying job that performs the webhook request.
     */
    'tags' => [],
];
```

By default, the package uses queues to retry failed webhook requests. Be sure to set up a real queue other than `sync` in non-local environments.

## Usage

This is the simplest way to call a webhook:

```php
WebhookCall::create()
   ->url('https://other-app.com/webhooks')
   ->payload(['key' => 'value'])
   ->useSecret('sign-using-this-secret')
   ->dispatch();
```

This will send a post request to `https://other-app.com/webhooks`. The body of the request will be JSON encoded version of the array passed to `payload`. The request will have a header called `Signature` that will contain a signature the receiving app can use [to verify](https://github.com/spatie/laravel-webhook-server#how-signing-requests-works) the payload hasn't been tampered with. 

If the receiving app doesn't respond with a response code starting with `2`, the package will retry calling the webhook after 10 seconds. If that second attempt fails, the package will attempt to call the webhook a final time after 100 seconds. Should that attempt fail, the `FinalWebhookCallFailedEvent` will be raised.

### Send webhook synchronously

If you would like to call the webhook immediately (synchronously), you may use the dispatchSync method. When using this method, the webhook will not be queued and will be run immediately. This can be helpfull in situation where sending the webhook is part of a bigger job that already has been queued.

```php
WebhookCall::create()
   ...
   ->dispatchSync();
```

### Conditionally sending webhooks

If you would like to conditionally dispatch a webhook, you may use the `dispatchIf`, `dispatchUnless`, `dispatchSyncIf` and `dispatchSyncUnless` methods:

```php
WebhookCall::create()
   ...
   ->dispatchIf($condition);

WebhookCall::create()
   ...
   ->dispatchUnless($condition);

WebhookCall::create()
   ...
   ->dispatchSyncIf($condition);

WebhookCall::create()
   ...
   ->dispatchSyncUnless($condition);
```

### How signing requests works

When setting up, it's common to generate, store, and share a secret between your app and the app that wants to receive webhooks. Generating the secret could be done with `Illuminate\Support\Str::random()`, but it's entirely up to you. The package will use the secret to sign a webhook call.

By default, the package will add a header called `Signature` that will contain a signature the receiving app can use the payload hasn't been tampered with. This is how that signature is calculated:

```php
// payload is the array passed to the `payload` method of the webhook
// secret is the string given to the `signUsingSecret` method on the webhook.

$payloadJson = json_encode($payload); 

$signature = hash_hmac('sha256', $payloadJson, $secret);
```

### Skip signing request

We don't recommend this, but if you don't want the web hook request to be signed call the `doNotSign` method.

```php
WebhookCall::create()
   ->doNotSign()
    ...
```

By calling this method, the `Signature` header will not be set.

### Customizing signing requests

If you want to customize the signing process, you can create your own custom signer. A signer is any class that implements `Spatie\WebhookServer\Signer`.

This is what that interface looks like.

```php
namespace Spatie\WebhookServer\Signer;

interface Signer
{
    public function signatureHeaderName(): string;

    public function calculateSignature(array $payload, string $secret): string;
}
```

After creating your signer, you can specify its class name in the `signer` key of the `webhook-server` config file. Your signer will then be used by default in all webhook calls.

You can also specify a signer for a specific webhook call:

```php
WebhookCall::create()
    ->signUsing(YourCustomSigner::class)
    ...
    ->dispatch();
```

If you want to customize the name of the header, you don't need to use a custom signer, but you can change the value in the `signature_header_name` in the `webhook-server` config file.

### Retrying failed webhooks

When the app to which we're sending the webhook fails to send a response with a `2xx` status code the package will consider the call as failed. The call will also be considered failed if the remote app doesn't respond within 3 seconds.

You can configure that default timeout in the `timeout_in_seconds` key of the `webhook-server` config file. Alternatively, you can override the timeout for a specific webhook like this:

```php
WebhookCall::create()
    ->timeoutInSeconds(5)
    ...
    ->dispatch();
```

When a webhook call fails, we'll retry the call two more times. You can set the default amount of times we retry the webhook call in the `tries` key of the config file. Alternatively, you can specify the number of tries for a specific webhook like this:

```php
WebhookCall::create()
    ->maximumTries(5)
    ...
    ->dispatch();
```

To not hammer the remote app we'll wait some time between each attempt. By default, we wait 10 seconds between the first and second attempt, 100 seconds between the third and the fourth, 1000 between the fourth and the fifth and so on. The maximum amount of seconds that we'll wait is 100 000, which is about 27 hours. This behavior is implemented in the default `ExponentialBackoffStrategy`.

You can define your own backoff strategy by creating a class that implements `Spatie\WebhookServer\BackoffStrategy\BackoffStrategy`. This is what that interface looks like:

```php
namespace Spatie\WebhookServer\BackoffStrategy;

interface BackoffStrategy
{
    public function waitInSecondsAfterAttempt(int $attempt): int;
}
```

You can make your custom strategy the default strategy by specifying its fully qualified class name in the `backoff_strategy` of the `webhook-server` config file. Alternatively, you can specify a strategy for a specific webhook like this.

```php
WebhookCall::create()
    ->useBackoffStrategy(YourBackoffStrategy::class)
    ...
    ->dispatch();
```

Under the hood, the retrying of the webhook calls is implemented using [delayed dispatching](https://laravel.com/docs/master/queues#delayed-dispatching). Amazon SQS only has support for a small maximum delay. If you're using Amazon SQS for your queues, make sure you do not configure the package in a way so there are more than 15 minutes between each attempt.

### Customizing the HTTP verb

By default, all webhooks will use the `post` method. You can customize that by specifying the HTTP verb you want in the `http_verb` key of the `webhook-server` config file.

You can also override the default for a specific call by using the `useHttpVerb` method.

```php
WebhookCall::create()
    ->useHttpVerb('get')
    ...
    ->dispatch();
```

### Adding extra headers

You can use extra headers by adding them to the `headers` key in the `webhook-server` config file. If you want to add additional headers for a specific webhook, you can use the `withHeaders` call.

```php
WebhookCall::create()
    ->withHeaders([
        'Another Header' => 'Value of Another Header'
    ])
    ...
    ->dispatch();
```

### Using a proxy

You can direct webhooks through a proxy by specifying the `proxy` key in the `webhook-server` config file. To set a proxy for a specific
request, you can use the `useProxy` call.

```php
WebhookCall::create()
    ->useProxy('http://proxy.server:3128')
    ...
```

The proxy specification follows the [guzzlehttp proxy format](https://docs.guzzlephp.org/en/stable/request-options.html#proxy)

### Verifying the SSL certificate of the receiving app

When using an URL that starts with `https://` the package will verify if the SSL certificate of the receiving party is valid. If it is not, we will consider the webhook call failed. We don't recommend this, but you can turn off this verification by setting the `verify_ssl` key in the `webhook-server` config file to `false`.

You can also disable the verification per webhook call with the `doNotVerifySsl` method.

```php
WebhookCall::create()
    ->doNotVerifySsl()
    ...
    ->dispatch();
```

### Adding meta information

You can add extra meta information to the webhook. This meta information will not be transmitted, and it will only be used to pass to [the events this package fires](#events).

This is how you can add meta information:

```php
WebhookCall::create()
    ->meta($arrayWithMetaInformation)
    ...
    ->dispatch();
```

### Adding tags

If you're using [Laravel Horizon](https://laravel.com/docs/5.8/horizon) for your queues, you'll be happy to know that we support [tags](https://laravel.com/docs/5.8/horizon#tags). 

To add tags to the underlying job that'll perform the webhook call, simply specify them in the `tags` key of the `webhook-server` config file or use the `withTags` method:

```php
WebhookCall::create()
    ->withTags($tags)
    ...
    ->dispatch();
```

### Exception handling
By default, the package will not log any exceptions that are thrown when sending a webhook.

To handle exceptions you need to create listeners for the `Spatie\WebhookServer\Events\WebhookCallFailedEvent` and/or `Spatie\WebhookServer\Events\FinalWebhookCallFailedEvent` events.

#### Retry failed execution
By default, failing jobs will be ignored. To throw an exception when the last attempt of a job fails, you can call `throwExceptionOnFailure` :
```php
WebhookCall::create()
    ->throwExceptionOnFailure()
    ...
    ->dispatch();
```
or activate the `throw_exception_on_failure` global option of the `webhook-server` config file.

### Events

The package fires these events:
- `WebhookCallSucceededEvent`: the remote app responded with a `2xx` response code.
- `WebhookCallFailedEvent`: the remote app responded with a non `2xx` response code, or it did not respond at all
- `FinalWebhookCallFailedEvent`: the final attempt to call the webhook failed.

All these events have these properties:

- `httpVerb`: the verb used to perform the request
- `webhookUrl`: the URL to where the request was sent
- `payload`: the used payload
- `headers`: the headers that were sent. This array includes the signature header
- `meta`: the array of values passed to the webhook with [the `meta` call](#adding-meta-information)
- `tags`: the array of [tags](#adding-tags) used
- `attempt`: the attempt number
- `response`: the response returned by the remote app. Can be an instance of `\GuzzleHttp\Psr7\Response` or `null`.
- `uuid`: a unique string to identify this call. This uuid will be the same for all attempts of a webhook call.

## Testing

``` bash
composer test
```

## Testing Webhooks
When using the package in automated tests, you'll want to perform one of the following to ensure that no webhooks are sent out to genuine websites

### Bus
```php 
use Illuminate\Support\Facades\Bus;
use Spatie\WebhookServer\CallWebhookJob;
use Tests\TestCase;

class TestFile extends TestCase
{
    public function testJobIsDispatched()
    {
        Bus::fake();

        ... Perform webhook call ...

        Bus::assertDispatched(CallWebhookJob::class);
    }
}
```

### Queue
```php 
use Illuminate\Support\Facades\Queue;
use Spatie\WebhookServer\CallWebhookJob;
use Tests\TestCase;

class TestFile extends TestCase
{
    public function testJobIsQueued()
    {
        Queue::fake();

        ... Perform webhook call ...

        Queue::assertPushed(CallWebhookJob::class);
    }
}
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](https://github.com/spatie/.github/blob/main/CONTRIBUTING.md) for details.

### Security

If you discover any security-related issues, please email freek@spatie.be instead of using the issue tracker.

## Postcardware

You're free to use this package, but if it makes it to your production environment, we highly appreciate you sending us a postcard from your hometown, mentioning which of our package(s) you are using.

Our address is: Spatie, Kruikstraat 22, 2018 Antwerp, Belgium.

We publish all received postcards [on our company website](https://spatie.be/en/opensource/postcards).

## Credits

- [Freek Van der Herten](https://github.com/freekmurze)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
