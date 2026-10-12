import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, ArrowLeft, AlertTriangle, Building2, Phone, Mail, MapPin, User, FileText, Info, Package, CheckCircle, X, AlertCircle, Printer } from 'lucide-react';
import api from './../../../../Api/api';

export default function Fournisseur() {
  const navigate = useNavigate();
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fournisseurToDelete, setFournisseurToDelete] = useState(null);
  const [editingFournisseur, setEditingFournisseur] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    cin: '',
    adresse: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const fetchFournisseurs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/fournisseurs');
      if (response.data) {
        setFournisseurs(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des fournisseurs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFournisseurs();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    try {
      if (editingFournisseur) {
        const response = await api.put(`/fournisseurs/${editingFournisseur.id_fournisseur}`, formData);
        showNotification(response.data?.message || 'Fournisseur modifié avec succès');
      } else {
        const response = await api.post('/fournisseurs', formData);
        showNotification(response.data?.message || 'Fournisseur ajouté avec succès');
      }
      setShowModal(false);
      setEditingFournisseur(null);
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        cin: '',
        adresse: ''
      });
      fetchFournisseurs();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du fournisseur:', error);
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
        const firstError = Object.values(error.response.data.errors)[0];
        if (firstError) {
          showNotification(firstError[0], 'error');
        }
      } else {
        showNotification(error.response?.data?.message || 'Erreur lors de la sauvegarde du fournisseur', 'error');
      }
    }
  };

  const handleEdit = (fournisseur) => {
    setEditingFournisseur(fournisseur);
    setFormData({
      nom: fournisseur.nom || '',
      prenom: fournisseur.prenom || '',
      email: fournisseur.email || '',
      telephone: fournisseur.telephone || '',
      cin: fournisseur.cin || '',
      adresse: fournisseur.adresse || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/fournisseurs/${id}`);
      fetchFournisseurs();
      setShowDeleteModal(false);
      setFournisseurToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression du fournisseur:', error);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const fournisseursToPrint = filteredFournisseurs;
    const currentDate = new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Liste des Fournisseurs</title>
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
              <h1>Liste des Fournisseurs</h1>
              <p>Date d'impression: ${currentDate}</p>
            </div>
            
            <div class="filters">
              <p><strong>Filtres appliqués:</strong></p>
              ${searchTerm ? `<p>Recherche: ${searchTerm}</p>` : ''}
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>CIN</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Adresse</th>
                </tr>
              </thead>
              <tbody>
                ${fournisseursToPrint.map(fournisseur => `
                  <tr>
                    <td>${fournisseur.nom || '-'}</td>
                    <td>${fournisseur.prenom || '-'}</td>
                    <td>${fournisseur.cin || '-'}</td>
                    <td>
                      <div class="contact-info">
                        <span>${fournisseur.email || '-'}</span>
                      </div>
                    </td>
                    <td>
                      <div class="contact-info">
                        <span>${fournisseur.telephone || '-'}</span>
                      </div>
                    </td>
                    <td>${fournisseur.adresse || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="footer">
              <p>Total des fournisseurs: ${fournisseursToPrint.length}</p>
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

  const filteredFournisseurs = fournisseurs.filter(fournisseur => {
    const searchTermLower = searchTerm.toLowerCase();
    const nomMatch = (fournisseur.nom?.toLowerCase() || '').includes(searchTermLower);
    const prenomMatch = (fournisseur.prenom?.toLowerCase() || '').includes(searchTermLower);
    const cinMatch = (fournisseur.cin || '').includes(searchTerm);
    const emailMatch = (fournisseur.email?.toLowerCase() || '').includes(searchTermLower);
    const telephoneMatch = (fournisseur.telephone || '').includes(searchTerm);

    return nomMatch || prenomMatch || cinMatch || emailMatch || telephoneMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg p-6 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/user/admin/")}
                className="p-2 hover:bg-gray-100 rounded-full transition-all duration-300 transform hover:scale-105"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Gestion des Fournisseurs</h1>
                  <p className="text-sm text-gray-500">Gérez vos fournisseurs efficacement</p>
                </div>
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
                onClick={() => {
                  setEditingFournisseur(null);
                  setFormData({
                    nom: '',
                    prenom: '',
                    email: '',
                    telephone: '',
                    cin: '',
                    adresse: ''
                  });
                  setShowModal(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg group"
              >
                <Plus className="w-5 h-5 transform group-hover:rotate-90 transition-transform duration-300" />
                <span className="font-medium">Nouveau Fournisseur</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par nom, prénom, CIN, email ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-300 hover:shadow-md"
            />
          </div>
        </div>

        {/* Fournisseurs List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredFournisseurs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CIN</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFournisseurs.map((fournisseur) => (
                    <tr key={fournisseur.id_fournisseur} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{fournisseur.nom || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{fournisseur.prenom || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <FileText className="w-4 h-4 mr-2 text-gray-400" />
                          {fournisseur.cin || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {fournisseur.email || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {fournisseur.telephone || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => navigate(`/user/admin/fournisseurs/details/${fournisseur.id_fournisseur}`)}
                            className="p-2 text-blue-600 hover:text-blue-900 bg-blue-100 rounded-lg transition-colors duration-200"
                            title="Voir les détails"
                          >
                            <Info className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => navigate(`/user/admin/stock?fournisseur=${fournisseur.id_fournisseur}`)}
                            className="p-2 text-green-600 hover:text-green-900 bg-green-100 rounded-lg transition-colors duration-200"
                            title="Ajouter un stock"
                          >
                            <Package className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(fournisseur)}
                            className="p-2 text-blue-600 hover:text-blue-900 bg-blue-100 rounded-lg transition-colors duration-200"
                            title="Modifier"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setFournisseurToDelete(fournisseur);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-red-600 hover:text-red-900 bg-red-100 rounded-lg transition-colors duration-200"
                            title="Supprimer"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">Aucun fournisseur trouvé</p>
            </div>
          )}
        </div>
      </main>

      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 transform transition-all duration-500 ease-in-out ${
          notification.type === 'error' 
            ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-200' 
            : 'bg-gradient-to-r from-green-50 to-green-100 border-green-200'
        } rounded-xl shadow-2xl border backdrop-blur-sm`}>
          <div className="flex items-center p-4 min-w-[300px]">
            <div className={`flex-shrink-0 p-2 rounded-full ${
              notification.type === 'error' 
                ? 'bg-red-100 text-red-500' 
                : 'bg-green-100 text-green-500'
            }`}>
              {notification.type === 'error' ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <CheckCircle className="w-6 h-6" />
              )}
            </div>
            <div className="ml-4 flex-1">
              <p className={`text-sm font-semibold ${
                notification.type === 'error' ? 'text-red-800' : 'text-green-800'
              }`}>
                {notification.type === 'error' ? 'Erreur' : 'Succès'}
              </p>
              <p className={`text-sm ${
                notification.type === 'error' ? 'text-red-600' : 'text-green-600'
              }`}>
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => setNotification({ show: false, message: '', type: '' })}
              className={`ml-4 p-1 rounded-full hover:bg-opacity-10 ${
                notification.type === 'error' 
                  ? 'hover:bg-red-500 text-red-400 hover:text-red-500' 
                  : 'hover:bg-green-500 text-green-400 hover:text-green-500'
              } transition-colors duration-200`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-blue-600" />
                {editingFournisseur ? 'Modifier le Fournisseur' : 'Nouveau Fournisseur'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                        formErrors.nom ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      required
                    />
                    {formErrors.nom && (
                      <div className="mt-1 flex items-center text-sm text-red-600">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {formErrors.nom[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                    <input
                      type="text"
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                        formErrors.prenom ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      required
                    />
                    {formErrors.prenom && (
                      <div className="mt-1 flex items-center text-sm text-red-600">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {formErrors.prenom[0]}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                        formErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      required
                    />
                    {formErrors.email && (
                      <div className="mt-1 flex items-center text-sm text-red-600">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {formErrors.email[0]}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                        formErrors.telephone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      required
                    />
                    {formErrors.telephone && (
                      <div className="mt-1 flex items-center text-sm text-red-600">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {formErrors.telephone[0]}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CIN</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileText className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.cin}
                      onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                        formErrors.cin ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      required
                    />
                    {formErrors.cin && (
                      <div className="mt-1 flex items-center text-sm text-red-600">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {formErrors.cin[0]}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <MapPin className="w-5 h-5 text-gray-400" />
                    </div>
                    <textarea
                      value={formData.adresse}
                      onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                        formErrors.adresse ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      rows="3"
                      required
                    />
                    {formErrors.adresse && (
                      <div className="mt-1 flex items-center text-sm text-red-600">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {formErrors.adresse[0]}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingFournisseur(null);
                      setFormErrors({});
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    {editingFournisseur ? 'Modifier' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && fournisseurToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                Confirmer la suppression
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Êtes-vous sûr de vouloir supprimer le fournisseur "{fournisseurToDelete.nom} {fournisseurToDelete.prenom}" ?
                Cette action est irréversible.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setFournisseurToDelete(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDelete(fournisseurToDelete.id_fournisseur)}
                  className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
