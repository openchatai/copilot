<?php

namespace FiveamCode\LaravelNotionApi\Entities\Properties;

use DateTime;
use FiveamCode\LaravelNotionApi\Exceptions\HandlingException;
use Throwable;

/**
 * Class LastEditedTime.
 */
class LastEditedTime extends Property
{
    /**
     * @throws HandlingException
     */
    protected function fillFromRaw(): void
    {
        parent::fillFromRaw();

        try {
            if (is_string($this->rawContent) && $this->rawContent !== null) {
                $this->content = new DateTime($this->rawContent);
            }
        } catch (Throwable $e) {
            throw HandlingException::instance('The content of last_edited_time is not a valid ISO 8601 date time string.');
        }
    }

    /**
     * @return DateTime
     */
    public function getContent(): DateTime
    {
        return $this->content;
    }
}
