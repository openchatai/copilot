<?php

namespace FiveamCode\LaravelNotionApi\Entities\Properties;

use FiveamCode\LaravelNotionApi\Entities\Contracts\Modifiable;

/**
 * Class PhoneNumber.
 */
class PhoneNumber extends Property implements Modifiable
{
    /**
     * @param $phoneNumber
     * @return PhoneNumber
     */
    public static function value(string $phoneNumber): PhoneNumber
    {
        $urlProperty = new PhoneNumber();
        $urlProperty->content = $phoneNumber;

        $urlProperty->rawContent = [
            'phone_number' => $phoneNumber,
        ];

        return $urlProperty;
    }

    protected function fillFromRaw(): void
    {
        parent::fillFromRaw();
        $this->fillPhoneNumber();
    }

    protected function fillPhoneNumber(): void
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
    public function getPhoneNumber(): string
    {
        return $this->content;
    }
}
