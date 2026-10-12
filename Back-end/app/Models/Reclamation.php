<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reclamation extends Model
{
    use HasFactory;
    protected $table = "reclamations";
    protected $primaryKey = "id_reclamation";
    protected $fillable = ["message", "id_user"];

    public function user()
    {
        return $this->belongsTo(User::class, "id_user");
    }
}
