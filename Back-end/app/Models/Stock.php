<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    use HasFactory;
    protected $table = 'stocks';
    protected $primaryKey = 'id_stock';
    protected $fillable = ['id_stock',"nom_produit","nombre_produit",'quantite',"date_entree_stock", 'date_expiration',"prix_stock","id_fournisseur"];

    public function fournisseur(){
        return $this->belongsTo(Fournisseur::class, 'id_fournisseur');
    }

}
