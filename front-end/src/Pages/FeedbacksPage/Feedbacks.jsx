import { useState } from 'react';
import axios from 'axios';
import api from '../../Api/api';
import { FaStar, FaHeart, FaHandshake } from 'react-icons/fa';

const StarRating = ({ rating, setRating }) => {
  return (
    <div className="flex gap-2 mb-6">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          onClick={() => setRating(star)}
          className={`text-3xl cursor-pointer transition-all duration-200 transform hover:scale-110 ${
            rating >= star ? 'text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
};

// 📄 Formulaire principal
const FeedbackForm = () => {
  const [rating, setRating] = useState(2);
  const [comment, setComment] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      setMsg('❌ Veuillez ajouter un commentaire');
      setError(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/feedback', {
        rating,
        comment
      });
      setMsg('');
      setError(false);
      setComment('');
      setRating(2);
      setShowThankYou(true);
      // Hide thank you message after 5 seconds
      setTimeout(() => setShowThankYou(false), 5000);
    } catch (err) {
      setMsg("❌ Erreur lors de l'envoi.");
      setError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="bg-white shadow-xl rounded-3xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2"> Partagez votre expérience ✨</h2>
            <p className="text-gray-600">Votre avis compte pour nous !</p>
          </div>

          {showThankYou ? (
            <div className="text-center py-8 animate-fade-in">
              <div className="flex justify-center mb-4">
                <FaHeart className="text-4xl text-red-500 animate-bounce" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Merci pour votre retour !</h3>
              <p className="text-gray-600 mb-4">Votre avis nous aide à nous améliorer chaque jour.</p>
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <FaHandshake className="text-2xl" />
                <span className="font-semibold">À bientôt !</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Votre note :
                </label>
                <StarRating rating={rating} setRating={setRating} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Votre commentaire :
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ex: Service rapide et plat délicieux !"
                  className="w-full border border-gray-200 rounded-xl p-4 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 resize-none"
                  rows={4}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Envoi en cours...
                  </span>
                ) : (
                  'Envoyer mon avis'
                )}
              </button>

              {msg && (
                <div className={`mt-4 p-4 rounded-lg ${
                  error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                }`}>
                  <p className="text-sm font-medium">{msg}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;
