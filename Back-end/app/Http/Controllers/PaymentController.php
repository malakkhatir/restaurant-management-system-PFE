<?php
namespace App\Http\Controllers;

use App\Models\Table;
use App\Models\Category;
use App\Models\Menu;
use App\Models\Servants;
use App\Models\Sales;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    // Récupérer les données nécessaires pour la page de paiement
    public function index()
{
    $tables = Table::where('status', 'disponible')->get();
    $categories = Category::with('menus')->get();
    $servants = Servants::all();

    \Log::info('Tables:', $tables->toArray());
    \Log::info('Categories:', $categories->toArray());
    \Log::info('Servants:', $servants->toArray());

    return response()->json([
        'tables' => $tables,
        'categories' => $categories,
        'servants' => $servants,
    ]);
}

    // Enregistrer une nouvelle vente
    public function store(Request $request)
    {
        $data = $request->validate([
            'table_id' => 'required|exists:tables,id',
            'servant_id' => 'required|exists:servants,id',
            'menu_id' => 'required|exists:menus,id',
            'quantity' => 'required|integer|min:1',
            'total_price' => 'required|numeric|min:0',
            'payment_type' => 'required|string',
            'payment_status' => 'required|string',
        ]);

        $sale = Sales::create($data);
        return response()->json($sale, 201);
    }
}