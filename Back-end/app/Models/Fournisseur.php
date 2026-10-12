<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Fournisseur extends Model
{
    use HasFactory;
    protected $table = 'fournisseurs';
    protected $primaryKey = 'id_fournisseur';
    protected $fillable = ['nom',"prenom","cin", 'adresse', 'telephone', 'email'];

    public function stock(){
        return $this->hasMany(Stock::class, 'id_fournisseur');
    }

}
