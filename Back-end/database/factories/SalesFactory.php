<?php

namespace Database\Factories;

use App\Models\Servants;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Sales>
 */
class SalesFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            "servant_id"=>Servants::inRandomOrder()->first()->id,
            'quantity'=>$this->faker->numberBetween(1,20),
            'total_price'=>$this->faker->numberBetween(1,1000),
            'total_received'=>$this->faker->numberBetween(1,1000),
            "change"=>$this ->faker->numberBetween(1,1000),
            "payment_type"=>$this->faker->name(),
            'payment_status'=>$this->faker->name(),
        ];
    }
}
