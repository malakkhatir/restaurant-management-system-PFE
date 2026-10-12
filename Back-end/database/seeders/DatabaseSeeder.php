<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Category;
use App\Models\Fournisseur;
use App\Models\Menu;
use App\Models\Reclamation;
use App\Models\Sales;
use App\Models\Servants;
use App\Models\Stock;
use App\Models\Table;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        //\App\Models\User::factory()->create([
        //    'name' => 'Said ouchrif',
        //    'email' => 'saidouchrif@gmail.com',
        //    'password' => bcrypt('123456789'),
        //]);
        Fournisseur::factory(10)->create();
        Stock::factory(10)->create();
        //Reclamation::factory(10)->create();
        // \App\Models\User::factory(10)->create();
        //Category::factory(10)->create();
        // Menu::factory(10)->create();
        //Servants::factory(10)->create();
        //Table::factory(10)->create();
         //Sales::factory(10)->create();

    }
}
