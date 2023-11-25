<?php

namespace FiveamCode\LaravelNotionApi\Entities\Properties;

use DateTime;
use FiveamCode\LaravelNotionApi\Entities\PropertyItems\RichDate;
use FiveamCode\LaravelNotionApi\Exceptions\HandlingException;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;

/**
 * Class Rollup.
 */
class Rollup extends Property
{
    protected string $rollupType;

    /**
     * @throws HandlingException
     */
    protected function fillFromRaw(): void
    {
        parent::fillFromRaw();

        if (Arr::exists($this->rawContent, 'type')) {
            $this->rollupType = $this->rawContent['type'];

            switch ($this->rollupType) {
                case 'number':
                    $this->setRollupContentNumber();
                    break;
                case 'array':
                    $this->setRollupContentArray();
                    break;
                case 'date':
                    $this->setRollupContentDate();
                    break;
                default:
                    throw new HandlingException("Unexpected rollupType {$this->rollupType}");
            }
        }
    }

    /**
     * @return mixed
     */
    public function getContent()
    {
        return $this->content;
    }

    /**
     * @return string
     */
    public function getRollupType(): string
    {
        return $this->rollupType;
    }

    /**
     * @return string|null
     */
    public function getRollupContentType(): ?string
    {
        if ($this->getContent() instanceof Collection) {
            $firstItem = $this->getContent()->first();

            // if rollup is empty, there is no type
            if ($firstItem == null) {
                return null;
            }

            return $firstItem->getType();
        } else {
            return $this->getRollupType();
        }
    }

    private function setRollupContentNumber()
    {
        $this->content = $this->rawContent[$this->rollupType];
    }

    private function setRollupContentArray()
    {
        $this->content = new Collection();

        foreach ($this->rawContent[$this->rollupType] as $rollupPropertyItem) {
            // TODO
            $rollupPropertyItem['id'] = 'undefined';

            if ($this->isRollupPropertyContentSet($rollupPropertyItem)) {
                $this->content->add(
                    Property::fromResponse('', $rollupPropertyItem)
                );
            }
        }
    }

    private function isRollupPropertyContentSet($rollupPropertyItem): bool
    {
        return Arr::exists($rollupPropertyItem, 'type')
            && Arr::exists($rollupPropertyItem, $rollupPropertyItem['type'])
            && ! is_null($rollupPropertyItem[$rollupPropertyItem['type']]);
    }

    private function setRollupContentDate()
    {
        $this->content = new RichDate();

        if (isset($this->rawContent[$this->rollupType]['start'])) {
            $this->content->setStart(
                new DateTime($this->rawContent[$this->rollupType]['start'])
            );
        }

        if (isset($this->rawContent[$this->rollupType]['end'])) {
            $this->content->setEnd(
                new DateTime($this->rawContent[$this->rollupType]['end'])
            );
        }
    }
}
