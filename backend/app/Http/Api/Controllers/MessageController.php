<?php

namespace App\Http\Api\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Chatbot;
use Exception;
use GuzzleHttp\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function initChat(Request $request): JsonResponse
    {
        $botToken = $request->header('X-Bot-Token');

        /** @var Chatbot $bot */
        $bot = Chatbot::where('token', $botToken)->first();

        if (!$bot) {
            return response()->json(
                [
                    "type" => "text",
                    "response" => [
                        "text" => "Could not find with token $botToken"
                    ]
                ]
            );
        }

        return response()->json(
            [
                "bot_name" => $bot->getName(),
                "logo" => "logo",
                "faq" => $faq ?? [],
                "inital_questions" => $initialQuestions ?? [],

            ]
        );
    }

    public function sendChat(Request $request)
    {
        $this->validate($request, [
            'content' => 'required|string|max:255',
            'headers' => 'sometimes|array',
        ]);

        $botToken = $request->header('X-Bot-Token');
        /** @var Chatbot $bot */
        $bot = Chatbot::where('token', $botToken)->first();

        if (!$bot) {
            return response()->json(
                [
                    "type" => "text",
                    "response" => [
                        "text" => "I'm unable to help you at the moment, please try again later.  **code: b404**"
                    ]
                ]
            );
        }

        $message = $request->input('content');

        try {
            $client = new Client();
            $response = $client->post('http://llm-server:8002/handle', [
                'json' => ['text' => $message, 'swagger_url' => $bot->getSwaggerUrl(), 'headers' => $request->input('headers'), 'base_prompt' => $bot->getPromptMessage()],
            ]);

            // Retrieve the response from the Flask endpoint
            $responseData = json_decode($response->getBody(), true);
            $textResponse = $responseData['response'];

            return response()->json(
                [
                    "type" => "text",
                    "response" => [
                        "text" => $textResponse
                    ]
                ]
            );
        } catch (Exception $exception) {
            return response()->json(
                [
                    "type" => "text",
                    "response" => [
                        "text" => "I'm unable to help you at the moment, please try again later.  **code: b500**  \n" .
                            "```" .
                            $exception->getMessage() . " at " . $exception->getFile() .
                            "```"
                    ]
                ]
            );
        }
    }
}
