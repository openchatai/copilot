<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddNewDemoPetRequest;
use App\Models\DemoPet;
use Illuminate\Http\Request;

class DemoPetController extends Controller
{
    public function show(Request $request, $id)
    {
        $pet = DemoPet::findOrFail($id);

        return response()->json(
            $pet->toArray()
        );
    }

    public function store(AddNewDemoPetRequest $request)
    {
        $pet = new DemoPet();
        $pet->setName($request->getName());
        $pet->setType($request->getType());
        $pet->setBreed($request->getBreed());
        $pet->setQuantity($request->getQuantity());
        $pet->setImage($request->getImage());
        $pet->setDescription($request->getDescription());
        $pet->setPrice($request->getPrice());
        $pet->save();

        return response()->json($pet->toArray());
    }

    public function delete(int $id)
    {
        $pet = DemoPet::findOrFail($id);
        $pet->delete();

        return response()->json([
            'message' => 'Pet deleted successfully',
        ]);
    }

    public function deletePetByName(Request $request)
    {
        $name = $request->get('name');
        DemoPet::where('name', $name)->delete();

        return response()->json([
            'message' => 'Pet deleted successfully',
        ]);
    }

    public function searchPetInAllFields(Request $request)
    {
        $searchTerm = $request->get('searchTerm');

        $pets = DemoPet::where('name', 'like', "%$searchTerm%")
            ->orWhere('type', 'like', "%$searchTerm%")
            ->orWhere('breed', 'like', "%$searchTerm%")
            ->orWhere('description', 'like', "%$searchTerm%")
            ->orWhere('price', 'like', "%$searchTerm%")
            ->get();

        return response()->json($pets->toArray());
    }

    public function index()
    {
        $pets = DemoPet::all();

        return response()->json($pets->toArray());
    }

    public function update(int $id, AddNewDemoPetRequest $request)
    {
        $pet = DemoPet::findOrFail($id);
        $pet->setName($request->getName());
        $pet->setType($request->getType());
        $pet->setBreed($request->getBreed());
        $pet->setQuantity($request->getQuantity());
        $pet->setImage($request->getImage());
        $pet->setDescription($request->getDescription());
        $pet->setPrice($request->getPrice());
        $pet->save();

        return response()->json(
            $pet->toArray());
    }

    public function analytics()
    {
        return response()->json([
            [
                'month' => 'january',
                'data' => [
                    'total_number_of_sales' => 15,
                    'total_amount_of_sales' => 30000,
                    'number_of_pets_in_the_inventory' => [
                        'total' => 150,
                        'breakdown' => [
                            'dogs' => 20,
                            'cats' => 120,
                            'birds' => 5,
                            'fishes' => 3,
                            'rabbits' => 2,
                        ]
                    ],
                ]
            ],
            [
                'month' => 'february',
                'data' => [
                    'total_number_of_sales' => 12,
                    'total_amount_of_sales' => 24000,
                    'number_of_pets_in_the_inventory' => [
                        'total' => 140,
                        'breakdown' => [
                            'dogs' => 15,
                            'cats' => 125,
                            'birds' => 6,
                            'fishes' => 4,
                            'rabbits' => 1,
                        ]
                    ],
                ]
            ],
            [
                'month' => 'march',
                'data' => [
                    'total_number_of_sales' => 18,
                    'total_amount_of_sales' => 26000,
                    'number_of_pets_in_the_inventory' => [
                        'total' => 155,
                        'breakdown' => [
                            'dogs' => 25,
                            'cats' => 125,
                            'birds' => 3,
                            'fishes' => 2,
                            'rabbits' => 0,
                        ]
                    ],
                ]
            ],
            [
                'month' => 'april',
                'data' => [
                    'total_number_of_sales' => 20,
                    'total_amount_of_sales' => 28000,
                    'number_of_pets_in_the_inventory' => [
                        'total' => 160,
                        'breakdown' => [
                            'dogs' => 30,
                            'cats' => 120,
                            'birds' => 5,
                            'fishes' => 2,
                            'rabbits' => 3,
                        ]
                    ],
                ]
            ],
            [
                'month' => 'may',
                'data' => [
                    'total_number_of_sales' => 10,
                    'total_amount_of_sales' => 18000,
                    'number_of_pets_in_the_inventory' => [
                        'total' => 135,
                        'breakdown' => [
                            'dogs' => 15,
                            'cats' => 110,
                            'birds' => 5,
                            'fishes' => 3,
                            'rabbits' => 2,
                        ]
                    ],
                ]
            ],
            [
                'month' => 'june',
                'data' => [
                    'total_number_of_sales' => 18,
                    'total_amount_of_sales' => 25000,
                    'number_of_pets_in_the_inventory' => [
                        'total' => 150,
                        'breakdown' => [
                            'dogs' => 20,
                            'cats' => 125,
                            'birds' => 3,
                            'fishes' => 1,
                            'rabbits' => 1,
                        ]
                    ],
                ]
            ],
            [
                'month' => 'july',
                'data' => [
                    'total_number_of_sales' => 8,
                    'total_amount_of_sales' => 12000,
                    'number_of_pets_in_the_inventory' => [
                        'total' => 110,
                        'breakdown' => [
                            'dogs' => 10,
                            'cats' => 100,
                            'birds' => 2,
                            'fishes' => 1,
                            'rabbits' => 0,
                        ]
                    ],
                ]
            ],
            [
                'month' => 'august',
                'data' => [
                    'total_number_of_sales' => 22,
                    'total_amount_of_sales' => 28000,
                    'number_of_pets_in_the_inventory' => [
                        'total' => 165,
                        'breakdown' => [
                            'dogs' => 30,
                            'cats' => 125,
                            'birds' => 5,
                            'fishes' => 3,
                            'rabbits' => 2,
                        ]
                    ],
                ]
            ],
            [
                'month' => 'september',
                'data' => [
                    'total_number_of_sales' => 16,
                    'total_amount_of_sales' => 26000,
                    'number_of_pets_in_the_inventory' => [
                        'total' => 155,
                        'breakdown' => [
                            'dogs' => 25,
                            'cats' => 125,
                            'birds' => 4,
                            'fishes' => 2,
                            'rabbits' => 1,
                        ]
                    ],
                ]
            ],
            [
                'month' => 'october',
                'data' => [
                    'total_number_of_sales' => 14,
                    'total_amount_of_sales' => 22000,
                    'number_of_pets_in_the_inventory' => [
                        'total' => 145,
                        'breakdown' => [
                            'dogs' => 20,
                            'cats' => 120,
                            'birds' => 3,
                            'fishes' => 2,
                            'rabbits' => 0,
                        ]
                    ],
                ]
            ],
            [
                'month' => 'november',
                'data' => [
                    'total_number_of_sales' => 18,
                    'total_amount_of_sales' => 24000,
                    'number_of_pets_in_the_inventory' => [
                        'total' => 150,
                        'breakdown' => [
                            'dogs' => 25,
                            'cats' => 125,
                            'birds' => 4,
                            'fishes' => 3,
                            'rabbits' => 1,
                        ]
                    ],
                ]
            ],
            [
                'month' => 'december',
                'data' => [
                    'total_number_of_sales' => 10,
                    'total_amount_of_sales' => 16000,
                    'number_of_pets_in_the_inventory' => [
                        'total' => 130,
                        'breakdown' => [
                            'dogs' => 15,
                            'cats' => 110,
                            'birds' => 3,
                            'fishes' => 1,
                            'rabbits' => 1,
                        ]
                    ],
                ]
            ],
        ]);
    }

}
