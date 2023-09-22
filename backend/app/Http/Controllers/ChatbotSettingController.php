<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\View\View;
use App\Http\Requests\UpdateChatbotRequest;
use App\Models\Chatbot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;

class ChatbotSettingController extends Controller
{
    public function generalSettings($id): View|JsonResponse
    {
        $bot = Chatbot::query()->findOrFail($id);

        if (request()->wantsJson()) {
            return response()->json([
                'chatbot' => $bot->toArray()
            ]);
        }

        return view('settings', [
            'bot' => $bot,
        ]);
    }

    public function deleteBot($id): RedirectResponse|JsonResponse
    {
        Chatbot::query()->findOrFail($id)->delete();

        if (request()->wantsJson()) {
            return response()->json([
                'success' => 'chatbot_deleted'
            ]);
        }

        return redirect()->route('index')->with('success', 'Bot deleted!');
    }

    /**
     * @throws ValidationException
     */
    public function generalSettingsUpdate(UpdateChatbotRequest $request, $id): JsonResponse|RedirectResponse
    {
        $bot = Chatbot::query()
            ->findOrFail($id);

        $bot->setName($request->getName());
        $bot->setPromptMessage($request->getPromptMessage());
        $bot->save();

        if (request()->wantsJson()) {
            return response()->json([
                'chatbot' => $bot->toArray()
            ]);
        }

        return redirect()->route('chatbot.settings', ['id' => $bot->getId()])->with('success', 'Settings updated!');
    }

    public function themeSettings($id)
    {
        /**
         * @var Chatbot $bot
         */
        $bot = Chatbot::where('id', $id)->firstOrFail();

        return view('settings-theme', [
            'bot' => $bot,
        ]);
    }
}
