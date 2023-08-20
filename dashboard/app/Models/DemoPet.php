<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DemoPet extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'breed',
        'quantity',
        'image',
        'description',
        'price',
    ];

    public function getName(): string
    {
        return $this->name;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function getBreed(): string
    {
        return $this->breed;
    }

    public function getQuantity(): int
    {
        return $this->quantity;
    }

    public function getImage(): string
    {
        return $this->image;
    }

    public function getDescription(): string
    {
        return $this->description;
    }

    public function getPrice(): string
    {
        return $this->price;
    }

    public function setName(?string $name): void
    {
        $this->name = $name;
    }

    public function setType(?string $type): void
    {
        $this->type = $type;
    }

    public function setBreed(?string $breed): void
    {
        $this->breed = $breed;
    }

    public function setQuantity(?int $quantity): void
    {
        $this->quantity = $quantity;
    }

    public function setImage(?string $image): void
    {
        $this->image = $image;
    }

    public function setDescription(?string $description): void
    {
        $this->description = $description;
    }

    public function setPrice(?string $price): void
    {
        $this->price = $price;
    }
}
