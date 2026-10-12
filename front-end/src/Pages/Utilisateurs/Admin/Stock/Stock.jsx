import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, ArrowLeft, Package, X, CheckCircle, AlertCircle, AlertTriangle, Eye, Filter, CalendarDays, Printer } from 'lucide-react';
import api from '../../../../Api/api';

function Stock() {
  const navigate = useNavigate();
  const location = useLocation();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stockToDelete, setStockToDelete] = useState(null);
  const [editingStock, setEditingStock] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    nom_produit: '',
    nombre_produit: '',
    quantite: '',
    prix_stock: '',
    date_entree_stock: '',
    date_expiration: '',
    id_fournisseur: ''
  });
  const [fournisseurs, setFournisseurs] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedFournisseur, setSelectedFournisseur] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchStocks();
    fetchFournisseurs();
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const fournisseurId = searchParams.get('fournisseur');
    
    if (fournisseurId) {
      setShowModal(true);
      setFormData(prev => ({
        ...prev,
        id_fournisseur: fournisseurId
      }));
    }
  }, [location.search]);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 2000);
  };

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/stocks');
      if (response.data) {
        setStocks(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des stocks:', error);
      showNotification(error.response?.data?.message || 'Erreur lors du chargement des stocks', 'error');
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFournisseurs = async () => {
    try {
      const response = await api.get('/fournisseurs');
      if (response.data) {
        setFournisseurs(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des fournisseurs:', error);
      showNotification(error.response?.data?.message || 'Erreur lors du chargement des fournisseurs', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    try {
      const stockData = {
        nom_produit: formData.nom_produit,
        nombre_produit: parseInt(formData.nombre_produit),
        quantite: parseInt(formData.quantite),
        prix_stock: parseFloat(formData.prix_stock),
        date_entree_stock: formData.date_entree_stock,
        date_expiration: formData.date_expiration,
        id_fournisseur: parseInt(formData.id_fournisseur)
      };

      if (editingStock) {
        const response = await api.put(`/stocks/${editingStock.id_stock}`, stockData);
        showNotification(response.data?.message || 'Stock modifié avec succès');
      } else {
        const response = await api.post('/stocks', stockData);
        showNotification(response.data?.message || 'Stock ajouté avec succès');
      }

      setShowModal(false);
      setEditingStock(null);
      setFormData({
        nom_produit: '',
        nombre_produit: '',
        quantite: '',
        prix_stock: '',
        date_entree_stock: '',
        date_expiration: '',
        id_fournisseur: ''
      });

      await fetchStocks();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du stock:', error);
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const mappedErrors = {
          nom_produit: errors.nom_produit,
          nombre_produit: errors.nombre_produit,
          quantite: errors.quantite,
          prix_stock: errors.prix_stock,
          id_fournisseur: errors.id_fournisseur,
          date_entree_stock: errors.date_entree_stock,
          date_expiration: errors.date_expiration
        };
        setFormErrors(mappedErrors);
        
        const firstError = Object.values(mappedErrors)[0];
        if (firstError) {
          showNotification(firstError[0], 'error');
        }
      } else {
        showNotification(error.response?.data?.message || 'Erreur lors de la sauvegarde du stock', 'error');
      }
    }
  };

  const handleEdit = (stock) => {
    setEditingStock(stock);
    setFormData({
      nom_produit: stock.nom_produit || '',
      nombre_produit: stock.nombre_produit?.toString() || '',
      quantite: stock.quantite?.toString() || '',
      prix_stock: stock.prix_stock?.toString() || '',
      date_entree_stock: stock.date_entree_stock || '',
      date_expiration: stock.date_expiration || '',
      id_fournisseur: stock.id_fournisseur || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/stocks/${id}`);
      showNotification(response.data?.message || 'Stock supprimé avec succès');
      await fetchStocks();
      setShowDeleteModal(false);
      setStockToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression du stock:', error);
      showNotification(error.response?.data?.message || 'Erreur lors de la suppression du stock', 'error');
    }
  };

  const handleDateFilterChange = (e) => {
    const selectedDate = e.target.value;
    setDateFilter(selectedDate);
  };

  const resetFilters = () => {
    setSelectedFournisseur('');
    setDateFilter('');
    setSearchTerm('');
  };

  const getUniqueFournisseurs = () => {
    const uniqueFournisseurs = new Map();
    stocks.forEach(stock => {
      if (stock.fournisseur && !uniqueFournisseurs.has(stock.fournisseur.id_fournisseur)) {
        uniqueFournisseurs.set(stock.fournisseur.id_fournisseur, stock.fournisseur);
      }
    });
    return Array.from(uniqueFournisseurs.values());
  };

  const filteredStocks = stocks.filter(stock => {
    const matchesSearch = (stock?.nom_produit?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesFournisseur = !selectedFournisseur || stock?.id_fournisseur === parseInt(selectedFournisseur);
    
    let matchesDate = true;
    if (dateFilter && stock?.created_at) {
      const stockDate = new Date(stock.created_at);
      const filterDate = new Date(dateFilter);
      
      matchesDate = stockDate.toDateString() === filterDate.toDateString();
    }
    
    return matchesSearch && matchesFournisseur && matchesDate;
  }).reverse();

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const stocksToPrint = filteredStocks;
    const currentDate = new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Liste des Stocks</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            body {
              font-family: 'Inter', sans-serif;
              margin: 0;
              padding: 20px;
              color: #1f2937;
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
            
            .price {
              color: #2563eb;
              font-weight: 500;
            }
            
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #6b7280;
              border-top: 1px solid #e5e7eb;
              padding-top: 20px;
            }
            
            @media print {
              body {
                padding: 0;
              }
              
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Liste des Stocks</h1>
            <p>Date d'impression: ${currentDate}</p>
          </div>
          
          <div class="filters">
            <p><strong>Filtres appliqués:</strong></p>
            ${searchTerm ? `<p>Recherche: ${searchTerm}</p>` : ''}
            ${selectedFournisseur ? `<p>Fournisseur: ${getUniqueFournisseurs().find(f => f.id_fournisseur === parseInt(selectedFournisseur))?.nom}</p>` : ''}
            ${dateFilter ? `<p>Date: ${new Date(dateFilter).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>` : ''}
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Nom Produit</th>
                <th>Prix</th>
                <th>Fournisseur</th>
                <th>Date Création</th>
              </tr>
            </thead>
            <tbody>
              ${stocksToPrint.map(stock => `
                <tr>
                  <td>${stock.nom_produit || '-'}</td>
                  <td class="price">${stock.prix_stock ? `${stock.prix_stock} €` : '-'}</td>
                  <td>${stock.fournisseur ? `${stock.fournisseur.nom} ${stock.fournisseur.prenom}` : '-'}</td>
                  <td>${stock.created_at ? new Date(stock.created_at).toLocaleDateString() : '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Total des articles: ${stocksToPrint.length}</p>
            <p>Document généré automatiquement</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
                <AlertCircle className="w-6 h-6" />
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
          <div className={`h-1 w-full rounded-b-xl ${
            notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'
          } animate-shrink`}></div>
        </div>
      )}

      <header className="bg-white shadow-lg p-6 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/user/admin/")}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Gestion des Stocks
              </h1>
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
                  setEditingStock(null);
                  setFormData({
                    nom_produit: '',
                    nombre_produit: '',
                    quantite: '',
                    prix_stock: '',
                    date_entree_stock: '',
                    date_expiration: '',
                    id_fournisseur: ''
                  });
                  setShowModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Nouvel Article</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Rechercher un article..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="ml-4 px-4 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">Filtres</span>
            </button>
          </div>

          {showFilters && (
            <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 animate-slide-down">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filtrer par fournisseur
                  </label>
                  <select
                    value={selectedFournisseur}
                    onChange={(e) => setSelectedFournisseur(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tous les fournisseurs</option>
                    {getUniqueFournisseurs().map((fournisseur) => (
                      <option key={fournisseur.id_fournisseur} value={fournisseur.id_fournisseur}>
                        {fournisseur.nom} {fournisseur.prenom}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filtrer par date de création
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={handleDateFilterChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      max={new Date().toISOString().split('T')[0]}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          )}

          {(selectedFournisseur || dateFilter || searchTerm) && (
            <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
              <span>Filtres actifs :</span>
              {selectedFournisseur && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  Fournisseur: {getUniqueFournisseurs().find(f => f.id_fournisseur === parseInt(selectedFournisseur))?.nom}
                </span>
              )}
              {dateFilter && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center gap-1">
                  <CalendarDays className="w-4 h-4" />
                  {new Date(dateFilter).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              )}
              {searchTerm && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  Recherche: {searchTerm}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredStocks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom Produit</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fournisseur</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Création</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStocks.map((stock) => (
                    <tr key={stock.id_stock} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{stock.nom_produit || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600">{stock.prix_stock ? `${stock.prix_stock} €` : '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {stock.fournisseur ? `${stock.fournisseur.nom} ${stock.fournisseur.prenom}` : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {stock.created_at ? new Date(stock.created_at).toLocaleDateString() : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => navigate(`/user/admin/stock/details/${stock.id_stock}`)}
                          className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                          title="Voir détails"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(stock)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                          title="Modifier"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setStockToDelete(stock);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200"
                          title="Supprimer"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Aucun article trouvé</p>
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {editingStock ? 'Modifier l\'Article' : 'Nouvel Article'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom Produit</label>
                  <input
                    type="text"
                    name="nom_produit"
                    value={formData.nom_produit}
                    onChange={(e) => setFormData({ ...formData, nom_produit: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.nom_produit ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    required
                  />
                  {formErrors.nom_produit && (
                    <div className="mt-1 flex items-center text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {formErrors.nom_produit[0]}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Produit</label>
                  <input
                    type="number"
                    name="nombre_produit"
                    value={formData.nombre_produit}
                    onChange={(e) => setFormData({ ...formData, nombre_produit: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.nombre_produit ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    required
                    min="0"
                  />
                  {formErrors.nombre_produit && (
                    <div className="mt-1 flex items-center text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {formErrors.nombre_produit[0]}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                  <input
                    type="number"
                    name="quantite"
                    value={formData.quantite}
                    onChange={(e) => setFormData({ ...formData, quantite: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.quantite ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    required
                    min="0"
                  />
                  {formErrors.quantite && (
                    <div className="mt-1 flex items-center text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {formErrors.quantite[0]}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix</label>
                  <input
                    type="number"
                    name="prix_stock"
                    value={formData.prix_stock}
                    onChange={(e) => setFormData({ ...formData, prix_stock: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.prix_stock ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    required
                    min="0"
                    step="0.01"
                  />
                  {formErrors.prix_stock && (
                    <div className="mt-1 flex items-center text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {formErrors.prix_stock[0]}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date d'entrée</label>
                  <input
                    type="date"
                    name="date_entree_stock"
                    value={formData.date_entree_stock}
                    onChange={(e) => setFormData({ ...formData, date_entree_stock: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.date_entree_stock ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    required
                  />
                  {formErrors.date_entree_stock && (
                    <div className="mt-1 flex items-center text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {formErrors.date_entree_stock[0]}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date d'expiration</label>
                  <input
                    type="date"
                    name="date_expiration"
                    value={formData.date_expiration}
                    onChange={(e) => setFormData({ ...formData, date_expiration: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.date_expiration ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    required
                  />
                  {formErrors.date_expiration && (
                    <div className="mt-1 flex items-center text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {formErrors.date_expiration[0]}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                  <select
                    name="id_fournisseur"
                    value={formData.id_fournisseur}
                    onChange={(e) => setFormData({ ...formData, id_fournisseur: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.id_fournisseur ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Sélectionner un fournisseur</option>
                    {fournisseurs.map((fournisseur) => (
                      <option key={fournisseur.id_fournisseur} value={fournisseur.id_fournisseur}>
                        {fournisseur.nom} {fournisseur.prenom}
                      </option>
                    ))}
                  </select>
                  {formErrors.id_fournisseur && (
                    <div className="mt-1 flex items-center text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {formErrors.id_fournisseur[0]}
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingStock(null);
                      setFormErrors({});
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingStock ? 'Modifier' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && stockToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                Confirmer la suppression
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Êtes-vous sûr de vouloir supprimer l'article "{stockToDelete.nom_produit}" du stock ?
                Cette action est irréversible.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setStockToDelete(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDelete(stockToDelete.id_stock)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDetailsModal && selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full transform transition-all animate-scale-in">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Détails de l'article</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Nom du produit</h3>
                    <p className="mt-1 text-lg text-gray-900">{selectedStock.nom_produit}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Nombre de produits</h3>
                    <p className="mt-1 text-lg text-gray-900">{selectedStock.nombre_produit}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Quantité</h3>
                    <p className="mt-1 text-lg text-gray-900">{selectedStock.quantite}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Prix</h3>
                    <p className="mt-1 text-lg text-blue-600 font-semibold">{selectedStock.prix_stock} €</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Fournisseur</h3>
                    <p className="mt-1 text-lg text-gray-900">
                      {selectedStock.fournisseur ? `${selectedStock.fournisseur.nom} ${selectedStock.fournisseur.prenom}` : '-'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date d'entrée</h3>
                    <p className="mt-1 text-lg text-gray-900">{selectedStock.date_entree_stock}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date d'expiration</h3>
                    <p className="mt-1 text-lg text-gray-900">{selectedStock.date_expiration}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date de création</h3>
                    <p className="mt-1 text-lg text-gray-900">
                      {new Date(selectedStock.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes slide-down {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }

        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Stock;
