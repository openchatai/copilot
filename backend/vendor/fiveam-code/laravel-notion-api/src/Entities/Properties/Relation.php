<?php

namespace FiveamCode\LaravelNotionApi\Entities\Properties;

use FiveamCode\LaravelNotionApi\Entities\Contracts\Modifiable;
use Illuminate\Support\Collection;

/**
 * Class Relation.
 */
class Relation extends Property implements Modifiable
{
    /**
     * @param $relationIds
     * @return Relation
     */
    public static function value(array $relationIds): Relation
    {
        $relationProperty = new Relation();
        $relationProperty->content = new Collection();
        $relationProperty->rawContent = ['relation' => []];

        foreach ($relationIds as $relationId) {
            array_push($relationProperty->rawContent['relation'], ['id' => $relationId]);
            $relationProperty->content->add($relationId);
        }

        return $relationProperty;
    }

    protected function fillFromRaw(): void
    {
        parent::fillFromRaw();
        $this->fillRelation();
    }

    protected function fillRelation(): void
    {
        $this->content = new Collection();
        foreach ($this->rawContent as $relationId) {
            $this->content->add($relationId);
        }
    }

    /**
     * @return Collection
     */
    public function getContent(): Collection
    {
        return $this->content;
    }

    /**
     * @return Collection
     */
    public function getRelation(): Collection
    {
        return $this->content;
    }
}
