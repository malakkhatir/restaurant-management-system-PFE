import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { X, Check, Trash2, Edit2, Plus, AlertTriangle, Search, ArrowLeft, Info, Printer } from "lucide-react";

// Sons de notification
const playSuccess = () => window.navigator.vibrate ? window.navigator.vibrate(100) : null;
const playError = () => window.navigator.vibrate ? window.navigator.vibrate([100, 50, 100]) : null;

const Notification = ({ type, message, onClose }) => {
  useEffect(() => {
    // Jouer le son approprié
    if (type === 'success') {
      playSuccess();
    } else {
      playError();
    }

    // Fermer automatiquement après 5 secondes
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [type, onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 transform transition-all duration-500 ease-in-out ${
      type === 'success' 
        ? 'bg-gradient-to-r from-green-400 to-green-600' 
        : 'bg-gradient-to-r from-red-400 to-red-600'
    } text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 min-w-[300px] animate-slide-in`}>
      <div className="flex-shrink-0">
        {type === 'success' ? (
          <Check className="w-6 h-6 text-white" />
        ) : (
          <AlertTriangle className="w-6 h-6 text-white" />
        )}
      </div>
      <div className="flex-1">
        <p className="font-medium">{type === 'success' ? 'Succès!' : 'Erreur!'}</p>
        <p className="text-sm opacity-90">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 hover:opacity-75 transition-opacity"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

const Servants = () => {
  const [servants, setServants] = useState([]);
  const [filteredServants, setFilteredServants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newServant, setNewServant] = useState({ cin: "", name: "", email: "", phone: "", address: "", password: "" });
  const [editServant, setEditServant] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [servantToDelete, setServantToDelete] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedServant, setSelectedServant] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();

    useEffect(() => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      if (!token || !user) {
        navigate("/login");
      }
    }, []);

  const fetchServants = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/servants");
      setServants(response.data);
    } catch (error) {
      setError("Erreur lors du chargement des servants");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchServants();
  }, []);

  // Fonction pour filtrer les servants
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredServants(servants);
    } else {
      const searchLower = searchTerm.toLowerCase();
      const filtered = servants.filter(servant => 
        servant.name.toLowerCase().includes(searchLower) ||
        servant.cin.toLowerCase().includes(searchLower)
      );
      setFilteredServants(filtered);
    }
  }, [searchTerm, servants]);

  const handleAddServant = async () => {
    if (!newServant.cin.trim() || !newServant.name.trim() || !newServant.email.trim() || !newServant.phone.trim() || !newServant.address.trim() || !newServant.password.trim()) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/servants", newServant);
      setServants([...servants, response.data]);
      setNewServant({ cin: "", name: "", email: "", phone: "", address: "", password: "" });
      setSuccess("Servant ajouté avec succès");
      setError(null);
      setShowAddForm(false);
    } catch (error) {
      setError("Erreur lors de l'ajout du servant");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/servants/${id}`);
      setServants(servants.filter((servant) => servant.id !== id));
      setSuccess("Servant supprimé avec succès");
      setError(null);
      setShowDeleteConfirm(false);
      setServantToDelete(null);
    } catch (error) {
      setError("Erreur lors de la suppression du servant");
      console.error(error);
    }
  };

  const handleEdit = (servant) => {
    setEditServant(servant);
  };

  const handleSaveEdit = async () => {
    if (!editServant.cin.trim() || !editServant.name.trim() || !editServant.email.trim() || !editServant.phone.trim() || !editServant.address.trim()) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    try {
      const response = await axios.put(`http://127.0.0.1:8000/api/servants/${editServant.id}`, editServant);
      setServants(servants.map(servant => servant.id === editServant.id ? response.data : servant));
      setEditServant(null);
      setSuccess("Servant mis à jour avec succès");
  } catch (error) {
      setError("Erreur lors de la mise à jour du servant");
      console.error(error);
  }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const servantsToPrint = filteredServants;
    const currentDate = new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Liste des Serveurs</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            body {
              font-family: 'Inter', sans-serif;
              margin: 0;
              padding: 20px;
              color: #1f2937;
              background-color: #f9fafb;
            }
            
            .container {
              max-width: 1200px;
              margin: 0 auto;
              background-color: white;
              padding: 30px;
              border-radius: 12px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #e5e7eb;
            }
            
            .header h1 {
              color: #1f2937;
              font-size: 24px;
              margin: 0;
              margin-bottom: 10px;
            }
            
            .header p {
              color: #6b7280;
              margin: 0;
            }
            
            .filters {
              margin-bottom: 20px;
              padding: 15px;
              background-color: #f9fafb;
              border-radius: 8px;
              font-size: 14px;
            }
            
            .filters p {
              margin: 5px 0;
              color: #4b5563;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            
            th {
              background-color: #f3f4f6;
              padding: 12px;
              text-align: left;
              font-weight: 600;
              color: #374151;
              border-bottom: 2px solid #e5e7eb;
            }
            
            td {
              padding: 12px;
              border-bottom: 1px solid #e5e7eb;
            }
            
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            
            .contact-info {
              display: flex;
              align-items: center;
              gap: 8px;
              color: #4b5563;
            }
            
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #6b7280;
              border-top: 1px solid #e5e7eb;
              padding-top: 20px;
            }

            .actions {
              display: flex;
              justify-content: center;
              gap: 16px;
              margin-top: 30px;
              padding: 20px;
            }

            .btn {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              padding: 10px 20px;
              border-radius: 8px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.3s ease;
            }

            .btn-print {
              background: linear-gradient(to right, #2563eb, #1d4ed8);
              color: white;
              border: none;
            }

            .btn-print:hover {
              background: linear-gradient(to right, #1d4ed8, #1e40af);
              transform: translateY(-1px);
            }

            .btn-return {
              background-color: white;
              color: #4b5563;
              border: 1px solid #e5e7eb;
            }

            .btn-return:hover {
              background-color: #f9fafb;
              transform: translateY(-1px);
            }

            @media print {
              .actions {
                display: none;
              }
              
              body {
                padding: 0;
                background-color: white;
              }

              .container {
                box-shadow: none;
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Liste des Serveurs</h1>
              <p>Date d'impression: ${currentDate}</p>
                  </div>
            
            <div class="filters">
              <p><strong>Filtres appliqués:</strong></p>
              ${searchTerm ? `<p>Recherche: ${searchTerm}</p>` : ''}
      </div>

            <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>CIN</th>
            <th>Nom</th>
            <th>Email</th>
            <th>Téléphone</th>
            <th>Adresse</th>
          </tr>
        </thead>
        <tbody>
                ${servantsToPrint.map((servant, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${servant.cin || '-'}</td>
                    <td>${servant.name || '-'}</td>
                    <td>
                      <div class="contact-info">
                        <span>${servant.email || '-'}</span>
                      </div>
                    </td>
                    <td>
                      <div class="contact-info">
                        <span>${servant.phone || '-'}</span>
                      </div>
                    </td>
                    <td>${servant.address || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="footer">
              <p>Total des serveurs: ${servantsToPrint.length}</p>
              <p>Document généré automatiquement</p>
            </div>

            <div class="actions">
              <button onclick="window.print()" class="btn btn-print">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9"></polyline>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                  <rect x="6" y="14" width="12" height="8"></rect>
                </svg>
                Imprimer
              </button>
              <button onclick="window.close()" class="btn btn-return">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Retour
              </button>
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Return Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/user/admin')}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Retour à l'administration</span>
          </button>
        </div>

        {/* Enhanced Title Section */}
        <div className="flex justify-between items-center mb-8 bg-white rounded-xl shadow-lg p-6 transform hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-lg shadow-md">
              <span className="text-3xl">👨‍🍳</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Gestion des Serveurs
              </h2>
              <p className="text-gray-500 mt-1">Gérez votre équipe de serveurs efficacement</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-sm"
            >
              <Printer className="w-5 h-5 text-gray-600" />
              <span>Imprimer</span>
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg group"
            >
              <Plus className="w-5 h-5 mr-2 transform group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-medium">Ajouter un serveur</span>
            </button>
          </div>
        </div>

        {/* Search Bar with enhanced styling */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto transform hover:scale-[1.02] transition-all duration-300">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
            </div>
          <input
            type="text"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-lg"
              placeholder="Rechercher par nom ou CIN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <Notification
            type="error"
            message={error}
            onClose={() => setError(null)}
          />
        )}
        {success && (
          <Notification
            type="success"
            message={success}
            onClose={() => setSuccess(null)}
          />
        )}

        {/* Add Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Ajouter un nouveau serveur</h3>
                <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CIN</label>
                  <input
                    type="text"
                    value={newServant.cin}
                    onChange={(e) => setNewServant({ ...newServant, cin: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    value={newServant.name}
                    onChange={(e) => setNewServant({ ...newServant, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
                    value={newServant.email}
                    onChange={(e) => setNewServant({ ...newServant, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="text"
                    value={newServant.phone}
                    onChange={(e) => setNewServant({ ...newServant, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <input
                    type="text"
                    value={newServant.address}
                    onChange={(e) => setNewServant({ ...newServant, address: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                  <input
                    type="password"
                    value={newServant.password}
                    onChange={(e) => setNewServant({ ...newServant, password: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddServant}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">Confirmer la suppression</h3>
                <p className="text-gray-600 mb-6">
                  Êtes-vous sûr de vouloir supprimer ce serveur ? Cette action est irréversible.
                </p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setServantToDelete(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handleDelete(servantToDelete)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetails && selectedServant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Détails du Serveur</h3>
                <button
                  onClick={() => {
                    setShowDetails(false);
                    setSelectedServant(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">CIN</label>
                    <p className="mt-1 text-lg text-gray-900">{selectedServant.cin}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Nom</label>
                    <p className="mt-1 text-lg text-gray-900">{selectedServant.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    <p className="mt-1 text-lg text-gray-900">{selectedServant.email}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Téléphone</label>
                    <p className="mt-1 text-lg text-gray-900">{selectedServant.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Adresse</label>
                    <p className="mt-1 text-lg text-gray-900">{selectedServant.address}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => {
                    setShowDetails(false);
                    setSelectedServant(null);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Servants Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CIN</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredServants.map((servant, index) => (
                  <tr key={servant.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editServant?.id === servant.id ? (
                        <input
                          type="text"
                          value={editServant.cin}
                          onChange={(e) => setEditServant({ ...editServant, cin: e.target.value })}
                          className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        ) : (
                        <span className="text-sm text-gray-900">{servant.cin}</span>
        )}
      </td>
                    <td className="px-6 py-4 whitespace-nowrap">
        {editServant?.id === servant.id ? (
          <input
            type="text"
                          value={editServant.name}
                          onChange={(e) => setEditServant({ ...editServant, name: e.target.value })}
                          className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        ) : (
                        <span className="text-sm text-gray-900">{servant.name}</span>
        )}
      </td>
                    <td className="px-6 py-4 whitespace-nowrap">
        {editServant?.id === servant.id ? (
          <input
            type="text"
                          value={editServant.phone}
                          onChange={(e) => setEditServant({ ...editServant, phone: e.target.value })}
                          className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        ) : (
                        <span className="text-sm text-gray-900">{servant.phone}</span>
        )}
      </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        {editServant?.id === servant.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={handleSaveEdit}
                            className="p-2 text-green-600 hover:text-green-900 bg-green-100 rounded-lg transition-colors duration-200"
                            title="Enregistrer"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setEditServant(null)}
                            className="p-2 text-red-600 hover:text-red-900 bg-red-100 rounded-lg transition-colors duration-200"
                            title="Annuler"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/user/admin/servants/details/${servant.id}`)}
                            className="p-2 text-blue-600 hover:text-blue-900 bg-blue-100 rounded-lg transition-colors duration-200"
                            title="Voir les détails"
                          >
                            <Info className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(servant)}
                            className="p-2 text-blue-600 hover:text-blue-900 bg-blue-100 rounded-lg transition-colors duration-200"
                            title="Modifier"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setServantToDelete(servant.id);
                              setShowDeleteConfirm(true);
                            }}
                            className="p-2 text-red-600 hover:text-red-900 bg-red-100 rounded-lg transition-colors duration-200"
                            title="Supprimer"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
        )}
      </td>
    </tr>
  ))}
</tbody>
      </table>
          </div>
        </div>
    </div>
    </div>
  );
};

export default Servants;
