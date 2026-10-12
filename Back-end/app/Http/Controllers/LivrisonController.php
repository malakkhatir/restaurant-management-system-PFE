<?php

namespace App\Http\Controllers;

use App\Models\Livrison;
use Illuminate\Http\Request;

class LivrisonController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $livrisons = Livrison::with(['livreur', 'Orders', 'user'])->paginate(7);
        return response()->json($livrisons);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $livrison = $request->validate([
            'id_livreur' => 'required|exists:livreurs,id_livreur',
            'id_order' => 'required|exists:orders,id_order',
            'id_user' => 'required|exists:users,id',
            'date_livrison' => 'required|date',
            'status' => 'required|string|max:50',
            'address' => 'required|string|max:255',
        ],
        [
            'id_livreur.required' => 'Le livreur est requis.',
            'id_order.required' => 'La commande est requise.',
            'id_user.required' => 'L\'utilisateur est requis.',
            'date_livrison.required' => 'La date de livraison est requise.',
            'status.required' => 'Le statut est requis.',
            'address.required' => 'L\'adresse est requise.',
        ]);

        Livrison::create($livrison);
        return response()->json(['message' => 'Livraison created successfully'], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $livrison = Livrison::with(['livreur', 'Orders', 'user'])->findOrFail($id);
        return response()->json($livrison);
    }


    /**
     * Update the specified resource in storage.
     */
public function update(Request $request, $id)
{
    $validatedData = $request->validate([
        'id_livreur' => 'required|exists:livreurs,id_livreur',
        'date_livrison' => 'required|date',
        'address' => 'required|string|max:255',
    ],
    [
        'id_livreur.required' => 'Le livreur est requis.',
        'date_livrison.required' => 'La date de livraison est requise.',
        'address.required' => 'L\'adresse est requise.',
        'address.max' => 'L\'adresse ne peut pas dépasser 255 caractères.',
        'date_livrison.date' => 'La date de livraison doit être une date valide.',
    ]);
    $livrison = Livrison::findOrFail($id);
    $livrison->update($validatedData);
    return response()->json(['message' => 'Livraison mise à jour avec succès'], 200);
}


    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        Livrison::destroy($id);
        return response()->json(['message' => 'Livraison deleted successfully'], 200);
    }
    public function getLivrisonByLivreur($id)
    {
        $livrisons = Livrison::where('id_livreur', $id)->with(['Orders', 'user'])->get();
        if ($livrisons->isEmpty()) {
            return response()->json(['message' => 'Aucune livraison trouvée pour ce livreur'], 404);
        }
        return response()->json($livrisons);
    }
    public function updateStatuslivrison(Request $request, $id)
    {
        $livrison = Livrison::findOrFail($id);
        $validatedData = $request->validate([
            'status' => 'required|string|max:50',
        ],
        [
            'status.required' => 'Le statut est requis.',
            'status.max' => 'Le statut ne peut pas dépasser 50 caractères.',
        ]);
        $livrison->update($validatedData);
        return response()->json(['message' => 'Statut de livraison mis à jour avec succès'], 200);
    }
    public function gethistorylivrisonbylivreur($id){
        $livrisons= Livrison::where('id_livreur', $id)
            ->with(['Orders', 'user'])
            ->where('status', "annulee")
            ->orWhere('status', "livree")
            ->get();
        if ($livrisons->isEmpty()) {
            return response()->json(['message' => 'Aucune livraison trouvée pour ce livreur'], 404);
        }
        return response()->json($livrisons);
    }
}
