<?php

namespace FiveamCode\LaravelNotionApi\Entities\Properties;

use FiveamCode\LaravelNotionApi\Entities\Contracts\Modifiable;

/**
 * Class Url.
 */
class Url extends Property implements Modifiable
{
    /**
     * @param $url
     * @return Url
     */
    public static function value(string $url): Url
    {
        $urlProperty = new Url();
        $urlProperty->content = $url;

        $urlProperty->rawContent = [
            'url' => $url,
        ];

        return $urlProperty;
    }

    protected function fillFromRaw(): void
    {
        parent::fillFromRaw();
        $this->fillUrl();
    }

    protected function fillUrl(): void
    {
        $this->content = $this->rawContent;
    }

    /**
     * @return string
     */
    public function getContent(): string
    {
        return $this->content;
    }

    /**
     * @return string
     */
    public function getUrl(): string
    {
        return $this->content;
    }
}
