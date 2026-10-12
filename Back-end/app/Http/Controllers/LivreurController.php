<?php

namespace App\Http\Controllers;

use App\Models\Livreur;
use Illuminate\Http\Request;

class LivreurController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $livreurs = Livreur::all();
        return response()->json($livreurs);
    }

    public function store(Request $request)
    {
        $livreur=$request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'cin' => 'required|string|max:20|unique:livreurs,cin',
            'email' => 'required|email|unique:livreurs,email',
            'telephone' => 'required|string|max:15|unique:livreurs,telephone',
            'adresse' => 'required|string|max:255',
            'ville' => 'required|string|max:100',
            'code_postal' => 'required|digits_between:4,10',
            'pays' => 'required|string|max:100',
            'status' => 'required|string|in:actif,inactif',
            'password' => 'required|string|min:8|confirmed',
        ],
        [
            'cin.unique' => 'Le CIN doit être unique.',
            'email.unique' => 'L\'email doit être unique.',
            'telephone.unique' => 'Le numéro de téléphone doit être unique.',
            'password.confirmed' => 'La confirmation du mot de passe ne correspond pas.'
        ]);
        $livreur['password'] = bcrypt($livreur['password']); // Hash the password
        Livreur::create($livreur);
        return response()->json(['message' => 'Livreur created successfully'], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $livreur = Livreur::findOrFail($id);
        return response()->json($livreur);
    }



    /**
     * Update the specified resource in storage.
     */
public function update(Request $request, $id)
{
    $livreur = Livreur::findOrFail($id);

    $validated = $request->validate([
        'nom' => 'required|string|max:255',
        'prenom' => 'required|string|max:255',
        'cin' => 'required|string|max:20|unique:livreurs,cin,' . $id . ",id_livreur",
        'email' => 'required|email|unique:livreurs,email,' . $id . ",id_livreur",
        'telephone' => 'required|string|max:15|unique:livreurs,telephone,'. $id.",id_livreur",
        'adresse' => 'required|string|max:255',
        'ville' => 'required|string|max:100',
        'code_postal' => 'required|digits_between:4,10',
        'pays' => 'required|string|max:100',
        'status' => 'required|string|in:actif,inactif',
        'password' => 'nullable|string|min:8|confirmed'
    ], [
        'cin.unique' => 'Le CIN doit être unique.',
        'email.unique' => 'L\'email doit être unique.',
        'telephone.unique' => 'Le numéro de téléphone doit être unique.',
        'password.confirmed' => 'La confirmation du mot de passe ne correspond pas.'
    ]);

    if (!empty($validated['password'])) {
        $validated['password'] = bcrypt($validated['password']);
    } else {
        unset($validated['password']); // ne pas écraser l'ancien mot de passe
    }

    $livreur->update($validated);

    return response()->json(['message' => 'Livreur mis à jour avec succès'], 200);
}


    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        Livreur::destroy($id);
        return response()->json(['message' => 'Livreur deleted successfully'], 200);
         
    }
    public function getLivreurActif()
    {
        $livreur = Livreur::where('status', 'actif')->get();
        return response()->json($livreur);
    }
    public function updateStatus(Request $request, $id)
    {
        $livreur = Livreur::findOrFail($id);
        $validated = $request->validate([
            'status' => 'required|string|in:actif,inactif',
        ]);
        $livreur->update($validated);
        return response()->json(['message' => 'Status updated successfully'], 200);
    }
    public function updateProfile(Request $request, $id)
    {
        $livreur = Livreur::findOrFail($id);
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|email|unique:livreurs,email,' . $id . ",id_livreur",
            'telephone' => 'required|string|max:15|unique:livreurs,telephone,'. $id.",id_livreur",
            'adresse' => 'required|string|max:255',
            'ville' => 'required|string|max:100',
            'code_postal' => 'required|digits_between:4,10',
            'pays' => 'required|string|max:100',
            'password' => 'nullable|string|min:8|confirmed'
        ], [
            'email.unique' => 'L\'email doit être unique.',
            'telephone.unique' => 'Le numéro de téléphone doit être unique.',
            'password.confirmed' => 'La confirmation du mot de passe ne correspond pas.'
        ]);
        $livreur->update($validated);
        return response()->json(['message' => 'Profile updated successfully'], 200);
    }
    public function getstatus($id)
    {
        $livreur = Livreur::findOrFail($id);
        return response()->json(['status' => $livreur->status], 200);
    }
}
