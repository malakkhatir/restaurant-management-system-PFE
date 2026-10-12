<?php
namespace App\Http\Controllers;

use App\Models\Feedback;
use Exception;
use Illuminate\Http\Request;
use PDOException;

class FeedbackController extends Controller
{
    public function store(Request $request)
    {
        try{
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        $sentiment = $this->analyzeSentiment($request->comment);

        $feedback = Feedback::create([
            'rating' => $request->rating,
            'comment' => $request->comment,
            'sentiment' => $sentiment
        ]);

        return response()->json($feedback);
    }catch(PDOException $e){
        return response()->json(["message"=>"Erreur lors de la création du feedback"],404);
    }
    catch(Exception $e){
        return response()->json(["message"=>"Erreur lors de la création du feedback"],404);
    }
    }
    public function destroy($id)
    {
        try{
            Feedback::destroy($id);
            return response()->json(['message' => 'Feedback deleted successfully']);
        }catch(PDOException $e){
            return response()->json(["message"=>"Erreur lors de la suppression du feedback"],404);
        }
        catch(Exception $e){
            return response()->json(["message"=>"Erreur lors de la suppression du feedback"],404);
        }
    }
    public function index()
    {
        try{
            return Feedback::latest()->get();
        }catch(PDOException $e){
            return response()->json(["message"=>"Erreur lors de la récupération des feedbacks"],404);
        }
        catch(Exception $e){
            return response()->json(["message"=>"Erreur lors de la récupération des feedbacks"],404);
        }
    }

    private function analyzeSentiment($text)
    {
        try{
        if (!$text) return 'neutral';

        $text = strtolower($text);
        $positives = ['bon', 'génial', 'excellent', 'parfait', 'délicieux', 'top'];
        $negatives = ['mauvais', 'horrible', 'nul', 'dégoûtant', 'froid'];

        foreach ($positives as $mot) {
            if (str_contains($text, $mot)) return 'positive';
        }

        foreach ($negatives as $mot) {
            if (str_contains($text, $mot)) return 'negative';
        }
            return 'neutral';
        }catch(PDOException $e){
            return response()->json(["message"=>"Erreur lors de l'analyse du sentiment"],404);
        }
        catch(Exception $e){
            return response()->json(["message"=>"Erreur lors de l'analyse du sentiment"],404);
        }
    }
}
