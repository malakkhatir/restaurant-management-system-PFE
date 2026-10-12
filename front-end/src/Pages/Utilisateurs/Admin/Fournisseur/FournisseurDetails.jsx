import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Phone, Mail, MapPin, User, FileText, Package, Plus, Calendar, DollarSign, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const FournisseurDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fournisseur, setFournisseur] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFournisseurDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://127.0.0.1:8000/api/fournisseurs/${id}`);
        
        // La réponse contient un tableau avec [stocks, fournisseur]
        if (response.data && Array.isArray(response.data) && response.data.length === 2) {
          setStocks(response.data[0]); // Premier élément : stocks
          setFournisseur(response.data[1]); // Deuxième élément : fournisseur
        } else {
          setError("Format de données invalide");
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setError("Fournisseur non trouvé");
        } else {
          setError("Erreur lors du chargement des données");
        }
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFournisseurDetails();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate("/user/admin/fournisseur")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  if (!fournisseur) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <p className="text-gray-600">Fournisseur non trouvé</p>
          <button
            onClick={() => navigate("/user/admin/fournisseur")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg p-6 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/user/admin/fournisseur")}
                className="p-2 hover:bg-gray-100 rounded-full transition-all duration-300 transform hover:scale-105"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Détails du Fournisseur</h1>
                  <p className="text-sm text-gray-500">Informations complètes et stocks associés</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate(`/user/admin/stock?fournisseur=${id}`)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg group"
            >
              <Plus className="w-5 h-5 transform group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-medium">Ajouter un Stock</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto">
        {/* Informations du Fournisseur */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <User className="w-6 h-6 text-blue-600" />
            Informations Personnelles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Nom</label>
                <p className="mt-1 text-lg text-gray-900">{fournisseur.nom}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Prénom</label>
                <p className="mt-1 text-lg text-gray-900">{fournisseur.prenom}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">CIN</label>
                <p className="mt-1 text-lg text-gray-900">{fournisseur.cin}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="mt-1 text-lg text-gray-900 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-gray-400" />
                  {fournisseur.email}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Téléphone</label>
                <p className="mt-1 text-lg text-gray-900 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-gray-400" />
                  {fournisseur.telephone}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Adresse</label>
                <p className="mt-1 text-lg text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  {fournisseur.adresse}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des Stocks */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-600" />
              Stocks Associés
            </h2>
          </div>
          {stocks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date d'ajout</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stocks.map((stock) => (
                    <tr key={stock.id_stock} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{stock.nom_produit}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{stock.quantite}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                          {stock.prix_stock} DH
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {formatDate(stock.created_at)}
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
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">Aucun stock associé à ce fournisseur</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FournisseurDetails;
