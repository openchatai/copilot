<?php

namespace App\Http\Requests;



use App\Http\Enums\ChatBotInitialPromptEnum;
use Illuminate\Foundation\Http\FormRequest;

class CreateChatbotViaPremadeSwaggerRequest extends FormRequest
{
    public function rules(): array
    {
        return [
        ];
    }

    public function getName(): string
    {
        return $this->get('name', 'My Pet Store Copilot');
    }

    public function getWebsite(): string
    {
        return $this->get('website', "https://www.example.com");
    }


    public function getSwaggerFile()
    {
        return $this->file('swagger_file');
    }
    public function getPromptMessage(): string
    {
        return $this->get('prompt_message', ChatBotInitialPromptEnum::AI_COPILOT_PREMADE_DEMO);
    }
}
