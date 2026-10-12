<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Exception;
use Illuminate\Http\Request;
use PDOException;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
{
    try{
        return Category::paginate(10); // 10 catégories par page
    }catch(PDOException $e){
        return response()->json(["message"=>"Erreur lors de la récupération des catégories"],404);
    }
    catch(Exception $e){
        return response()->json(["message"=>"Erreur lors de la récupération des catégories"],404);
    }
}


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try{
        $category=$request->validate([
            'title' => 'required|string',
            'slug' => 'required|string',
        ]);
        return Category::create($category);
    }catch(PDOException $e){
        return response()->json(["message"=>"Erreur lors de la création de la catégorie"],404);
    }
    catch(Exception $e){
        return response()->json(["message"=>"Erreur lors de la création de la catégorie"],404);
    }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try{
        $category = Category::find($id);
    
        if (!$category) {
            return response()->json(['message' => 'Catégorie introuvable'], 404);
        }
    
        return response()->json($category, 200);
    }catch(PDOException $e){
        return response()->json(["message"=>"Erreur lors de la récupération de la catégorie"],404);
    }
    catch(Exception $e){
        return response()->json(["message"=>"Erreur lors de la récupération de la catégorie"],404);
    }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try{
        $categoryData = $request->validate([
            'title' => 'required|string',
            'slug' => 'required|string',
        ]);
    
        $category = Category::find($id);
        if (!$category) {
            return response()->json(['message' => 'Catégorie introuvable'], 404);
        }
    
        $category->update($categoryData);
    
        return response()->json($category, 200); // Return the updated category object
    }catch(PDOException $e){
        return response()->json(["message"=>"Erreur lors de la mise à jour de la catégorie"],404);
    }
    catch(Exception $e){
        return response()->json(["message"=>"Erreur lors de la mise à jour de la catégorie"],404);
    }
    }
    
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
{
    try{
    $deleted = Category::destroy($id);

    if ($deleted === 0) {
        return response()->json(['message' => 'Catégorie introuvable'], 404);
    }

    return response()->json(['message' => 'Catégorie supprimée avec succès'], 200);
    }catch(PDOException $e){
        return response()->json(["message"=>"Erreur lors de la suppression de la catégorie"],404);
    }
    catch(Exception $e){
        return response()->json(["message"=>"Erreur lors de la suppression de la catégorie"],404);
    }
}
}
