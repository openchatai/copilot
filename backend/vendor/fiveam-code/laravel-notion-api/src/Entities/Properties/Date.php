<?php

namespace FiveamCode\LaravelNotionApi\Entities\Properties;

use DateTime;
use FiveamCode\LaravelNotionApi\Entities\Contracts\Modifiable;
use FiveamCode\LaravelNotionApi\Entities\PropertyItems\RichDate;
use FiveamCode\LaravelNotionApi\Exceptions\HandlingException;
use Illuminate\Support\Arr;

/**
 * Class Date.
 */
class Date extends Property implements Modifiable
{
    /**
     * @param $start
     * @param $end
     * @return Date
     */
    public static function value(?DateTime $start, ?DateTime $end = null): Date
    {
        $richDate = new RichDate();
        $richDate->setStart($start);
        $richDate->setEnd($end);

        $dateProperty = new Date();
        $dateProperty->content = $richDate;

        if ($richDate->isRange()) {
            $dateProperty->rawContent = [
                'date' => [
                    'start' => $start->format('Y-m-d'),
                    'end' => $end->format('Y-m-d'),
                ],
            ];
        } else {
            $dateProperty->rawContent = [
                'date' => [
                    'start' => $start->format('Y-m-d'),
                ],
            ];
        }

        return $dateProperty;
    }

    /**
     * @param $start
     * @param $end
     * @return Date
     */
    public static function valueWithTime(?DateTime $start, ?DateTime $end = null): Date
    {
        $richDate = new RichDate();
        $richDate->setStart($start);
        $richDate->setEnd($end);
        $richDate->setHasTime(true);

        $dateProperty = new Date();
        $dateProperty->content = $richDate;

        if ($richDate->isRange()) {
            $dateProperty->rawContent = [
                'date' => [
                    'start' => $start->format('c'),
                    'end' => $end->format('c'),
                ],
            ];
        } else {
            $dateProperty->rawContent = [
                'date' => [
                    'start' => $start->format('c'),
                ],
            ];
        }

        return $dateProperty;
    }

    /**
     * @throws HandlingException
     */
    protected function fillFromRaw(): void
    {
        parent::fillFromRaw();
        $this->fillDate();
    }

    protected function fillDate(): void
    {
        $richDate = new RichDate();

        if (Arr::exists($this->rawContent, 'start')) {
            $startAsIsoString = $this->rawContent['start'];
            $richDate->setStart(new DateTime($startAsIsoString));
            $richDate->setHasTime($this->isIsoTimeString($startAsIsoString));
        }

        if (Arr::exists($this->rawContent, 'end') && $this->rawContent['end'] !== null) {
            $endAsIsoString = $this->rawContent['end'];
            $richDate->setEnd(new DateTime($endAsIsoString));
        }

        $this->content = $richDate;
    }

    // function for checking if ISO datetime string includes time or not
    private function isIsoTimeString(string $isoTimeDateString): bool
    {
        return strpos($isoTimeDateString, 'T') !== false;
    }

    /**
     * @return RichDate
     */
    public function getContent(): RichDate
    {
        return $this->content;
    }

    /**
     * @return bool
     */
    public function isRange(): bool
    {
        return $this->getContent()->isRange();
    }

    /**
     * @return DateTime
     */
    public function getStart(): DateTime
    {
        if ($this->getContent() === null) {
            throw new HandlingException('Invalid content: The content of the Date Property is null.');
        }

        return $this->getContent()->getStart();
    }

    /**
     * @return ?DateTime
     */
    public function getEnd(): ?DateTime
    {
        if ($this->getContent() === null) {
            return null;
        }

        return $this->getContent()->getEnd();
    }

    /**
     * @return bool
     */
    public function hasTime(): bool
    {
        if ($this->getContent() === null) {
            return false;
        }

        return $this->getContent()->hasTime();
    }
}
