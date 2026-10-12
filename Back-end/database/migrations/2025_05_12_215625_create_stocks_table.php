<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('stocks', function (Blueprint $table) {
            $table->id("id_stock");
            $table->string("nom_produit");
            $table->integer("nombre_produit");
            $table->integer("quantite");
            $table->date("date_entree_stock");
            $table->date("date_expiration");
            $table->float("prix_stock");
            $table->unsignedBigInteger("id_fournisseur");
            $table->foreign("id_fournisseur")->references("id_fournisseur")->on("fournisseurs")->onDelete("cascade");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stocks');
    }
};
