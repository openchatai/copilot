<?php

namespace App\Http\Requests;



use App\Http\Enums\ChatBotInitialPromptEnum;
use Illuminate\Foundation\Http\FormRequest;

class AddNewDemoPetRequest extends FormRequest
{
    public function rules(): array
    {
        return [
        ];
    }

    public function getName(): ?string
    {
        return $this->input('data')['name'] ?? null;
    }

    public function getType(): ?string
    {
        return $this->input('data')['type']?? null;
    }

    public function getBreed(): ?string
    {
        return $this->input('data')['breed'] ?? null;
    }

    public function getQuantity(): int
    {
        return $this->input('data')['quantity'] ?? 1;
    }

    public function getImage(): string
    {
        return $this->input('data')['image'] ?? "https://placehold.co/600x400";
    }

    public function getDescription(): ?string
    {
        return $this->input('data')['description'] ?? 'empty';
    }

    public function getPrice(): string
    {
        return $this->input('data')['price'] ?? 0;
    }

}
