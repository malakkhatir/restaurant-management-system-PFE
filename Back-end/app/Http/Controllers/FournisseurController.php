<?php

namespace App\Http\Controllers;

use App\Models\Fournisseur;
use App\Models\Stock;
use Exception;
use Illuminate\Http\Request;
use PDOException;

class FournisseurController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try{
            $fournisseurs = Fournisseur::with('Stock')->get();
            if(!$fournisseurs){
                return response()->json(["message"=>"Fournisseurs not found"],404);
            }else{
                return response()->json($fournisseurs);
            }
        }catch(PDOException $e){
            return response()->json(["message"=>"Erreur lors de la récupération des fournisseurs"],404);
        }
        catch(Exception $e){
            return response()->json(["message"=>"Erreur lors de la récupération des fournisseurs"],404);
        }
    }

    /**
     * Show the form for creating a new resource.
     */

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $fournisseur=$request->validate([
            "nom"=>"required|string",
            "prenom"=>"required|string",
            "cin"=>"required|string",
            "adresse"=>"required|string",
            "telephone"=>"required|string",
            "email"=>"required|email|unique:fournisseurs,email",
        ]);
        $fournisseur=Fournisseur::create($fournisseur);
        return response()->json(["message"=>"Fournisseur created successfully"]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Fournisseur $fournisseur,$id  )
    {
        try{
            $stock=Stock::where("id_fournisseur", $id)->get ();  
            $fournisseurs=Fournisseur::find($id);
            if(!$fournisseurs){
                return response()->json(["message"=>"Fournisseur not found"],404);
            }else{
                return response()->json([$stock, $fournisseurs]);
            }
        }catch(PDOException $e){
            return response()->json(["message"=>"Erreur lors de la récupération du fournisseur"],404);
        }
        catch(Exception $e){
            return response()->json(["message"=>"Erreur lors de la récupération du fournisseur"],404);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        try{
        $fournisseurs=Fournisseur::find($id);
        $fournisseur=$request->validate([
            "nom"=>"required|string",
            "prenom"=>"required|string",
            "cin"=>"required|string",
            "adresse"=>"required|string",
            "telephone"=>"required|string",
            "email"=>"required|email|unique:fournisseurs,email,".$id.",id_fournisseur",
        ]);
        $fournisseurs->update($fournisseur);
        return response()->json($fournisseur);
        }catch(PDOException $e){
            return response()->json(["message"=>"Erreur lors de la mise à jour du fournisseur"],404);
        }
        catch(Exception $e){
            return response()->json(["message"=>"Erreur lors de la mise à jour du fournisseur"],404);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Fournisseur $fournisseur,$id)
    {
        try{
            $fournisseurs=Fournisseur::find($id);
            $fournisseurs->delete();
            return response()->json(["message"=>"Fournisseur deleted successfully"]);
        }catch(PDOException $e){
            return response()->json(["message"=>"Erreur lors de la suppression du fournisseur"],404);
        }
        catch(Exception $e){
            return response()->json(["message"=>"Erreur lors de la suppression du fournisseur"],404);
        }
    }
}
