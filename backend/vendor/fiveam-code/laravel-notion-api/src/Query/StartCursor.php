<?php

namespace FiveamCode\LaravelNotionApi\Query;

/**
 * Class StartCursor.
 */
class StartCursor
{
    /**
     * @var string
     */
    private string $cursor;

    /**
     * StartCursor constructor.
     *
     * @param  string  $cursor
     */
    public function __construct(string $cursor)
    {
        $this->cursor = $cursor;
    }

    public function __toString(): string
    {
        return $this->cursor;
    }
}
