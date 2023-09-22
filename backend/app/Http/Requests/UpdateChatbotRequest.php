<?php

namespace App\Http\Requests;

use App\Http\Enums\ChatBotInitialPromptEnum;
use Illuminate\Foundation\Http\FormRequest;

class UpdateChatbotRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => 'required|string',
            'prompt_message' => 'string',
        ];
    }

    public function getName(): string
    {
        return $this->post('name');
    }

    public function getPromptMessage(): string
    {
        return $this->post('prompt_message', ChatBotInitialPromptEnum::AI_COPILOT_INITIAL_PROMPT);
    }
}
