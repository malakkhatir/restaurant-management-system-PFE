import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../Api/api";
import { Star, Smile, Meh, Frown, Trash2, ArrowLeft, X, MessageSquare, CheckCircle2, AlertCircle } from "lucide-react";

export default function Feedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const res = await api.get("/feedback");
      setFeedbacks(res.data);
    } catch (err) {
      console.error("Erreur de chargement :", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/feedback/destroy/${id}`);
      setNotification({
        show: true,
        type: 'success',
        message: 'Avis supprimé avec succès !'
      });
      setConfirmDeleteId(null);
      fetchFeedbacks();
      setTimeout(() => {
        setNotification({ show: false, type: '', message: '' });
      }, 3000);
    } catch (err) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Erreur lors de la suppression de l\'avis.'
      });
      setTimeout(() => {
        setNotification({ show: false, type: '', message: '' });
      }, 3000);
    }
  };

  const getSentimentEmoji = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return "😊";
      case "neutral":
        return "😐";
      case "negative":
        return "😞";
      default:
        return "😐";
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-50 border-green-200";
      case "neutral":
        return "bg-yellow-50 border-yellow-200";
      case "negative":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour
            </button>
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-800">
                Avis des clients
              </h1>
            </div>
          </div>
        </div>

        {/* Notification */}
        {notification.show && (
          <div className="fixed top-4 right-4 z-50">
            <div className={`rounded-lg shadow-lg p-4 ${
              notification.type === 'success' 
                ? 'bg-green-100 border border-green-400' 
                : 'bg-red-100 border border-red-400'
            }`}>
              <div className="flex items-center">
                {notification.type === 'success' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                )}
                <p className={`text-sm font-medium ${
                  notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {notification.message}
                </p>
                <button
                  onClick={() => setNotification({ show: false, type: '', message: '' })}
                  className="ml-4"
                >
                  <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Grille des avis */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feedbacks.map((feedback) => (
            <div
              key={feedback.id}
              className={`bg-white rounded-lg shadow p-6 border ${
                feedback.sentiment === 'positive' ? 'border-green-200' :
                feedback.sentiment === 'negative' ? 'border-red-200' :
                'border-yellow-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{getSentimentEmoji(feedback.sentiment)}</span>
                  <h3 className="text-lg font-medium text-gray-800 line-clamp-2">{feedback.comment}</h3>
                </div>
              </div>

              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < feedback.rating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setConfirmDeleteId(feedback.id)}
                className="w-full mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
              >
                <Trash2 className="h-5 w-5 mr-2" />
                Supprimer l'avis
              </button>
            </div>
          ))}
        </div>

        {/* Modal de confirmation */}
        {confirmDeleteId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Confirmer la suppression
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Êtes-vous sûr de vouloir supprimer cet avis ? Cette action est irréversible.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => handleDelete(confirmDeleteId)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
                    >
                      <Trash2 className="h-5 w-5 mr-2" />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
