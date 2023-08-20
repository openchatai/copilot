<?php

namespace App\Http\Controllers;

use App\Http\Events\ChatbotWasCreated;
use App\Http\Requests\CreateChatbotViaPremadeSwaggerRequest;
use App\Http\Requests\CreateChatbotViaSwaggerRequest;
use App\Models\Chatbot;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Ramsey\Uuid\Uuid;

class ChatbotController extends Controller
{
    public function index()
    {
        return view('index', [
            'chatbots' => Chatbot::all()
        ]);
    }

    public function handleSwaggerFile(CreateChatbotViaSwaggerRequest $request): RedirectResponse
    {
        $fileName = Str::random(20) . ".json";
        $request->getSwaggerFile()->storeAs($fileName, ['disk' => 'shared_volume']);

        $chatbot = $this->createCopilot(
            $request->getName(),
            $fileName,
            $request->getPromptMessage(),
            $request->getWebsite(),
        );

        return redirect()->route('onboarding.003-step-validator', ['id' => $chatbot->getId()->toString()]);
    }

    public function handleSwaggerViaPremadeTemplate(CreateChatbotViaPremadeSwaggerRequest $request): RedirectResponse
    {
        $swaggerUrl = "https://tawleed.s3.eu-west-1.amazonaws.com/4bL2jimfa7yEt5IUAYQr.json";

        $chatbot = $this->createCopilot(
            $request->getName(),
            $swaggerUrl,
            $request->getPromptMessage(),
            $request->getWebsite(),
            true
        );

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
