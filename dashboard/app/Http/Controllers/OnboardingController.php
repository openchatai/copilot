<?php

namespace App\Http\Controllers;

use App\Http\Services\SwaggerParser;
use App\Models\Chatbot;
use Exception;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
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

    public function validator(Request $request)
    {
        $botId = $request->route('id');

        /**
         * @var Chatbot $bot
         */
        $bot = Chatbot::findOrFail($botId);

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
            return redirect()->route('onboarding.002-step-swagger')->with('error', 'invalid_swagger_file');
        }

        return view('onboarding.003-step-validator', ['parser' => $parser]);
    }
}
