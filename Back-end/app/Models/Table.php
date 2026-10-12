<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Table extends Model
{
    use HasFactory;
    protected $fillable = ["name","status","slug"];
    public function getRouteKeyName(){
        return "slug";
    }
    public function sales()
    {
        return $this->hasMany(Sales::class);
    }
    public function reservation(){
        return $this->hasMany(Reservation::class,"id_table","id");
    }
}

