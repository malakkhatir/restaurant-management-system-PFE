<?php

namespace App\Models;

use Illuminate\Auth\Authenticatable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class Livreur extends Model implements AuthenticatableContract
{
     use HasFactory, Authenticatable,HasApiTokens;

    protected $table = 'livreurs';
    protected $primaryKey = 'id_livreur';
    protected $fillable = [
        'nom',
        'prenom',
        "cin",
        'email',
        'telephone',
        'adresse',
        'ville',
        'code_postal',
        'pays',
        'status',
        "password"
    ];
       protected $hidden = [
        'password',
        'remember_token',
    ];
    public function livrisons()
    {
        return $this->hasMany(Livrison::class, 'id_livreur', 'id_livreur');
    }
}
