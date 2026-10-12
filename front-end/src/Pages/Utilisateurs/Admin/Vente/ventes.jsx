import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { 
  Plus, Pencil, Trash2, Ticket, ChevronLeft, ChevronRight, 
  CheckCircle, AlertCircle, Printer, Filter, X, FileText, QrCode, TrendingUp, Calendar, DollarSign, Star
} from "lucide-react";
import QRCode from 'qrcode';

const Ventes = () => {
  const [ventes, setVentes] = useState([]);
  const [filteredVentes, setFilteredVentes] = useState([]);
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [servantFilter, setServantFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [servants, setServants] = useState([]);
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedVente, setSelectedVente] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [venteToDelete, setVenteToDelete] = useState(null);

  // Vérification de l'authentification
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (!token || !user) {
      navigate("/login");
    }
  }, [navigate]);

  // Récupération des ventes
  const fetchVentes = async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/sales?page=${page}`);
      if (response.data) {
        setVentes(response.data.data || []);
        setPagination({
          currentPage: response.data.current_page || 1,
          lastPage: response.data.last_page || 1,
        });
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer la liste des serveurs
  useEffect(() => {
    const fetchServants = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/servants");
        setServants(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des serveurs:", error);
      }
    };
    fetchServants();
  }, []);

  // Gestion des erreurs
  const handleError = (error) => {
    if (error.response) {
      setError(`Erreur ${error.response.status}: ${error.response.data.message || "Problème serveur"}`);
    } else if (error.request) {
      setError("Impossible de contacter le serveur. Vérifiez votre connexion.");
    } else {
      setError("Une erreur interne est survenue. Veuillez réessayer.");
    }
  };

  // Pagination
  const handlePagination = (page) => {
    if (page > 0 && page <= pagination.lastPage) {
      setPagination((prev) => ({ ...prev, currentPage: page }));
    }
  };

  // Suppression d'une vente
  const handleDelete = async (saleId) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/sales/${saleId}`);
      setSuccessMessage("✅ Vente supprimée avec succès !");
      fetchVentes(pagination.currentPage);
      setTimeout(() => setSuccessMessage(""), 3000);
      setShowDeleteModal(false);
      setVenteToDelete(null);
    } catch (error) {
      setError("❌ Une erreur est survenue lors de la suppression.");
      setTimeout(() => setError(""), 3000);
    }
  };

  // Édition d'une vente
  const handleEdit = (id) => {
    navigate(`/payment/${id}`);
  };

  // Impression du ticket
  const handlePrint = (id) => {
    window.open(`/ticket/${id}`, "_blank");
  };

  // Filtrage des ventes
  useEffect(() => {
    let filtered = [...ventes];
    
    if (paymentTypeFilter !== "all") {
      filtered = filtered.filter(vente => {
        const type = vente.payment_type?.toLowerCase() || '';
        const filter = paymentTypeFilter.toLowerCase();
        
        if (filter === 'carte') {
          return type === 'carte' || type === 'card';
        } else if (filter === 'espèces') {
          const especesVariations = [
            'espèces', 'especes', 'espèce', 'espece', 'cash',
            'espaces', 'espace', 'especes', 'espèces', 'espèce',
            'espece', 'espaces', 'espace', 'cash', 'especes',
            'espèces', 'espèce', 'espece', 'espaces', 'espace'
          ];
          return especesVariations.includes(type);
        }
        return false;
      });
    }
    
    if (paymentStatusFilter !== "all") {
      filtered = filtered.filter(vente => {
        const status = vente.payment_status?.toLowerCase() || '';
        const filter = paymentStatusFilter.toLowerCase();
        
        if (filter === 'payé') {
          return status === 'payé' || status === 'paye' || status === 'paid';
        } else if (filter === 'en attente') {
          return status === 'en attente' || status === 'en_attente' || status === 'pending';
        }
        return false;
      });
    }

    if (servantFilter !== "all") {
      filtered = filtered.filter(vente => vente.servant?.id === parseInt(servantFilter));
    }

    // Filtrage par date
    if (dateRange.startDate) {
      const startDate = new Date(dateRange.startDate);
      filtered = filtered.filter(vente => new Date(vente.created_at) >= startDate);
    }

    if (dateRange.endDate) {
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999); // Inclure toute la journée de fin
      filtered = filtered.filter(vente => new Date(vente.created_at) <= endDate);
    }
    
    setFilteredVentes(filtered);
  }, [ventes, paymentTypeFilter, paymentStatusFilter, servantFilter, dateRange]);

  useEffect(() => {
    fetchVentes(pagination.currentPage);
  }, [pagination.currentPage]);

  // Fonction pour générer le PDF des commandes d'un serveur
  const handleGenerateServerPDF = (servant) => {
    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank');
    
    // Filtrer les ventes pour ce serveur
    const servantVentes = ventes.filter(vente => vente.servant?.id === servant.id);
    
    // Calculer le total des ventes
    const totalVentes = servantVentes.reduce((sum, vente) => sum + parseFloat(vente.total_price), 0);
    
    // Créer le contenu HTML pour l'impression
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rapport des ventes - ${servant.name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #2563eb;
            }
            .servant-info {
              margin-bottom: 20px;
              padding: 15px;
              background-color: #f8fafc;
              border-radius: 8px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #e2e8f0;
            }
            th {
              background-color: #f1f5f9;
              font-weight: bold;
            }
            .total {
              text-align: right;
              font-size: 1.2em;
              font-weight: bold;
              margin-top: 20px;
              padding: 10px;
              background-color: #f8fafc;
              border-radius: 8px;
            }
            @media print {
              body {
                margin: 0;
                padding: 20px;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Rapport des ventes</h1>
            <p>Généré le ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="servant-info">
            <h2>Serveur: ${servant.name}</h2>
            <p>Email: ${servant.email}</p>
            <p>Téléphone: ${servant.phone}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Table</th>
                <th>Menus</th>
                <th>Type Paiement</th>
                <th>Statut</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${servantVentes.map(vente => `
                <tr>
                  <td>${new Date(vente.created_at).toLocaleDateString()}</td>
                  <td>${vente.table?.name || 'N/A'}</td>
                  <td>${vente.menus?.map(menu => `${menu.title} (${menu.quantity})`).join(', ') || 'N/A'}</td>
                  <td>${vente.payment_type}</td>
                  <td>${vente.payment_status}</td>
                  <td>${vente.total_price} DH</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total">
            Total des ventes: ${totalVentes.toFixed(2)} DH
          </div>

          <div class="no-print" style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()" style="
              padding: 10px 20px;
              background-color: #2563eb;
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              font-size: 16px;
            ">
              Imprimer le rapport
            </button>
          </div>
        </body>
      </html>
    `;
    
    // Écrire le contenu dans la nouvelle fenêtre
    printWindow.document.write(content);
    printWindow.document.close();
  };

  // Fonction pour générer et afficher le QR code
  const handleShowQRCode = async (vente) => {
    setSelectedVente(vente);
    const qrData = {
      id: vente.id,
      date: vente.created_at,
      table: vente.table?.name,
      servant: vente.servant?.name,
      total: vente.total_price,
      status: vente.payment_status,
      menus: vente.menus
    };

    try {
      const qrUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      setQrCodeUrl(qrUrl);
      setShowQRModal(true);
    } catch (err) {
      console.error('Erreur lors de la génération du QR code:', err);
    }
  };

  // Fonction pour ouvrir la modal de confirmation
  const confirmDelete = (vente) => {
    setVenteToDelete(vente);
    setShowDeleteModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      {/* En-tête avec titre et bouton de retour */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Ventes</h1>
          <Link
            to="/user/admin"
            className="group relative inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 no-underline"
          >
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 opacity-100 group-hover:opacity-0 transition-opacity duration-300"></div>
            <span className="relative flex items-center gap-2">
              <ChevronLeft className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
              <span className="relative">
                Retour à l'administration
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
              </span>
            </span>
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Ventes</p>
              <p className="text-lg font-semibold text-gray-900">{ventes.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ventes Aujourd'hui</p>
              <p className="text-lg font-semibold text-gray-900">
                {ventes.filter(vente => {
                  const venteDate = new Date(vente.created_at);
                  const today = new Date();
                  return venteDate.toDateString() === today.toDateString();
                }).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <DollarSign className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Aujourd'hui</p>
              <p className="text-lg font-semibold text-gray-900">
                {ventes
                  .filter(vente => {
                    const venteDate = new Date(vente.created_at);
                    const today = new Date();
                    return venteDate.toDateString() === today.toDateString();
                  })
                  .reduce((total, vente) => total + parseFloat(vente.total_price), 0)
                  .toFixed(2)} DH
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <Star className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Meilleure Vente</p>
              <p className="text-lg font-semibold text-gray-900">
                {Math.max(...ventes.map(vente => parseFloat(vente.total_price))).toFixed(2)} DH
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Titre et bouton d'ajout */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-0">
            🛒 Gestion des Ventes
          </h2>
          <Link 
            to="/payment" 
            className="no-underline w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
          >
            <Plus size={18} />
            <span>Nouvelle Vente</span>
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div className="max-w-7xl mx-auto">
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <CheckCircle className="text-green-500 mr-3" size={20} />
              <p className="text-green-700">{successMessage}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <AlertCircle className="text-red-500 mr-3" size={20} />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Filtres */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Filtre par date */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Période
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Date de début"
                  />
                </div>
                <div>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Date de fin"
                  />
                </div>
              </div>
            </div>

            {/* Filtre Type de Paiement */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de Paiement
              </label>
              <div className="relative">
                <select
                  value={paymentTypeFilter}
                  onChange={(e) => setPaymentTypeFilter(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="all">Tous les types</option>
                  <option value="carte">Carte</option>
                  <option value="espèces">Espèces</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Filter className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Filtre Statut de Paiement */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut de Paiement
              </label>
              <div className="relative">
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="payé">Payé</option>
                  <option value="en attente">En attente</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Filter className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Filtre Serveur */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Serveur
              </label>
              <div className="relative">
                <select
                  value={servantFilter}
                  onChange={(e) => setServantFilter(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="all">Tous les serveurs</option>
                  {servants.map((servant) => (
                    <option key={servant.id} value={servant.id}>
                      {servant.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Filter className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Bouton d'impression */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  const printWindow = window.open('', '_blank');
                  const selectedServant = servants.find(s => s.id === parseInt(servantFilter));
                  const filteredVentesToPrint = filteredVentes;
                  const totalVentes = filteredVentesToPrint.reduce((sum, vente) => sum + parseFloat(vente.total_price), 0);
                  
                  const content = `
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <title>Rapport des ventes${selectedServant ? ` - ${selectedServant.name}` : ''}</title>
                        <style>
                          body {
                            font-family: Arial, sans-serif;
                            margin: 20px;
                            color: #333;
                          }
                          .header {
                            text-align: center;
                            margin-bottom: 30px;
                            padding-bottom: 20px;
                            border-bottom: 2px solid #2563eb;
                          }
                          .filters-info {
                            margin-bottom: 20px;
                            padding: 15px;
                            background-color: #f8fafc;
                            border-radius: 8px;
                          }
                          table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 20px;
                          }
                          th, td {
                            padding: 12px;
                            text-align: left;
                            border-bottom: 1px solid #e2e8f0;
                          }
                          th {
                            background-color: #f1f5f9;
                            font-weight: bold;
                          }
                          .total {
                            text-align: right;
                            font-size: 1.2em;
                            font-weight: bold;
                            margin-top: 20px;
                            padding: 10px;
                            background-color: #f8fafc;
                            border-radius: 8px;
                          }
                          @media print {
                            body {
                              margin: 0;
                              padding: 20px;
                            }
                            .no-print {
                              display: none;
                            }
                          }
                        </style>
                      </head>
                      <body>
                        <div class="header">
                          <h1>Rapport des ventes</h1>
                          <p>Généré le ${new Date().toLocaleDateString()}</p>
                        </div>
                        
                        <div class="filters-info">
                          <h2>Filtres appliqués:</h2>
                          <p>Type de paiement: ${paymentTypeFilter === 'all' ? 'Tous' : paymentTypeFilter}</p>
                          <p>Statut de paiement: ${paymentStatusFilter === 'all' ? 'Tous' : paymentStatusFilter}</p>
                          <p>Serveur: ${selectedServant ? selectedServant.name : 'Tous'}</p>
                        </div>

                        <table>
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Table</th>
                              <th>Serveur</th>
                              <th>Menus</th>
                              <th>Type Paiement</th>
                              <th>Statut</th>
                              <th>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${filteredVentesToPrint.map(vente => `
                              <tr>
                                <td>${new Date(vente.created_at).toLocaleDateString()}</td>
                                <td>${vente.table?.name || 'N/A'}</td>
                                <td>${vente.servant?.name || 'N/A'}</td>
                                <td>${vente.menus?.map(menu => `${menu.title} (${menu.quantity})`).join(', ') || 'N/A'}</td>
                                <td>${vente.payment_type}</td>
                                <td>${vente.payment_status}</td>
                                <td>${vente.total_price} DH</td>
                              </tr>
                            `).join('')}
                          </tbody>
                        </table>

                        <div class="total">
                          Total des ventes: ${totalVentes.toFixed(2)} DH
                        </div>

                        <div class="no-print" style="text-align: center; margin-top: 20px;">
                          <button onclick="window.print()" style="
                            padding: 10px 20px;
                            background-color: #2563eb;
                            color: white;
                            border: none;
                            border-radius: 5px;
                            cursor: pointer;
                            font-size: 16px;
                          ">
                            Imprimer le rapport
                          </button>
                        </div>
                      </body>
                    </html>
                  `;
                  
                  printWindow.document.write(content);
                  printWindow.document.close();
                }}
                className="group relative inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 opacity-100 group-hover:opacity-0 transition-opacity duration-300"></div>
                <span className="relative flex items-center gap-2">
                  <Printer className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                  <span className="relative">
                    Imprimer
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
                  </span>
                </span>
              </button>
            </div>

            {/* Bouton Réinitialiser */}
            {(paymentTypeFilter !== "all" || paymentStatusFilter !== "all" || servantFilter !== "all" || dateRange.startDate || dateRange.endDate) && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setPaymentTypeFilter("all");
                    setPaymentStatusFilter("all");
                    setServantFilter("all");
                    setDateRange({ startDate: "", endDate: "" });
                  }}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  <X className="h-4 w-4 mr-2" />
                  Réinitialiser
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal QR Code */}
      {showQRModal && selectedVente && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 transform transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Détails de la vente #{selectedVente.id}</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* QR Code Section */}
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <img src={qrCodeUrl} alt="QR Code" className="mx-auto mb-4" />
                <p className="text-sm text-gray-600">Scannez pour voir les détails</p>
              </div>

              {/* Details Section */}
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Informations Générales</h4>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Date:</span> {new Date(selectedVente.created_at).toLocaleString()}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Table:</span> {selectedVente.table?.name || 'N/A'}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Serveur:</span> {selectedVente.servant?.name || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Détails de la Commande</h4>
                  <div className="space-y-2">
                    {selectedVente.menus?.map((menu, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{menu.title} x{menu.quantity}</span>
                        <span className="font-medium">{(menu.price * menu.quantity).toFixed(2)} DH</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">Paiement</h4>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Type:</span> {selectedVente.payment_type}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Statut:</span> {selectedVente.payment_status}
                    </p>
                    <p className="text-sm font-bold">
                      <span className="font-medium">Total:</span> {selectedVente.total_price} DH
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowQRModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center gap-2"
              >
                <X size={18} />
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && venteToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 transform transition-all">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
            </div>
            
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Confirmer la suppression
              </h3>
              <p className="text-gray-600">
                Êtes-vous sûr de vouloir supprimer cette vente ?
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium text-gray-700">ID:</span> {venteToDelete.id}
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Table:</span> {venteToDelete.table?.name || 'N/A'}
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Total:</span> {venteToDelete.total_price} DH
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Date:</span> {new Date(venteToDelete.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setVenteToDelete(null);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center gap-2"
              >
                <X size={18} />
                Annuler
              </button>
              <button
                onClick={() => handleDelete(venteToDelete.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center gap-2"
              >
                <Trash2 size={18} />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tableau des ventes */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredVentes.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-500 text-lg">Aucune vente trouvée.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Menus</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serveur</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type Paiement</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">État Paiement</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVentes.map((vente) => (
                    <tr key={vente.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {new Date(vente.created_at).toLocaleString('fr-FR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {vente.menus?.length ? (
                          <ul className="list-disc list-inside">
                            {vente.menus.map((menu) => (
                              <li key={menu.id}>
                                {menu.title} - Qté: {menu.quantity}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{vente.table?.name || "N/A"}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{vente.servant?.name || "N/A"}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{vente.total_price} DH</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          vente.payment_type === '3 espace' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {vente.payment_type === '3 espace' ? '3 Espace' : vente.payment_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          vente.payment_status === 'payé' 
                            ? 'bg-green-100 text-green-800' 
                            : vente.payment_status === 'en attente'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {vente.payment_status === 'payé' 
                            ? 'Payé' 
                            : vente.payment_status === 'en attente'
                            ? 'En attente'
                            : vente.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right space-x-2">
                        <button 
                          onClick={() => handleShowQRCode(vente)}
                          className="inline-flex items-center p-1.5 border border-transparent rounded-full text-purple-600 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
                          title="Voir QR Code"
                        >
                          <QrCode size={16} />
                        </button>
                        <button 
                          onClick={() => handleEdit(vente.id)}
                          className="inline-flex items-center p-1.5 border border-transparent rounded-full text-blue-600 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                          title="Modifier"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => confirmDelete(vente)}
                          className="inline-flex items-center p-1.5 border border-transparent rounded-full text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            const printWindow = window.open('', '_blank');
                            
                            // Générer le QR code
                            const qrData = {
                              id: vente.id,
                              date: vente.created_at,
                              table: vente.table?.name,
                              servant: vente.servant?.name,
                              total: vente.total_price,
                              status: vente.payment_status
                            };

                            QRCode.toDataURL(JSON.stringify(qrData), { 
                              width: 128,
                              margin: 1,
                              color: {
                                dark: '#000000',
                                light: '#ffffff'
                              }
                            }, (err, qrUrl) => {
                              if (err) console.error(err);
                              
                              const content = `
                                <!DOCTYPE html>
                                <html>
                                  <head>
                                    <title>Ticket de vente #${vente.id}</title>
                                    <style>
                                      @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;600&display=swap');
                                      
                                      body {
                                        font-family: 'Roboto Mono', monospace;
                                        margin: 0;
                                        padding: 20px;
                                        color: #000;
                                        background: #fff;
                                        width: 300px;
                                        margin: 0 auto;
                                      }
                                      
                                      .ticket {
                                        border: 1px dashed #000;
                                        padding: 20px;
                                        position: relative;
                                      }
                                      
                                      .ticket::before,
                                      .ticket::after {
                                        content: '';
                                        position: absolute;
                                        left: 50%;
                                        width: 40px;
                                        height: 40px;
                                        background: #fff;
                                        border: 1px dashed #000;
                                        border-radius: 50%;
                                        transform: translateX(-50%);
                                      }
                                      
                                      .ticket::before {
                                        top: -20px;
                                      }
                                      
                                      .ticket::after {
                                        bottom: -20px;
                                      }
                                      
                                      .header {
                                        text-align: center;
                                        margin-bottom: 20px;
                                        padding-bottom: 10px;
                                        border-bottom: 1px dashed #000;
                                      }
                                      
                                      .header h1 {
                                        font-size: 18px;
                                        margin: 0;
                                        font-weight: 600;
                                      }
                                      
                                      .header p {
                                        font-size: 12px;
                                        margin: 5px 0;
                                      }
                                      
                                      .info-section {
                                        margin-bottom: 15px;
                                        font-size: 12px;
                                      }
                                      
                                      .info-section p {
                                        margin: 3px 0;
                                        display: flex;
                                        justify-content: space-between;
                                      }
                                      
                                      .menu-list {
                                        margin: 15px 0;
                                        border-top: 1px dashed #000;
                                        border-bottom: 1px dashed #000;
                                        padding: 10px 0;
                                      }
                                      
                                      .menu-list h3 {
                                        font-size: 14px;
                                        margin: 0 0 10px 0;
                                        text-align: center;
                                      }
                                      
                                      .menu-item {
                                        font-size: 12px;
                                        margin: 5px 0;
                                        display: flex;
                                        justify-content: space-between;
                                      }
                                      
                                      .menu-item .quantity {
                                        margin: 0 10px;
                                      }
                                      
                                      .total {
                                        text-align: right;
                                        font-size: 14px;
                                        font-weight: 600;
                                        margin-top: 15px;
                                        padding-top: 10px;
                                        border-top: 1px dashed #000;
                                      }
                                      
                                      .footer {
                                        text-align: center;
                                        margin-top: 20px;
                                        font-size: 11px;
                                        color: #666;
                                      }
                                      
                                      .barcode {
                                        text-align: center;
                                        margin: 20px 0;
                                        font-size: 24px;
                                        letter-spacing: 2px;
                                      }

                                      .qr-section {
                                        text-align: center;
                                        margin: 15px 0;
                                        padding: 10px;
                                        border: 1px dashed #000;
                                      }

                                      .qr-section img {
                                        width: 100px;
                                        height: 100px;
                                        margin: 0 auto;
                                      }

                                      .qr-section p {
                                        font-size: 10px;
                                        margin: 5px 0;
                                        color: #666;
                                      }
                                      
                                      @media print {
                                        body {
                                          width: 300px;
                                          margin: 0 auto;
                                        }
                                        .no-print {
                                          display: none;
                                        }
                                      }
                                    </style>
                                  </head>
                                  <body>
                                    <div class="ticket">
                                      <div class="header">
                                        <h1>RESTAURANT</h1>
                                        <p>Ticket de vente #${vente.id}</p>
                                        <p>${new Date(vente.created_at).toLocaleDateString()} ${new Date(vente.created_at).toLocaleTimeString()}</p>
                                      </div>
                                      
                                      <div class="info-section">
                                        <p>
                                          <span>Table:</span>
                                          <span>${vente.table?.name || 'N/A'}</span>
                                        </p>
                                        <p>
                                          <span>Serveur:</span>
                                          <span>${vente.servant?.name || 'N/A'}</span>
                                        </p>
                                        <p>
                                          <span>Type de paiement:</span>
                                          <span>${vente.payment_type}</span>
                                        </p>
                                        <p>
                                          <span>Statut:</span>
                                          <span>${vente.payment_status}</span>
                                        </p>
                                      </div>

                                      <div class="menu-list">
                                        <h3>DÉTAIL DE LA COMMANDE</h3>
                                        ${vente.menus?.map(menu => `
                                          <div class="menu-item">
                                            <span>${menu.title}</span>
                                            <span class="quantity">x${menu.quantity}</span>
                                            <span>${(menu.price * menu.quantity).toFixed(2)} DH</span>
                                          </div>
                                        `).join('') || '<p>Aucun menu</p>'}
                                      </div>

                                      <div class="total">
                                        <p>TOTAL: ${vente.total_price} DH</p>
                                      </div>

                                      <div class="qr-section">
                                        <img src="${qrUrl}" alt="QR Code" />
                                        <p>Scannez pour plus d'informations</p>
                                      </div>

                                      <div class="barcode">
                                        ||||||||||||||||||
                                      </div>

                                      <div class="footer">
                                        <p>Merci de votre visite!</p>
                                        <p>${new Date().toLocaleDateString()}</p>
                                      </div>
                                    </div>

                                    <div class="no-print" style="text-align: center; margin-top: 20px;">
                                      <button onclick="window.print()" style="
                                        padding: 10px 20px;
                                        background-color: #000;
                                        color: white;
                                        border: none;
                                        border-radius: 5px;
                                        cursor: pointer;
                                        font-size: 14px;
                                        font-family: 'Roboto Mono', monospace;
                                      ">
                                        Imprimer le ticket
                                      </button>
                                    </div>
                                  </body>
                                </html>
                              `;
                              
                              printWindow.document.write(content);
                              printWindow.document.close();
                            });
                          }}
                          className="inline-flex items-center p-1.5 border border-transparent rounded-full text-green-600 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                          title="Imprimer le ticket"
                        >
                          <Printer size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && filteredVentes.length > 0 && pagination.lastPage > 1 && (
        <div className="max-w-7xl mx-auto mt-8">
          <nav className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Affichage de <span className="font-medium">{(pagination.currentPage - 1) * 15 + 1}</span> à{" "}
                  <span className="font-medium">{Math.min(pagination.currentPage * 15, filteredVentes.length)}</span> sur{" "}
                  <span className="font-medium">{filteredVentes.length}</span> résultats
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => handlePagination(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {Array.from({ length: Math.min(5, pagination.lastPage) }).map((_, index) => {
                    const pageNum = Math.max(1, pagination.currentPage - 2 + index);
                    if (pageNum > pagination.lastPage) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePagination(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          pagination.currentPage === pageNum 
                            ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600' 
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePagination(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.lastPage}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Ventes;