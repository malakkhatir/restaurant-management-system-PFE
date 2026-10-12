<?php

namespace App\Http\Controllers;

use App\Models\Livreur;
use App\Models\Livrison;
use App\Models\Order;
use App\Models\Reservation;
use App\Models\Table;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $reservation=Reservation::with("table")->paginate(7);
        return response()->json($reservation);
    }

    /**
     * Show the form for creating a new resource.
     */

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $value=$request->validate([
            "id_user"=>"required|exists:users,id",
            "id_table"=>"required|exists:tables,id",
            "date"=>"required|string",
            "menu"=>"required|string",
            "payment"=>"required|string",
        ]);
        $reservation=Reservation::create($value);
        return response()->json([
            "message"=>"Create avec success",
            "Reservation"=>$reservation
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Reservation $reservation,$id)
    {
        $reservation=Reservation::find($id);
        return response()->json($reservation);
    }

    /**
     * Show the form for editing the specified resource.
     */

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request,$id)
    {
        $reservation=Reservation::find($id);
        $value=$request->validate([
            "id_user"=>"required|exists:users,id",
            "id_table"=>"required|exists:tables,id",
            "date"=>"required|string",
            "menu"=>"required|string",
            "payment"=>"required|string",
        ]);
        $reservation->update($value);
        return response()->json([
            "message"=>"update avec success",
            "Reservation"=>$reservation
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Reservation $reservation,$id)
    {
        Reservation::destroy($id);
        return response()->json([
            "message"=>"supprimer avec success"
        ]);
    }
    public function validereservation(Reservation $reservation,$id){
        $reservation=Reservation::where("status","en attente")->find( $id );
        if(!$reservation){
            return response()->json(["message"=> "reservation non trouver"]);
        }else{
            $table=Table::where("id",$reservation->id_table)->orWhere("status","1")->first();
            if(!$table){
                return response()->json(["message"=> "Table non trouver"]);
            }else{
                $table->update(["status"=>"0"]);
                $reservation->update(["status"=> "confirmée"]);
            }
            return response()->json(["message le status modifier avec success"]);
        }
    }
    public function annullerreservation(Reservation $reservation,$id){
        $reservation=Reservation::where("status","en attente")->find( $id );
        if(!$reservation){
            return response()->json(["message"=> "reservation non trouver"]);
        }else{
            $table=Table::where("id",$reservation->id_table)->orWhere("status","1")->first();
            if(!$table){
                return response()->json(["message"=> "Table non trouver"]);
            }else{
                $table->update(["status"=>"1"]);
                $reservation->update(["status"=> "annulée"]);
            }
            return response()->json(["message le status modifiée avec success"]);
        }
    }
    public function etattable(Reservation $reservation){
        $table=Table::where("status","1")->get();
        if(!$table){
            return response()->json(["message"=> "non table desponible"]);
        }else{
            return response()->json($table);
        }
    }
    public function updateetattable(Request $request,$id){
        $Reservation=Reservation::find($id);
        if(!$Reservation){
            return response()->json(["message"=> "Reservation non trouver"]);
        }else{
            $id_table=$request->id_table;
            $Reservation->update(["id_table"=>$id_table]);
        }
        return response()->json(["table de reservation et modifier"]);
    }
    public function nombrestatic(Reservation $reservation){
        $reservation=Reservation::all()->count();
        $orders=Order::all()->count();
        $livruer=Livreur::all()->count();
        $livrison=Livrison::where("status","livree")->count();
        return response()->json([
            "reservation"=>$reservation,
            "orders"=>$orders,
            "livreur"=>$livruer,
            "livrison"=>$livrison
        ]);
    }
}
