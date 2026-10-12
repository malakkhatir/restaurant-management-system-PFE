import { useState, useEffect, useCallback } from "react";
import { Mail, MessageCircle, User, Send, CheckCircle, AlertCircle, Bell, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from './../../../../Api/api';

export default function Reclamation() {
  const [reclamations, setReclamations] = useState([]);
  const [selectedReclamation, setSelectedReclamation] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [newReclamation, setNewReclamation] = useState(null);
  const [unreadReclamations, setUnreadReclamations] = useState(new Set());
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const navigate = useNavigate();

  const fetchReclamations = useCallback(async (force = false) => {
    try {
      // Ne pas rafraîchir si moins de 5 secondes se sont écoulées depuis le dernier rafraîchissement
      // sauf si force est true ou si c'est le chargement initial
      if (!force && !isInitialLoad && lastFetchTime && Date.now() - lastFetchTime < 5000) {
        return;
      }

      if (!force && !isInitialLoad) {
        setLoading(true);
      }

      const response = await api.get('/reclamations');
      const newData = response.data.reverse();
      
      // Vérifier s'il y a de nouvelles réclamations
      if (reclamations.length > 0) {
        const latestReclamation = newData[0];
        if (latestReclamation && !reclamations.some(r => r.id_reclamation === latestReclamation.id_reclamation)) {
          setNewReclamation(latestReclamation);
          setUnreadReclamations(prev => new Set([...prev, latestReclamation.id_reclamation]));
          setTimeout(() => setNewReclamation(null), 5000);
        }
      }
      
      setReclamations(newData);
      setLastFetchTime(Date.now());
      setErrorMessage("");
      setIsInitialLoad(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des réclamations:', error);
      setErrorMessage("❌ Erreur lors de la récupération des réclamations");
    } finally {
      setLoading(false);
    }
  }, [reclamations, lastFetchTime, isInitialLoad]);

  // Effet pour le rafraîchissement initial
  useEffect(() => {
    fetchReclamations(true);
  }, []);

  // Effet pour le rafraîchissement périodique
  useEffect(() => {
    const interval = setInterval(() => {
      fetchReclamations();
    }, 10000); // Rafraîchir toutes les 10 secondes

    return () => clearInterval(interval);
  }, [fetchReclamations]);

  // Effet pour le focus de la fenêtre
  useEffect(() => {
    const handleFocus = () => {
      fetchReclamations(true); // Forcer le rafraîchissement lors du retour sur la page
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchReclamations]);

  const handleSelectReclamation = (reclamation) => {
    setSelectedReclamation(reclamation);
    setResponseMessage("");
    setSuccessMessage("");
    setErrorMessage("");
    setUnreadReclamations(prev => {
      const newSet = new Set(prev);
      newSet.delete(reclamation.id_reclamation);
      return newSet;
    });
  };

  const handleResponseChange = (e) => {
    setResponseMessage(e.target.value);
  };

  const handleSendResponse = async () => {
    if (!responseMessage.trim()) {
      setErrorMessage("Veuillez entrer un message avant d'envoyer.");
      return;
    }

    setSending(true);

    try {
      const emailData = {
        to: selectedReclamation.user.email,
        subject: `Réponse à votre réclamation - ${selectedReclamation.user.name}`,
        message: responseMessage,
        reclamation_id: selectedReclamation.id_reclamation
      };

      await api.post('/send-reclamation-response', emailData);
      setSuccessMessage(`📧 Email envoyé à ${selectedReclamation.user.email}`);
      setSending(false);
      setTimeout(() => setSuccessMessage(""), 4000);
      setSelectedReclamation(null);
    } catch (error) {
      setSending(false);
      setErrorMessage("❌ Une erreur est survenue lors de l'envoi de l'email.");
      setTimeout(() => setErrorMessage(""), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Notification pour nouvelle réclamation */}
        {newReclamation && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in">
            <div className="bg-white rounded-lg shadow-lg p-4 border-l-4 border-blue-500 flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Bell className="text-blue-500" size={20} />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Nouvelle réclamation</h4>
                <p className="text-sm text-gray-600">
                  De {newReclamation.user.name}
                </p>
              </div>
              <button 
                onClick={() => setNewReclamation(null)}
                className="ml-4 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <MessageCircle className="text-blue-600" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Réclamations</h1>
              <p className="text-gray-500">Gérez et répondez aux réclamations des clients</p>
            </div>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform duration-300" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
                clipRule="evenodd" 
              />
            </svg>
            <span className="font-medium">Retour</span>
          </button>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6 shadow-sm transform transition-all duration-300">
            <div className="flex items-center gap-2">
              <CheckCircle size={20} />
              <span>{successMessage}</span>
            </div>
          </div>
        )}
        {errorMessage && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 shadow-sm transform transition-all duration-300">
            <div className="flex items-center gap-2">
              <AlertCircle size={20} />
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des réclamations */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6 overflow-y-auto max-h-[70vh]">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <MessageCircle className="text-blue-500" size={24} />
              Réclamations reçues
            </h2>
            {loading && isInitialLoad ? (
              <div className="space-y-4">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="p-4 rounded-lg bg-gray-50 animate-pulse opacity-50">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : reclamations.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="mx-auto text-gray-400" size={48} />
                <p className="text-gray-500 mt-4">Aucune réclamation disponible</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reclamations.map((reclamation) => (
                  <div
                    key={reclamation.id_reclamation}
                    onClick={() => handleSelectReclamation(reclamation)}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-200 relative ${
                      selectedReclamation?.id_reclamation === reclamation.id_reclamation
                        ? "bg-blue-50 border-l-4 border-blue-500 shadow-md"
                        : "hover:bg-gray-50 border-l-4 border-transparent"
                    }`}
                  >
                    {unreadReclamations.has(reclamation.id_reclamation) && (
                      <div className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="text-blue-500" size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{reclamation.user.name}</h3>
                        <p className="text-sm text-gray-500">{reclamation.user.email}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Mail size={14} />
                        <span>{reclamation.user.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>
                          {new Date(reclamation.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Formulaire de réponse */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            {selectedReclamation ? (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <Send className="text-blue-500" size={24} />
                  Répondre à {selectedReclamation.user.name}
                </h2>

                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-gray-600 font-medium mb-2">Message de réclamation :</h3>
                  <p className="text-gray-800">{selectedReclamation.message}</p>
                </div>

                <div className="mb-6">
                  <label htmlFor="responseMessage" className="block text-gray-700 mb-2 font-medium">
                    Votre réponse
                  </label>
                  <textarea
                    id="responseMessage"
                    value={responseMessage}
                    onChange={handleResponseChange}
                    rows="5"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Tapez votre réponse ici..."
                  ></textarea>
                </div>

                <div className="flex flex-wrap gap-3 justify-end">
                  <button
                    onClick={handleSendResponse}
                    disabled={sending}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70 transition-all duration-200"
                  >
                    {sending ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Envoi...
                      </div>
                    ) : (
                      <>
                        <Mail size={18} />
                        Envoyer la réponse
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Send size={80} className="text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-600">Aucune réclamation sélectionnée</h3>
                <p className="text-gray-500 mt-2">Cliquez sur une réclamation pour y répondre</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
