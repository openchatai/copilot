<?php

namespace App\Http\Requests;

use Illuminate\Http\UploadedFile;
use App\Http\Enums\ChatBotInitialPromptEnum;
use Illuminate\Foundation\Http\FormRequest;

class CreateChatbotViaSwaggerRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'swagger_file' => 'required|file',
        ];
    }

    public function getName(): string
    {
        return $this->post('name', 'My first copilot');
    }

    public function getWebsite(): string
    {
        return $this->post('website', "https://www.example.com");
    }

    public function getSwaggerFile(): array|UploadedFile|null
    {
        return $this->file('swagger_file');
    }
    public function getPromptMessage(): string
    {
        return $this->post('prompt_message', ChatBotInitialPromptEnum::AI_COPILOT_INITIAL_PROMPT);
    }
}
