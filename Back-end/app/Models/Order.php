<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;
    protected $table="orders";
    protected $primaryKey="id_order";
    protected $fillable=["total_price","status","payment_method","id_user","menu"];
    public function User(){
        return $this->belongsTo(User::class,"id_user","id");
    }
    public function Livrison(){
        return $this->hasMany(Livrison::class,"id_order","id_order");
    }
}
