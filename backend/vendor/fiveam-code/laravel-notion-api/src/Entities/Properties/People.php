<?php

namespace FiveamCode\LaravelNotionApi\Entities\Properties;

use FiveamCode\LaravelNotionApi\Entities\Contracts\Modifiable;
use FiveamCode\LaravelNotionApi\Entities\User;
use FiveamCode\LaravelNotionApi\Exceptions\HandlingException;
use Illuminate\Support\Collection;

/**
 * Class People.
 */
class People extends Property implements Modifiable
{
    /**
     * @param $userIds
     * @return People
     */
    public static function value(array $userIds): People
    {
        $peopleProperty = new People();
        $peopleProperty->content = new Collection();
        $peopleProperty->rawContent = ['people' => []];

        foreach ($userIds as $userId) {
            array_push($peopleProperty->rawContent['people'], ['object' => 'user', 'id' => $userId]);
            $peopleProperty->content->add(new User(['object' => 'user', 'id' => $userId]));
        }

        return $peopleProperty;
    }

    /**
     * @throws HandlingException
     */
    protected function fillFromRaw(): void
    {
        parent::fillFromRaw();
        if (! is_array($this->rawContent)) {
            throw HandlingException::instance('The property-type is people, however the raw data-structure does not reprecent this type (= array of items). Please check the raw response-data.');
        }

        $this->content = new Collection();
        foreach ($this->rawContent as $peopleItem) {
            $this->content->add(new User($peopleItem));
        }
    }

    /**
     * @return Collection
     */
    public function getContent(): Collection
    {
        return $this->getPeople();
    }

    /**
     * @return Collection
     */
    public function getPeople(): Collection
    {
        return $this->content;
    }
}
