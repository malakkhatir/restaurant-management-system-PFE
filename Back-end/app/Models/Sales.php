<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sales extends Model
{
    protected $fillable = [
        'table_id', 'servant_id', 'quantity', 'total_price',
        'payment_type', 'payment_status'
    ];

    public function table()
    {
        return $this->belongsTo(Table::class);
    }

    public function servant()
    {
        return $this->belongsTo(Servants::class, 'servant_id');
    }
    
    public function menus()
{
    return $this->belongsToMany(Menu::class, 'menu_sales', 'sale_id', 'menu_id')
                ->withPivot('quantity') // Ajoutez la colonne pivot pour gérer la quantité
                ->withTimestamps();    // Ajoutez les timestamps si nécessaire
}

    
}