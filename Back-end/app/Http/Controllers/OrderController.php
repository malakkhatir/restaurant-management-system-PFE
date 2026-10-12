<?php

namespace App\Http\Controllers;

use App\Models\Livreur;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $orders = Order::with("User")->paginate(7);
        return response()->json($orders);
    }

    /**
     * Show the form for creating a new resource.
     */


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $orders=$request->validate([
            "total_price"=>"required|numeric",
            "status"=>"required|string",
            "payment_method"=>"required|string",
            "id_user"=>"required|exists:users,id",
            "menu"=>"required|string",
        ]);
        $orders=Order::create($orders);
        return response()->json($orders);
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order,$id)
    {
        $order=Order::find($id);
        return response()->json($order);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $order=Order::find($id);
        $orders=$request->validate([
            "total_price"=>"required|numeric",
            "status"=>"required|string",
            "payment_method"=>"required|string",
            "id_user"=>"required|exists:users,id",
            "menu"=>"required|string",
        ]);
        $order->update($orders);
        return response()->json($order);   
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $order=Order::find($id);
        $order->delete();
        return response()->json(["message"=>"Order deleted successfully"]);
    }
    public function getOrderByIdUser($id)
    {
        $order=Order::where("id_user",$id)->get();
        return response()->json($order);
    }
    public function getlivreuractif()
    {
        $livreur = Livreur::where('status', 'actif')->get();
        return response()->json($livreur);
    }
    public function updatestatus(Request $request, $id)
    {
        $order = Order::find($id);
        $order->update(['status' => $request->input('status')]);
        return response()->json($order);
    }
}
