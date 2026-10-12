<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
        public function up()
        {
            Schema::create('feedbacks', function (Blueprint $table) {
                $table->id();
                $table->tinyInteger('rating'); // note sur 5
                $table->text('comment')->nullable(); // commentaire facultatif
                $table->string('sentiment')->nullable(); // positif, négatif, neutre
                $table->timestamps();
            });
        }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feedbacks');
    }
};
