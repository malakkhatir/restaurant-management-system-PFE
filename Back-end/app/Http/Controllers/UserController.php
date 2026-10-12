<?php

namespace App\Http\Controllers;

use Exception;
use App\Models\User;
use Illuminate\Http\Request;
use PDOException;

class UserController extends Controller
{
    public function getTotalWorkers()
    {
        try{
            $totalWorkers = User::where('role', 'client')->count();
            if(!$totalWorkers){
                return response()->json(["message"=>"Utilisateurs non trouvés"],404);
            }else{
                return response()->json(['total_workers' => $totalWorkers]);
            }
        }catch(PDOException $e){
            return response()->json(["message"=>"Erreur lors de la récupération des utilisateurs"],404);
        }
        catch(Exception $e){
            return response()->json(["message"=>"Erreur lors de la récupération des utilisateurs"],404);
        }
    }
    public function update(Request $request, $id){
        try{
        $user = User::find($id);
        if(!$user){
            return response()->json(["message"=>"Utilisateur non trouvé"],404);
        }else{
        $users=$request->validate([
            "name" => "required|string",
            "num" => "required|numeric",
            "address" => "nullable|string",
            "email" => "required|email|unique:users,email," . $id,
            "image" => "nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048",
        ]);
        if ($request->hasFile('image')) {
            $image = $request->file('image')->store('profileAdmin', 'public');
            $users['image'] = $image;
        }
            $user->update($users);
            return response()->json(['message'=>'User updated successfully']);
        }
        }catch(PDOException $e){
            return response()->json(["message"=>"Erreur lors de la mise à jour de l'utilisateur"],404);
        }
        catch(Exception $e){
            return response()->json(["message"=>"Erreur lors de la mise à jour de l'utilisateur"],404);
        }
    }
    public function updateClient(Request $request, $id)
    {
        $user = User::where("role", "client")->find($id);
    
        if (!$user) {
            return response()->json(["message" => "non trouvée"], 404);
        }
    
        $validated = $request->validate([
            "name" => "required|string",
            "num" => "required|numeric",
            "address" => "nullable|string",
            "email" => "required|email|unique:users,email," . $id,
        ]);
    
        $user->update($validated);
    
        return response()->json(["message" => "Mise à jour avec succès"]);
    }
    public function getclient($id){
        $user= User::where("role", "client")->find($id);
        if(!$user) {
            return response()->json(["message"=> "non trouvée"],404);
        }else{
            return response()->json($user);
        }
    }
    public function admincontact(){
        $users = User::where("role", "admin")->select("email","num","name")->get();
        if($users->isEmpty()){
            return response()->json(["message"=>"Aucun utilisateur trouvé"],404);
        }else{
            return response()->json($users);
        }
    }
}