<?php

namespace App\Http\Controllers;

use App\Http\Events\ChatbotWasCreated;
use App\Http\Requests\CreateChatbotViaPremadeSwaggerRequest;
use App\Http\Requests\CreateChatbotViaSwaggerRequest;
use App\Models\Chatbot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Ramsey\Uuid\Uuid;
use Illuminate\Support\Facades\Http;

class ChatbotController extends Controller
{
    public function index()
    {
        $chatbots = Chatbot::all();

        if (request()->wantsJson()) {
            return response()->json($chatbots->toArray());
        }

        return view('index', ['chatbots' => $chatbots]);
    }

    public function handleSwaggerFile(CreateChatbotViaSwaggerRequest $request): RedirectResponse|JsonResponse
    {
        $fileName = Str::random(20) . ".json";
        $request->getSwaggerFile()->storeAs($fileName, ['disk' => 'shared_volume']);
    
        $chatbot = $this->createCopilot(
            $request->getName(),
            $fileName,
            $request->getPromptMessage(),
            $request->getWebsite(),
        );
    
        // Prepare the data for the POST request
        $server_url = env('LLM_SERVER_ENDPOINT', 'http://llm-server:8002') . "/swagger_api/init/b/" . $chatbot->getId()->toString();
        // Send a POST request to the microservice
        $response = Http::post($server_url, ['swagger_url' => $fileName]);
    
        if (request()->wantsJson()) {
            return response()->json([
                'file_name' => $fileName,
                'chatbot' => $chatbot->toArray()
            ]);
        }
    
        return redirect()->route('onboarding.003-step-validator', ['id' => $chatbot->getId()->toString()]);
    }

    public function handleSwaggerViaPremadeTemplate(CreateChatbotViaPremadeSwaggerRequest $request): RedirectResponse|JsonResponse
    {
        $swaggerUrl = "https://tawleed.s3.eu-west-1.amazonaws.com/23432522745.json";

        $chatbot = $this->createCopilot(
            $request->getName(),
            $swaggerUrl,
            $request->getPromptMessage(),
            $request->getWebsite(),
            true
        );

        if (request()->wantsJson()) {
            return response()->json([
                'swagger_url' => $swaggerUrl,
                'chatbot' => $chatbot->toArray()
            ]);
        }

        return redirect()->route('onboarding.003-step-validator', ['id' => $chatbot->getId()->toString()]);
    }

    private function createCopilot(string $name, string $swaggerUrl, string $promptMessage, string $website = "https://www.example.com", bool $isPreMadeDemo = false): Chatbot
    {
        $chatbot = new Chatbot();
        $chatbot->setId(Uuid::uuid4());
        $chatbot->setName($name);
        $chatbot->setToken(Str::random(20));
        $chatbot->setWebsite($website);
        $chatbot->setSwaggerUrl($swaggerUrl);
        $chatbot->setPromptMessage($promptMessage);
        $chatbot->setIsPreMadeDemoTemplate($isPreMadeDemo);
        $chatbot->save();

        event(new ChatbotWasCreated(
            $chatbot->getId(),
            $chatbot->getName(),
            null,
            $chatbot->getPromptMessage(),
        ));

        return $chatbot;
    }

    public function demo($token)
    {
        /** @var Chatbot $bot */
        $bot = Chatbot::where('token', $token)->firstOrFail();

        if ($bot->isPreMadeDemoTemplate()) {
            return view('demo-pet', [
                'token' => $token,
            ]);
        }

        return view('demo', [
            'token' => $token,
        ]);
    }
}
