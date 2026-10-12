<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\ServantController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\FournisseurController;
use App\Http\Controllers\LivreurController;
use App\Http\Controllers\LivrisonController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ReclamationController;
use App\Http\Controllers\TableController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});
Route::apiResource('categories', CategoryController::class);
Route::apiResource('menus', MenuController::class);
Route::apiResource('sales', SaleController::class);
Route::apiResource('servants', ServantController::class);
Route::apiResource('tables', TableController::class);
Route::apiResource('payments', PaymentController::class);
Route::get('/menu',[MenuController::class,'index2']);
Route::get('/menu/category',[MenuController::class,'getMenuByCategory']);
Route::put('/tables/{id}/status', [TableController::class, 'updateStatus']);
Route::post('/login', [LoginController::class, 'login']);
Route::post('/register', [LoginController::class, 'register']);
Route::post('/logout',[AuthenticatedSessionController::class,'destroy']);
Route::post('report', [ReportController::class, 'getSales']);
Route::post('export-sales', [ReportController::class, 'exportSales']);
Route::get('/feedback', [FeedbackController::class, 'index']);
Route::post('/feedback', [FeedbackController::class, 'store']);
Route::delete('/feedback/destroy/{id}', [FeedbackController::class, 'destroy']);
Route::get('/reclamations', [ReclamationController::class, 'index']);
Route::get('/reclamation/user/{id}', [ReclamationController::class,"getreclamationUser"]);
Route::post('/reclamations', [ReclamationController::class, 'store']);
Route::put('/reclamations/{id}', [ReclamationController::class, 'update']);
Route::delete('/reclamations/{id}', [ReclamationController::class, 'destroy']);
Route::post('/send-reclamation-response', [ReclamationController::class, 'sendResponse']);
Route::get('/total-workers', [UserController::class, 'getTotalWorkers']);
Route::get('/fournisseurs', [FournisseurController::class, 'index']);
Route::post('/fournisseurs', [FournisseurController::class, 'store']);
Route::put('/fournisseurs/{id}', [FournisseurController::class, 'update']);
Route::delete('/fournisseurs/{id}', [FournisseurController::class, 'destroy']);
Route::get('/fournisseurs/{id}', [FournisseurController::class, 'show']);
Route::get('/stocks', [StockController::class, 'index']);
Route::delete('/stocks/{id}', [StockController::class, 'destroy']);
Route::post('/stocks', [StockController::class, 'store']);
Route::put('/stocks/{id}', [StockController::class, 'update']);
Route::get('/stocks/{id}', [StockController::class, 'show']);
Route::put('/users/{id}', [UserController::class, 'update']);
Route::get("/reservations",[ReservationController::class,"index"]);
Route::get("/reservations/{id}",[ReservationController::class,"show"]);
Route::post("/reservations",[ReservationController::class,"store"]);
Route::put("/reservations/{id}",[ReservationController::class,"update"]);
Route::delete("/reservations/{id}",[ReservationController::class,"destroy"]);
Route::apiResource('orders', OrderController::class);
Route::get("/orders/user/{id}",[OrderController::class,"getOrderByIdUser"]);
Route::put("/user/client/{id}",[UserController::class,"updateClient"]);
Route::get('/user/client/{id}',[UserController::class,'getclient']);
Route::put('/reservation/statusv/{id}',[ReservationController::class,'validereservation']);
Route::put('/reservation/statusa/{id}',[ReservationController::class,'annullerreservation']);
Route::get('/reservation/etattable',[ReservationController::class,'etattable']);
Route::put('/reservation/updateetattable/{id}',[ReservationController::class,'updateetattable']);
Route::apiResource('livreurs',LivreurController::class);
Route::apiResource('livrisons', LivrisonController::class);
Route::get('/Orders/livreuractif',[OrderController::class,"getlivreuractif"]);
Route::put('/orderstatus/{id}', [OrderController::class, 'updatestatus']);
Route::get('/nombrestatic',[ReservationController::class,'nombrestatic']);
Route::get('/getLivreurActif', [LivreurController::class, 'getLivreurActif']);
Route::put('updateStatus/{id}', [LivreurController::class, 'updateStatus']);
Route::get('/admincontact', [UserController::class, 'admincontact']);
Route::put('/updateProfile/{id}', [LivreurController::class, 'updateProfile']);
Route::get('/getstatus/{id}', [LivreurController::class, 'getstatus']);
Route::get('/getlivrisonlivreur/{id}', [LivrisonController::class, 'getLivrisonByLivreur']);
Route::put('/updateStatuslivrison/{id}', [LivrisonController::class, 'updateStatuslivrison']);
Route::get('/getlivrisonbylivreur/{id}', [LivrisonController::class, 'gethistorylivrisonbylivreur']);