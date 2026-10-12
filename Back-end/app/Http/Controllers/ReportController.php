<?php

namespace App\Http\Controllers;

use App\Models\Sales;
use Exception;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\SalesExport;
use PDOException;

class ReportController extends Controller
{
    public function getSales(Request $request)
    {
        try{
        // Validation des dates
        $validated = $request->validate([
            'from' => 'required|date',
            'to' => 'required|date|after_or_equal:from',
        ]);
    
        // Récupérer les ventes entre les dates et avec payment_status = 'paye'
        $sales = Sales::with(['table', 'servant'])
            ->whereBetween('created_at', [$request->from, $request->to])
            ->where('payment_status', 'paye')
            ->get();
    
        return response()->json([
            'sales' => $sales->map(function ($sale) {
                return [
                    'id' => $sale->id,
                    'created_at' => $sale->created_at,
                    'total_price' => $sale->total_price,
                    'table_name' => $sale->table ? $sale->table->name : 'N/A', // Utilisation de la relation table
                    'servant_name' => $sale->servant ? $sale->servant->name : 'N/A', // Utilisation de la relation servant
                ];
            })
        ]);
    }catch(PDOException $e){
        return response()->json(["message"=>"Erreur lors de la récupération des ventes"],404);
    }
    catch(Exception $e){
        return response()->json(["message"=>"Erreur lors de la récupération des ventes"],404);
    }
    }
    

public function exportSales(Request $request)
{
    try{
    $validated = $request->validate([
        'from' => 'required|date',
        'to' => 'required|date|after_or_equal:from',
    ]);

    \Log::info('Export sales from: ' . $validated['from'] . ' to: ' . $validated['to']);
    return Excel::download(new SalesExport($validated['from'], $validated['to']), 'sales_report.xlsx');
}catch(PDOException $e){
    return response()->json(["message"=>"Erreur lors de l'exportation des ventes"],404);
}
catch(Exception $e){
    return response()->json(["message"=>"Erreur lors de l'exportation des ventes"],404);
}
}
}
