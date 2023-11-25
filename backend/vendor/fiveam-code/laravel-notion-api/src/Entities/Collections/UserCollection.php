<?php

namespace FiveamCode\LaravelNotionApi\Entities\Collections;

use FiveamCode\LaravelNotionApi\Entities\User;
use Illuminate\Support\Collection;

/**
 * Class UserCollection.
 */
class UserCollection extends EntityCollection
{
    protected function collectChildren(): void
    {
        $this->collection = new Collection();
        foreach ($this->rawResults as $userChild) {
            $this->collection->add(new User($userChild));
        }
    }
}
