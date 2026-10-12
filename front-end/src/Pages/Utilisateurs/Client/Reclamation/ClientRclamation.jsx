import React, { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaExclamationTriangle, FaArrowLeft } from "react-icons/fa";
import { MdOutlineFeedback } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import api from "../../../../Api/api";

const ClientRclamation = () => {
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ message: "" });
  const [editId, setEditId] = useState(null);
  const [notification, setNotification] = useState({ type: "", message: "" });
  const [showConfirm, setShowConfirm] = useState(false);
  const [recIdToDelete, setRecIdToDelete] = useState(null);
  const navigate = useNavigate();

  // Récupérer l'utilisateur connecté
  const user = JSON.parse(localStorage.getItem("user"));

  // Charger les réclamations de l'utilisateur
  const fetchReclamations = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reclamation/user/${user.id}`);
      console.log(res.data);
      setReclamations(res.data.reverse());
    } catch (err) {
      setNotification({ type: "error", message: "Erreur lors du chargement des réclamations." });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReclamations();
    // eslint-disable-next-line
  }, []);

  // Gérer la soumission du formulaire (ajout ou modification)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.message.trim()) {
      setNotification({ type: "info", message: "Le message ne peut pas être vide." });
      return;
    }
    try {
      if (editId) {
        await api.put(`/reclamations/${editId}`, { message: formData.message, id_user: user.id });
        setNotification({ type: "success", message: "Réclamation modifiée avec succès !" });
      } else {
        await api.post("/reclamations", { message: formData.message, id_user: user.id });
        setNotification({ type: "success", message: "Réclamation ajoutée avec succès !" });
      }
      setFormData({ message: "" });
      setEditId(null);
      setShowForm(false);
      fetchReclamations();
    } catch (err) {
      setNotification({ type: "error", message: "Erreur lors de l'envoi de la réclamation." });
    }
  };

  // Préparer la modification
  const handleEdit = (reclamation) => {
    setFormData({ message: reclamation.message });
    setEditId(reclamation.id_reclamation);
    setShowForm(true);
  };

  // Ouvrir la modale de confirmation
  const handleDelete = (id) => {
    setRecIdToDelete(id);
    setShowConfirm(true);
  };

  // Confirmer la suppression
  const confirmDelete = async () => {
    try {
      await api.delete(`/reclamations/${recIdToDelete}`);
      setNotification({ type: "success", message: "Réclamation supprimée avec succès !" });
      fetchReclamations();
    } catch (err) {
      setNotification({ type: "error", message: "Erreur lors de la suppression." });
    }
    setShowConfirm(false);
    setRecIdToDelete(null);
  };

  // Fermer la notification après 4s
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => setNotification({ type: "", message: "" }), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Notification */}
        {notification.message && (
          <div className={`fixed top-4 right-4 z-50 animate-fade-in-down w-[90%] sm:w-auto`}>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white
              ${notification.type === "success" ? "bg-green-500" : ""}
              ${notification.type === "error" ? "bg-red-500" : ""}
              ${notification.type === "info" ? "bg-blue-500" : ""}
            `}>
              {notification.type === "success" && <FaCheckCircle size={20} />}
              {notification.type === "error" && <FaTimesCircle size={20} />}
              {notification.type === "info" && <FaInfoCircle size={20} />}
              <span className="text-sm">{notification.message}</span>
              <button className="ml-2" onClick={() => setNotification({ type: "", message: "" })}>×</button>
            </div>
          </div>
        )}

        {/* Modale de confirmation de suppression */}
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center animate-fade-in-down">
              <div className="flex flex-col items-center gap-3 mb-4">
                <FaExclamationTriangle className="text-red-500 text-4xl mb-2" />
                <h2 className="text-lg font-bold text-gray-800">Confirmation</h2>
                <p className="text-gray-600">Voulez-vous vraiment supprimer cette réclamation ?</p>
              </div>
              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={confirmDelete}
                  className="px-5 py-2 bg-red-600 text-white rounded-lg font-semibold shadow hover:bg-red-700 transition-all"
                >
                  Oui, supprimer
                </button>
                <button
                  onClick={() => { setShowConfirm(false); setRecIdToDelete(null); }}
                  className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold shadow hover:bg-gray-300 transition-all"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Animation style */}
        <style>{`
          .animate-fade-in-down {
            animation: fadeInDown 0.7s ease-out;
          }
          @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-30px);}
            to { opacity: 1; transform: translateY(0);}
          }
        `}</style>

        {/* Ligne titre + bouton retour */}
        <div className="flex items-center gap-3 mb-8 mt-8">
          <button
            onClick={() => navigate('/user/client')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg shadow hover:bg-gray-300 transition-all"
          >
            <FaArrowLeft /> Retour
          </button>
          <div className="p-3 bg-red-100 rounded-xl">
            <MdOutlineFeedback className="text-red-600" size={28} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Mes réclamations</h1>
            <p className="text-gray-500">Gérez vos réclamations et suivez leur statut</p>
          </div>
        </div>

        {/* Bouton d'ajout */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => { setShowForm(true); setEditId(null); setFormData({ message: "" }); }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-all"
          >
            <FaPlus /> Ajouter une réclamation
          </button>
        </div>

        {/* Formulaire d'ajout/modification */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 mb-6 animate-fade-in-down">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {editId ? "Modifier la réclamation" : "Nouvelle réclamation"}
            </h2>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 mb-4"
              rows={4}
              placeholder="Décrivez votre problème ou suggestion..."
              value={formData.message}
              onChange={e => setFormData({ ...formData, message: e.target.value })}
            />
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditId(null); setFormData({ message: "" }); }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
              >
                {editId ? "Modifier" : "Envoyer"}
              </button>
            </div>
          </form>
        )}

        {/* Liste des réclamations */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
              ))}
            </div>
          ) : reclamations.length === 0 ? (
            <div className="text-center py-8">
              <MdOutlineFeedback className="mx-auto text-gray-400" size={48} />
              <p className="text-gray-500 mt-4">Aucune réclamation pour le moment.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {reclamations.map((rec) => (
                <li key={rec.id_reclamation} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-gray-800 font-medium">{rec.message}</p>
                    <span className="text-xs text-gray-400">
                      {new Date(rec.created_at).toLocaleString("fr-FR")}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <button
                      onClick={() => handleEdit(rec)}
                      className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                      title="Modifier"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(rec.id_reclamation)}
                      className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
                      title="Supprimer"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientRclamation;
