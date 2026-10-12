<?php

namespace App\Http\Controllers;

use Exception;
use App\Models\Sales;
use App\Models\Table;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use PDOException;

class TableController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
{
    try{
        $tables = Table::paginate(10); 
        if(!$tables){
            return response()->json(["message"=>"Tables non trouvées"],404);
        }else{
            return response()->json($tables);
        }
    }catch(PDOException $e){
        return response()->json(["message"=>"Erreur lors de la récupération des tables"],404);
    }
    catch(Exception $e){
        return response()->json(["message"=>"Erreur lors de la récupération des tables"],404);
    }
}

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try{
        $validated = $request->validate([
            'name' => 'required|string',
            'slug' => 'required|string|unique:tables,slug', // Ensure slugs are unique
            'status' => 'required|boolean',
        ]);
        try {
            $table = Table::create($validated);
            return response()->json($table, 201); // HTTP 201: Created
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create table'], 500);
        }
    }catch(PDOException $e){
        return response()->json(["message"=>"Erreur lors de la création de la table"],404);
    }
    catch(Exception $e){
        return response()->json(["message"=>"Erreur lors de la création de la table"],404);
    }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $table = Table::find($id);

            if ($table) {
                return response()->json($table, 200); // HTTP 200: OK
            } else {
                return response()->json(['error' => 'Table not found'], 404); // HTTP 404: Not found
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch the table'], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
{
    // Validation partielle : Accepter uniquement les champs envoyés
    $validated = $request->validate([
        'name' => 'nullable|string',  // Le nom est optionnel, vous pouvez choisir de ne pas le modifier
        'slug' => 'nullable|string|unique:tables,slug,' . $id,  // Assurez-vous que le slug est unique, mais autorisez sa mise à jour
        'status' => 'nullable|boolean', // Le statut est également optionnel
    ]);

    try {
        $table = Table::find($id);

        if ($table) {
            // Si le nom est fourni, mettez-le à jour
            if (isset($validated['name'])) {
                $table->name = $validated['name'];
            }

            // Si le slug est fourni et unique, mettez-le à jour
            if (isset($validated['slug'])) {
                $table->slug = $validated['slug'];
            }

            // Si le statut est fourni, mettez-le à jour
            if (isset($validated['status'])) {
                $table->status = $validated['status'];
            }

            $table->save(); // Sauvegarde des modifications

            return response()->json($table, 200); // HTTP 200: OK
        } else {
            return response()->json(['error' => 'Table not found'], 404); // HTTP 404: Not found
        }
    } catch (\Exception $e) {
        return response()->json(['error' => 'Failed to update table'], 500);
    }
}

    /**
     * Remove the specified resource from storage.
     */

     public function destroy($id)
     {
         try {
             $table = Table::find($id);
             $table->delete();
     
             return response()->json(['message' => 'Table supprimée avec succès']);
         } catch (QueryException $e) {
             return response()->json(['error' => 'Impossible de supprimer cette table. Elle est peut-être liée à d’autres données.'], 500);
         }
     }
     
    
    public function updateStatus(Request $request, $id)
{
    try {
        $table = Table::findOrFail($id); // Récupère la table par ID
        $table->status = $request->input('status'); // Met à jour le statut (par exemple 'disponible')
        $table->save(); // Sauvegarde la modification
        return response()->json(['message' => 'Statut mis à jour avec succès'], 200);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}


}
