<?php

namespace FiveamCode\LaravelNotionApi\Traits;

use Illuminate\Support\Arr;

/**
 * Trait HasParent.
 */
trait HasParent
{
    /**
     * @var array
     */
    protected array $responseData = [];

    /**
     * @var string
     */
    private string $parentId = '';

    /**
     * @var string
     */
    private string $parentType = '';

    protected function fillParentAttributes(): void
    {
        $this->fillParent();
    }

    private function fillParent(): void
    {
        if (Arr::exists($this->responseData, 'parent') && Arr::exists($this->responseData['parent'], 'type')) {
            $this->parentType = $this->responseData['parent']['type'];
            if (Arr::exists($this->responseData['parent'], $this->parentType)) {
                $this->parentId = $this->responseData['parent'][$this->parentType];
            }
        }
    }

    /**
     * @return string
     */
    public function getParentId(): string
    {
        return $this->parentId;
    }

    /**
     * @return string
     */
    public function getParentType(): string
    {
        return $this->parentType;
    }
}
