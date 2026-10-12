<?php

namespace App\Http\Controllers;

use App\Models\Reclamation;
use Exception;
use Illuminate\Http\Request;
use PDOException;

class ReclamationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $reclamations = Reclamation::with("user")->get();
        return response()->json($reclamations);
    }

    /**
     * Show the form for creating a new resource.
     */

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $reclamation=$request->validate([
            "message"=>"required|string",
            "id_user"=>"required|exists:users,id",
        ]);
        $reclamation=Reclamation::create($reclamation);
        return response()->json(["message"=>"Reclamation created successfully"]);
    }

    /**
     * Display the specified resource.
     */


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        try{
        $reclamations=Reclamation::find($id);
        if(!$reclamations){
            return response()->json(["message"=>"Reclamation not found"],404);
        }else{
            $reclamation=$request->validate([
                "message"=>"required|string",
                "id_user"=>"required|exists:users,id",
            ]);
            $reclamations->update($reclamation);
            return response()->json(["message"=>"Reclamation updated successfully","reclamation"=>$reclamations]);
        }
    }catch(PDOException $e){
        return response()->json(["message"=>"Erreur lors de la mise à jour de la reclamation"],404);
    }
    catch(Exception $e){
        return response()->json(["message"=>"Erreur lors de la mise à jour de la reclamation"],404);
    }
        
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Reclamation $reclamation,$id)
    {
     try{
        $reclamations=Reclamation::find($id);
        if(!$reclamations){
            return response()->json(["message"=>"Reclamation not found"],404);
        }else{
            $reclamations->delete();
            return response()->json(["message"=>"Reclamation deleted successfully"]);
        }
     }catch(PDOException $e){
        return response()->json(["message"=>"Erreur lors de la suppression de la reclamation"],404);
    }
     catch(Exception $e){
        return response()->json(["message"=>"Erreur lors de la suppression de la reclamation"],404);
    }
    }
    public function getreclamationUser(Request $request,$id){
        $reclamation=Reclamation::where("id_user",$id)->get();
        if(!$reclamation){
            return response()->json(["message"=> "non trouver pas des reclamations"],404);
        }else{
            return response()->json($reclamation,200);
        }
    }

}
