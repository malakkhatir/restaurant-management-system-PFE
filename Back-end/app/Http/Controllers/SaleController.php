<?php

namespace App\Http\Controllers;

use App\Models\Sales;
use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SaleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $sales = Sales::with([
            'menus' => function ($query) {
                $query->select('menus.id', 'menus.title', 'menu_sales.quantity');
            },
            'table',
            'servant',
        ])
        ->orderBy('created_at', 'DESC')
        ->paginate(10);

        Log::info('Fetching sales data');

        return response()->json($sales);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        Log::info('Validation des données de la requête : ', $request->all());

        $request->validate([
            'table_id' => 'required|exists:tables,id',
            'servant_id' => 'required|exists:servants,id',
            'total_price' => 'required|numeric',
            'payment_type' => 'required|string',
            'payment_status' => 'required|string',
            'menus' => 'required|array',
            'menus.*.menu_id' => 'required|exists:menus,id',
            'menus.*.quantity' => 'required|integer|min:1',
        ]);

        Log::info('Données validées, création de la vente.');

        try {
            $sale = Sales::create([
                'table_id' => $request->table_id,
                'servant_id' => $request->servant_id,
                'total_price' => $request->total_price,
                'payment_type' => $request->payment_type,
                'payment_status' => $request->payment_status,
            ]);

            Log::info('Vente créée avec succès : ', ['sale' => $sale]);

            foreach ($request->menus as $menu) {
                Log::info('Attacher le menu à la vente : ', ['menu_id' => $menu['menu_id'], 'quantity' => $menu['quantity']]);
                $sale->menus()->attach($menu['menu_id'], ['quantity' => $menu['quantity']]);
            }

            Log::info('Menus attachés à la vente.');

            return response()->json($sale, 201);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la création de la vente : ', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Erreur lors de la création de la vente'], 500);
        }
    }

    /**
     * Display the specified sale.
     */
    public function show($id)
    {
        try {
            $sale = Sales::with('table', 'servant', 'menus')->findOrFail($id);
            return response()->json($sale);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Vente non trouvée'], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            "table_id" => "required|exists:tables,id",
            "servant_id" => "required|exists:servants,id",
            "total_price" => "required|numeric|min:0",
            "payment_type" => "required|string",
            "payment_status" => "required|string",
        ]);

        $sale = Sales::findOrFail($id);
        $sale->table_id = $request->table_id;
        $sale->servant_id = $request->servant_id;
        $sale->total_price = $request->total_price;
        $sale->payment_status = $request->payment_status;
        $sale->payment_type = $request->payment_type;
        $sale->save();

        $menus = collect($request->menus)->mapWithKeys(function ($menu) {
            return [$menu['menu_id'] => ['quantity' => $menu['quantity']]];
        });
        $sale->menus()->sync($menus);

        return response()->json([
            "success" => "Paiement mis à jour avec succès"
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $sale = Sales::findOrFail($id);
            $sale->menus()->detach();
            $sale->delete();

            $table = Table::find($sale->table_id);
            if ($table) {
                $table->status = true;
                $table->save();
            }

            return response()->json([
                "success" => "Vente supprimée avec succès",
            ]);
        } catch (\Exception $e) {
            Log::error('Error in destroy method:', ['error' => $e->getMessage()]);
            return response()->json(["error" => "Une erreur interne est survenue."], 500);
        }
    }
}