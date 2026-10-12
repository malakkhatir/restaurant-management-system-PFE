<?php

namespace App\Http\Controllers;

use Exception;
use App\Models\Stock;
use Illuminate\Http\Request;
use PDOException;

class StockController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try{
            $stocks = Stock::with('fournisseur')->get();
            return response()->json($stocks);
        }catch(PDOException $e){
            return response()->json(["message"=>"Erreur lors de la récupération des stocks"],404);
        }
        catch(Exception $e){
            return response()->json(["message"=>"Erreur lors de la récupération des stocks"],404);
        }
    }

 

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
      
        $stock=$request->validate([
            'nom_produit'=>'required|string|max:255',
            'nombre_produit'=>'required|integer',
            'quantite'=>'required|integer',
            'date_entree_stock'=>'required|date|before:date_expiration',
            'date_expiration'=>'required|date|after:date_entree_stock',
            'prix_stock'=>'required|numeric',
            'id_fournisseur'=>'required|exists:fournisseurs,id_fournisseur',
        ],[
            'nom_produit.required'=>'Le nom du produit est obligatoire',
            'nombre_produit.required'=>'Le nombre de produit est obligatoire',
            'quantite.required'=>'La quantité est obligatoire',
            'prix_stock.required'=>'Le prix du stock est obligatoire',
            'fournisseur_id.required'=>'Le fournisseur est obligatoire',
            'fournisseur_id.exists'=>'Le fournisseur doit être un fournisseur existant',
            'nombre_produit.integer'=>'Le nombre de produit doit être un nombre entier',
            'quantite.integer'=>'La quantité doit être un nombre entier',
            'prix_stock.numeric'=>'Le prix du stock doit être un nombre',
            'date_expiration.after'=>'La date d\'expiration doit être après la date d\'entrée',
            'date_entree_stock.before'=>'La date d\'entrée doit être avant la date d\'expiration',
        ]);
        if(!$stock){
            return response()->json(["message"=>"Stock non créé"],404);
        }else{
            Stock::create($stock);
            return response()->json(['message'=>'Stock ajouté avec succès','stock'=>$stock]);
        }
    
    }

    /**
     * Display the specified resource.
     */
    public function show(Stock $stock,$id)
    {
        try{
            $stock=Stock::with("Fournisseur")->find($id);
            if(!$stock){
                return response()->json(["message"=>"Stock non trouvé"],404);
            }else{
                return response()->json($stock);
            }
        }catch(PDOException $e){
            return response()->json(["message"=>"Erreur lors de la récupération du stock"],404);
        }
        catch(Exception $e){
            return response()->json(["message"=>"Erreur lors de la récupération du stock"],404);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request,$id)
    {
        try{
        $stocks=Stock::findOrFail($id);
        if(!$stocks){
            return response()->json(["message"=>"Stock non trouvé"],404);
        }else{
        $stock=$request->validate([
            'nom_produit'=>'required|string|max:255',
            'nombre_produit'=>'required|integer',
            'quantite'=>'required|integer',
            'date_entree_stock'=>'required|date|before:date_expiration',
            'date_expiration'=>'required|date|after:date_entree_stock',
            'prix_stock'=>'required|numeric',
            'id_fournisseur'=>'required|exists:fournisseurs,id_fournisseur',
        ],[
            'nom_produit.required'=>'Le nom du produit est obligatoire',
            'nombre_produit.required'=>'Le nombre de produit est obligatoire',
            'quantite.required'=>'La quantité est obligatoire',
            'prix_stock.required'=>'Le prix du stock est obligatoire',
            'fournisseur_id.required'=>'Le fournisseur est obligatoire',
            'fournisseur_id.exists'=>'Le fournisseur doit être un fournisseur existant',
            'nombre_produit.integer'=>'Le nombre de produit doit être un nombre entier',
            'quantite.integer'=>'La quantité doit être un nombre entier',
            'prix_stock.numeric'=>'Le prix du stock doit être un nombre',
            'date_expiration.after'=>'La date d\'expiration doit être après la date d\'entrée',
            'date_entree_stock.before'=>'La date d\'entrée doit être avant la date d\'expiration',
        ]);
            $stocks->update($stock);
            return response()->json(['message'=>'Stock modifié avec succès','stock'=>$stock]);
        }
    }catch(PDOException $e){
        return response()->json(["message"=>"Erreur lors de la mise à jour du stock"],404);
    }
    catch(Exception $e){
        return response()->json(["message"=>"Erreur lors de la mise à jour du stock"],404);
    }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Stock $stock,$id)
    {
        try{
        $stock = Stock::findOrFail($id);
        if(!$stock){
            return response()->json(["message"=>"Stock non trouvé"],404);
        }else{
            $stock->delete();
            return response()->json(['message' => 'Stock supprimé avec succès']);
        }
    }catch(PDOException $e){
        return response()->json(["message"=>"Erreur lors de la suppression du stock"],404);
    }
    catch(Exception $e){
        return response()->json(["message"=>"Erreur lors de la suppression du stock"],404);
    }
    }
}
