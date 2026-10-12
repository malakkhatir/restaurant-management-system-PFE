import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Calendar, DollarSign, User, AlertTriangle, Loader2, Printer } from 'lucide-react';
import api from '../../../../Api/api';

function StockDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStockDetails();
  }, [id]);

  const fetchStockDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/stocks/${id}`);
      setStock(response.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des détails du stock');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-600">Chargement des détails...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/user/admin/stock')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Stock non trouvé</h2>
          <p className="text-gray-600 mb-6">Le stock demandé n'existe pas ou a été supprimé.</p>
          <button
            onClick={() => navigate('/user/admin/stock')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 print:bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Actions Bar - Hidden when printing */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100 print:hidden">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/user/admin/stock')}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg shadow-sm hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-sm hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <Printer className="h-5 w-5 mr-2" />
              Imprimer
            </button>
          </div>
        </div>

        {/* Bon de Stock */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden print:shadow-none print:rounded-none print-content">
          <div className="p-6 print:p-0">
            {/* Header */}
            <div className="text-center mb-4 pb-4 border-b border-gray-200 print-header">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Bon de Stock</h1>
              <p className="text-gray-600 text-sm">Date d'émission: {currentDate}</p>
            </div>

            {/* Content */}
            <div className="grid grid-cols-2 gap-4 mb-4 print:gap-3">
              {/* Informations du Produit */}
              <div className="bg-gray-50 p-4 rounded-xl print-section">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center print-info">
                  <Package className="w-5 h-5 mr-2 text-blue-600" />
                  Informations du Produit
                </h2>
                <div className="space-y-3 print-info">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Nom du produit</label>
                    <p className="mt-1 text-base text-gray-900">{stock.nom_produit}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Nombre de produits</label>
                    <p className="mt-1 text-base text-gray-900">{stock.nombre_produit}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Quantité</label>
                    <p className="mt-1 text-base text-gray-900">{stock.quantite}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Prix</label>
                    <p className="mt-1 text-base font-semibold text-blue-600">{stock.prix_stock} €</p>
                  </div>
                </div>
              </div>

              {/* Informations Complémentaires */}
              <div className="bg-gray-50 p-4 rounded-xl print-section">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center print-info">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  Informations Complémentaires
                </h2>
                <div className="space-y-3 print-info">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Date d'entrée</label>
                    <p className="mt-1 text-base text-gray-900">{stock.date_entree_stock}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Date d'expiration</label>
                    <p className="mt-1 text-base text-gray-900">{stock.date_expiration}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Fournisseur</label>
                    <p className="mt-1 text-base text-gray-900">
                      {stock.fournisseur ? `${stock.fournisseur.nom} ${stock.fournisseur.prenom}` : '-'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">CIN du Fournisseur</label>
                    <p className="mt-1 text-base text-gray-900">
                      {stock.fournisseur ? stock.fournisseur.cin : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-4 mt-6 mb-4 print-signatures">
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="text-center">
                  <div className="border-t border-gray-300 w-3/4 mx-auto mb-2"></div>
                  <p className="text-gray-600 text-sm">Signature du Responsable</p>
                  <p className="text-gray-500 text-xs mt-1">Nom et qualité</p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="text-center">
                  <div className="border-t border-gray-300 w-3/4 mx-auto mb-2"></div>
                  <p className="text-gray-600 text-sm">Signature du Fournisseur</p>
                  <p className="text-gray-500 text-xs mt-1">Nom et qualité</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-500 border-t border-gray-200 pt-3 print-footer">
              <p>Ce document est généré automatiquement et fait office de preuve de réception.</p>
              <p className="mt-1">ID du stock: {stock.id_stock}</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media print {
          @page {
            size: A4;
            margin: 1cm;
          }
          
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background: white;
          }

          .print-content {
            page-break-inside: avoid;
            max-height: 100vh;
          }

          .print-header {
            margin-bottom: 0.8cm;
          }

          .print-header h1 {
            font-size: 20pt;
            margin-bottom: 0.3cm;
          }

          .print-section {
            background-color: #f8fafc !important;
            padding: 0.4cm !important;
            margin-bottom: 0.4cm !important;
          }

          .print-section h2 {
            font-size: 12pt;
            margin-bottom: 0.3cm;
          }

          .print-info {
            font-size: 10pt;
          }

          .print-info label {
            font-size: 8pt;
            color: #4b5563 !important;
          }

          .print-signatures {
            margin-top: 0.5cm;
            page-break-inside: avoid;
          }

          .print-footer {
            margin-top: 0.5cm;
            font-size: 8pt;
            color: #6b7280 !important;
          }
        }
      `}</style>
    </div>
  );
}

export default StockDetails;
