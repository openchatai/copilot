<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Contracts\View\View;
use App\Http\Services\SwaggerParser;
use App\Models\Chatbot;
use Exception;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Contracts\View\Factory;
use Illuminate\Support\Facades\Storage;

class OnboardingController extends Controller
{
    public function welcome()
    {
        return view('onboarding.001-step-welcome');
    }

    public function swagger()
    {
        return view('onboarding.002-step-swagger');
    }

    public function done()
    {
        return view('onboarding.004-step-done');
    }

    public function validator(Request $request): Factory|View|JsonResponse|RedirectResponse
    {
        /**
         * @var Chatbot $bot
         */
        $bot = Chatbot::query()->findOrFail($request->route('id'));

        try {
            $swaggerName = $bot->getSwaggerUrl();

            if (!str_starts_with($swaggerName, "https")) {
                // Read the file content from shared_data storage
                $swaggerContent = Storage::disk('shared_volume')->get($swaggerName);
            } else {
                // Call the Swagger endpoint and get the JSON data
                $guzzleClient = new Client();
                $response = $guzzleClient->get($swaggerName);
                // get the JSON data
                $swaggerContent = $response->getBody()->getContents();
            }

            // Parse the JSON content using SwaggerParser
            $parser = new SwaggerParser(json_decode($swaggerContent, true));
        } catch (Exception $e) {
            if (request()->wantsJson()) {
                return response()->json([
                    'error' => 'invalid_swagger_file'
                ], 400);
            }
            return redirect()->route('onboarding.002-step-swagger')->with('error', 'invalid_swagger_file');
        }

        if (request()->wantsJson()) {
            $endpoints = $parser->getEndpoints();
            return response()->json([
                'chatbot_id' => $bot->getId(),
                'all_endpoints' => $endpoints,
                'validations' => [
                    'endpoints_without_operation_id' => $parser->getEndpointsWithoutOperationId($endpoints),
                    'endpoints_without_description' => $parser->getEndpointsWithoutDescription($endpoints),
                    'endpoints_without_name' => $parser->getEndpointsWithoutName($endpoints),
                    'auth_type' => $parser->getAuthorizationType()
                ]
            ]);
        }

        return view('onboarding.003-step-validator', ['parser' => $parser]);
    }
}
