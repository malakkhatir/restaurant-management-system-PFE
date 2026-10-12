<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    use HasFactory;
    protected $fillable = [
        'title','slug','description','image','price','category_id'
    ];
    public function Category(){
        return $this->belongsTo(Category::class,'category_id','id');
    }
    public function getRouteKeyName(){
        return 'slug';
    }
    public function sales(){
        return $this->hasMany(Sales::class);
    }
}
