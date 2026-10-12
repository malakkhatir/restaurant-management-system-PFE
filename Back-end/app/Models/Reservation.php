<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;
    protected $table="reservations";
    protected $primaryKey="id_reservation";
    protected $fillable=["id_user","id_table","date","time","menu","payment","status"];
    public function table(){
        return $this->belongsTo(Table::class,"id_table","id");
    }
    public function User(){
        return $this->belongsTo(User::class,"id_user","id_reservation");
    }
}
