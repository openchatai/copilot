<?php

namespace FiveamCode\LaravelNotionApi\Entities\PropertyItems;

use FiveamCode\LaravelNotionApi\Entities\Entity;
use Illuminate\Support\Arr;

/**
 * Class RichText.
 */
class RichText extends Entity
{
    /**
     * @var string
     */
    protected string $plainText = '';

    /**
     * @param  array  $responseData
     */
    protected function setResponseData(array $responseData): void
    {
        $this->responseData = $responseData;
        $this->fillFromRaw();
    }

    protected function fillFromRaw(): void
    {
        $this->fillPlainText();
    }

    protected function fillPlainText(): void
    {
        if (is_array($this->responseData)) {
            foreach ($this->responseData as $textItem) {
                if (Arr::exists($textItem, 'plain_text')) {
                    $this->plainText .= $textItem['plain_text'];
                }
            }
        }
    }

    /**
     * @return string
     */
    public function getPlainText(): string
    {
        return $this->plainText;
    }

    public function setPlainText($text): void
    {
        $this->plainText = $text;
    }
}
