<?php

namespace Database\Factories;

use App\Models\Fournisseur;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Stock>
 */
class StockFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nom_produit' => $this->faker->word,
            'nombre_produit' => $this->faker->numberBetween(1, 100),
            'quantite' => $this->faker->numberBetween(1, 100),
            'date_entree_stock' => $this->faker->date,
            'date_expiration' => $this->faker->date,
            'prix_stock' => $this->faker->randomFloat(2, 1, 100),
            'id_fournisseur' => Fournisseur::factory(),
        ];
    }
}
