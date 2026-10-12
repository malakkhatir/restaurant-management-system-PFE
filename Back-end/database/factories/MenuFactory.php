<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Menu>
 */
class MenuFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->name(),
            'slug'=>$this->faker->name(),
            'description'=>$this->faker->text(),
            'price'=>$this->faker->numberBetween(1,100),
            'image'=>$this->faker->imageUrl(),
            'category_id'=>Category::inRandomOrder()->first()->id,
        ];
    }
}
