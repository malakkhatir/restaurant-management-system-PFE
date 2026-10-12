<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Livrison extends Model
{
    use HasFactory;
    protected $table = 'livrisons';
    protected $primaryKey = 'id_livrison';
    protected $fillable = [
        'id_livreur',
        'id_order',
        "id_user",
        'date_livrison',
        'status',
        'address',
        ];
    public function livreur()
    {
        return $this->belongsTo(Livreur::class, 'id_livreur', 'id_livreur');
    }
    public function Orders()
    {
        return $this->belongsTo(Order::class, 'id_order', 'id_order');
    }
    public function user()
    {
        return $this->belongsTo(User::class, 'id_user', 'id');
    }
}
