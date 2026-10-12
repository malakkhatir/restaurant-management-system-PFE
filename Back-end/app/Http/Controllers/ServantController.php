<?php

namespace App\Http\Controllers;

use Exception;
use App\Models\Servants;
use Illuminate\Http\Request;
use PDOException;

class ServantController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Servants::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try{
        $servant=$request->validate([
            'cin' => 'required|string',
            'name' => 'required|string',
            'email' => 'required|email',
            'phone' => 'required|string',
            'address' => 'required|string',
            'password' => 'required|string',
        ]);
        $servant['password'] = bcrypt($servant['password']); // Hash the password
        
        if(!$servant){
            return response()->json(["message"=>"Serveur non créé"],404);
        }else{
            return Servants::create($servant);
        }
    }catch(PDOException $e){
        return response()->json(["message"=>"Erreur lors de la création du serveur"],404);
    }
    catch(Exception $e){
        return response()->json(["message"=>"Erreur lors de la création du serveur"],404);
    }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try{
        return Servants::find($id);
    }catch(PDOException $e){
        return response()->json(["message"=>"Erreur lors de la récupération du serveur"],404);
    }
    catch(Exception $e){
        return response()->json(["message"=>"Erreur lors de la récupération du serveur"],404);
    }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try{
        $servant = $request->validate([
            'name' => 'required|string',
           
        ]);
    
        $updatedServant = Servants::find($id);
        $updatedServant->update($servant);
    
        return response()->json($updatedServant, 200);
    }catch(PDOException $e){
        return response()->json(["message"=>"Erreur lors de la mise à jour du serveur"],404);
    }
    catch(Exception $e){
        return response()->json(["message"=>"Erreur lors de la mise à jour du serveur"],404);
    }
    }
    

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try{
        return Servants::destroy($id);
    }catch(PDOException $e){
        return response()->json(["message"=>"Erreur lors de la suppression du serveur"],404);
    }
    catch(Exception $e){
        return response()->json(["message"=>"Erreur lors de la suppression du serveur"],404);
    }
    }
}
