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
        Schema::create('livreurs', function (Blueprint $table) {
            $table->id("id_livreur");
            $table->string("nom");
            $table->string("prenom");
            $table->string("cin")->unique();
            $table->string('email')->unique();
            $table->string("telephone")->unique();
            $table->string("adresse");
            $table->string('ville');
            $table->bigInteger("code_postal");
            $table->string("pays");
            $table->enum("status", ["actif", "inactif"]);
            $table->string("password");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('livreurs');
    }
};
