<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Livreur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Servants; // Ajoute ce use si ce n’est pas fait
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
public function login(Request $request)
{
    $credentials = $request->validate([
        'email' => ['required', 'email'],
        'password' => ['required', 'string'],
    ]);

    // Vérifier si l'email existe dans la table users
    if (Auth::attempt($credentials)) {
        $request->session()->regenerate();
        $user = Auth::user();
        return response()->json([
            'message' => 'Connexion réussie',
            'user' => $user,
            'token' => csrf_token(),
        ], 200);
    }

    // Vérifier dans la table servants manuellement
    $servant = Servants::where('email', $credentials['email'])->first();

    if ($servant && Hash::check($credentials['password'], $servant->password)) {
        auth('servants')->login($servant);
    $token = $servant->createToken('livreur-token')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie',
            'user' => [
                'id' => $servant->id,
                'name' => $servant->name,
                'email' => $servant->email,
                'role' => 'servant',
            ],
            'token' => $token,
        ], 200);
    }
    $livreurs = Livreur::where('email', $credentials['email'])->first();

if ($livreurs && Hash::check($credentials['password'], $livreurs->password)) {
    // PAS besoin de auth()->guard()->login()
    $token = $livreurs->createToken('livreur-token')->plainTextToken;

    return response()->json([
        'message' => 'Connexion réussie',
        'user' => [
            'id' => $livreurs->id_livreur,
            'name' => $livreurs->nom . ' ' . $livreurs->prenom,
            'email' => $livreurs->email,
            'role' => 'livreur',
        ],
        'token' => $token,
    ], 200);
}

    // Authentification échouée
    throw ValidationException::withMessages([
        'email' => ['Les identifiants fournis sont incorrects.'],
    ]);
}

    public function register(Request $request)
    {
        // Valider les données de la requête
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'confirmed', 'min:8'],
        ]);

        // Créer un nouvel utilisateur
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => 'client',
        ]);

        // Authentifier l'utilisateur
        Auth::login($user);

        // Retourner une réponse avec un token ou une session active
        return response()->json([
            'message' => 'Inscription réussie',
            'user' => $user,
            'token' => csrf_token(), // ou un token JWT si vous en utilisez un
        ], 201);
    }
}