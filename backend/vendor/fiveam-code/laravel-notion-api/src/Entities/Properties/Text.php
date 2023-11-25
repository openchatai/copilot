<?php

namespace FiveamCode\LaravelNotionApi\Entities\Properties;

use FiveamCode\LaravelNotionApi\Entities\Contracts\Modifiable;
use FiveamCode\LaravelNotionApi\Entities\PropertyItems\RichText;
use FiveamCode\LaravelNotionApi\Exceptions\HandlingException;

/**
 * Class Text.
 */
class Text extends Property implements Modifiable
{
    /**
     * @var string
     */
    protected string $plainText = '';

    /**
     * @param $text
     * @return Text
     */
    public static function value($text): Text
    {
        $textProperty = new Text();

        if (is_string($text)) {
            $richText = new RichText();
            $richText->setPlainText($text);
            $textProperty->plainText = $richText->getPlainText();
            $textProperty->content = $richText;
        } else {
            $textProperty->plainText = $text->getPlainText();
            $textProperty->content = $text;
        }

        //!INFO: Currently only plain_text is transfered into rawContent
        //TODO: Later the RichText has to return it's raw structure into 'content'
        $textProperty->rawContent = [
            'rich_text' => [
                [
                    'type' => 'text',
                    'text' => [
                        'content' => $richText->getPlainText(),
                    ],
                ],
            ],
        ];

        return $textProperty;
    }

    /**
     * @throws HandlingException
     */
    protected function fillFromRaw(): void
    {
        parent::fillFromRaw();
        if (! is_array($this->rawContent)) {
            throw HandlingException::instance('The property-type is text, however the raw data-structure does not represent this type (= array of items). Please check the raw response-data.');
        }

        $this->fillText();
    }

    protected function fillText(): void
    {
        $this->content = new RichText($this->rawContent);
        $this->plainText = $this->content->getPlainText();
    }

    /**
     * @return RichText
     */
    public function getContent(): RichText
    {
        return $this->getRichText();
    }

    /**
     * @return string
     */
    public function asText(): string
    {
        return $this->getPlainText();
    }

    /**
     * @return RichText
     */
    public function getRichText(): RichText
    {
        return $this->content;
    }

    /**
     * @return string
     */
    public function getPlainText(): string
    {
        return $this->plainText;
    }
}
