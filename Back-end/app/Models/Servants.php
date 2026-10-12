<?php

namespace App\Models;

use Illuminate\Auth\Authenticatable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class Servants extends Model implements AuthenticatableContract
{
    use HasFactory, Authenticatable,HasApiTokens;
    protected $table = 'servants';
    protected $primaryKey = 'id';
    protected $fillable = ["cin", "name", "email", "phone", "address", "password"];
    // Make sure this relationship is correctly referencing the Sales model
           protected $hidden = [
        'password',
        'remember_token',
    ];
    public function sales()
    {
        return $this->hasMany(Sales::class, 'servant_id');
    }
}