<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;
    protected $fillable = [
        'title','slug'
    ];
    public function menus(){
        return $this->hasMany(Menu::class,"category_id","id");
    }
}
