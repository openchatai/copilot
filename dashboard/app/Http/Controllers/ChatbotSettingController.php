<?php

namespace App\Http\Controllers;

use App\Http\Enums\ChatBotInitialPromptEnum;
use App\Models\Chatbot;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ChatbotSettingController extends Controller
{
    public function generalSettings($id)
    {
        $bot = Chatbot::where('id', $id)->firstOrFail();
        return view('settings', [
            'bot' => $bot,
        ]);
    }

    public function deleteBot($id): RedirectResponse
    {
        $bot = Chatbot::where('id', $id)->firstOrFail();
        $bot->delete();

        return redirect()->route('index')->with('success', 'Bot deleted!');
    }

    /**
     * @throws ValidationException
     */
    public function generalSettingsUpdate(Request $request, $id)
    {
        /**
         * @var Chatbot $bot
         */
        $bot = Chatbot::where('id', $id)->firstOrFail();

        $this->validate($request, [
            'name' => 'required',
        ]);

        $bot->setName($request->input('name'));
        $bot->setPromptMessage($request->input('prompt_message', ChatBotInitialPromptEnum::AI_COPILOT_INITIAL_PROMPT));
        $bot->save();

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
