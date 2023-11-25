<?php

namespace FiveamCode\LaravelNotionApi\Entities\Collections;

use FiveamCode\LaravelNotionApi\Entities\Comment;
use Illuminate\Support\Collection;

/**
 * Class CommentCollection.
 */
class CommentCollection extends EntityCollection
{
    /**
     * collects all comments from the raw results (from Notion).
     */
    protected function collectChildren(): void
    {
        $this->collection = new Collection();
        foreach ($this->rawResults as $commentContent) {
            $this->collection->add(new Comment($commentContent));
        }
    }
}
