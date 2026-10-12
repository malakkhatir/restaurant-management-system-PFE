<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Menu;
use Exception;
use Illuminate\Http\Request;
use PDOException;

class MenuController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try{
        // Récupérer l'ID de la catégorie depuis la requête
        $categoryId = $request->query('category_id');
    
        // Filtrer les menus par ID de catégorie
        if ($categoryId) {
            $menus = Menu::with("category")->paginate(7);
        } else {
            $menus = Menu::with("category")->paginate(7);
        }
    
        // Récupérer toutes les catégories
        $categories = Category::all();
    
        return response()->json([
            'menus' => $menus,
            'categories' => $categories
        ]);
    }catch(PDOException $e){
        return response()->json(["message"=>"Erreur lors de la récupération des menus"],404);
    }
    catch(Exception $e){
        return response()->json(["message"=>"Erreur lors de la récupération des menus"],404);
    }
    }
    public function getMenuByCategory(Request $request){
        try{
            $menus = Category::with("menus")->get();
            return response()->json($menus);
        }catch(PDOException $e){
            return response()->json(['message'=> 'Errors Serveur'],404);
        }
        catch(Exception $e){
            return response()->json(['message'=> 'Errors Serveur'],404);
        }
    }
    public function index2(Request $request){
        try{
            // Récupérer l'ID de la catégorie depuis la requête
        $categoryId = $request->query('category_id');
    
        // Filtrer les menus par ID de catégorie
        if ($categoryId) {
            $menus = Menu::where('category_id', $categoryId)->get();
        } else {
            $menus = Menu::all();
        }
    
        // Récupérer toutes les catégories
        $categories = Category::all();
    
        return response()->json([
            'menus' => $menus,
            'categories' => $categories
        ]);
    }catch(PDOException $e){
        return response()->json(['message'=> 'Errors servrue'],404);
    }
}

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try{
        $menu=$request->validate([
            'title' => 'required|string|unique:menus,title',
            'slug' => 'required|string',
            'description' => 'required|string',
            'price' => 'required|numeric',
            'image' => 'required|image|mimes:jpg,png,jpeg|max:2048',
            'category_id' => 'required|numeric',
        ]);
        $fileNameImage=$request->file('image')->store('ImageMenus',"public");
        $menu['image']=$fileNameImage;
        Menu::create($menu);
         return response()->json([
            'success'=>'menu bien cree'
         ]);
    }catch(PDOException $e){
        return response()->json(["message"=>"Erreur lors de la création du menu"],404);
    }
    catch(Exception $e){
        return response()->json(["message"=>"Erreur lors de la création du menu"],404);
    }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try{
            return Menu::find($id);
        }catch(PDOException $e){
            return response()->json(["message"=>"Erreur lors de la récupération du menu"],404);
        }
        catch(Exception $e){
            return response()->json(["message"=>"Erreur lors de la récupération du menu"],404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try{
        // Validation des données
        $validatedData = $request->validate([
            'title' => 'required|string|unique:menus,title,' . $id,
            'slug' => 'required|string',
            'description' => 'required|string',
            'price' => 'required|numeric',
            'category_id' => 'required|numeric',
            'image' => 'nullable|image|mimes:jpg,png,jpeg|max:2048',
        ]);
    
        // Récupération du menu à mettre à jour
        $menu = Menu::find($id);
        if (!$menu) {
            return response()->json(['error' => 'Menu non trouvé'], 404);
        }
    
        // Mise à jour des champs
        $menu->title = $validatedData['title'];
        $menu->slug = $validatedData['slug'];
        $menu->description = $validatedData['description'];
        $menu->price = $validatedData['price'];
        $menu->category_id = $validatedData['category_id'];
    
        // Gestion de l'image
        if ($request->hasFile('image')) {
            $fileNameImage = $request->file('image')->store('ImageMenus', 'public');
            $menu->image = $fileNameImage;
        }
    
        // Sauvegarde des modifications
        $menu->save();
    
        return response()->json(['success' => 'Menu bien modifié']);
    }catch(PDOException $e){
        return response()->json(["message"=>"Erreur lors de la mise à jour du menu"],404);
    }
    catch(Exception $e){
        return response()->json(["message"=>"Erreur lors de la mise à jour du menu"],404);
    }
    }
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try{
         Menu::destroy($id);
         return response()->json([
            'success'=>'menu bien supprimer '
         ]);
    }
    catch(PDOException $e){
        return response()->json(['message'=> 'Errors Serveur'],404);
    }
}

        
}
