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
        Schema::create('livrisons', function (Blueprint $table) {
            $table->id("id_livrison");
            $table->date("date_livrison");
            $table->text("address");
            $table->enum("status", ["en_cours", "livree", "annulee"]);
            $table->unsignedBigInteger("id_user");
            $table->unsignedBigInteger("id_livreur");
            $table->unsignedBigInteger("id_order");
            $table->foreign("id_user")->references("id")->on("users")->onDelete('cascade');
            $table->foreign("id_livreur")->references("id_livreur")->on("livreurs")->onDelete("cascade");
            $table->foreign("id_order")->references("id_order")->on("orders")->onDelete("cascade");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('livrisons');
    }
};
