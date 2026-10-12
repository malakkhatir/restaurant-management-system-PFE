import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import axios from 'axios';

const Certificate = () => {
  const { id, type } = useParams();
  const navigate = useNavigate();
  const [servant, setServant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServantDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://127.0.0.1:8000/api/servants/${id}`);
        setServant(response.data);
        setError(null);
      } catch (err) {
        setError("Erreur lors du chargement des détails du serveur");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchServantDetails();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifiée';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !servant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{error || "Serveur non trouvé"}</p>
          <button
            onClick={() => navigate(`/user/admin/servants/${id}`)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retour aux détails
          </button>
        </div>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Buttons */}
        <div className="mb-8 flex justify-between items-center print:hidden">
          <button
            onClick={() => navigate(`/user/admin/servants/details/${id}`)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Retour aux détails</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105 shadow-lg group"
          >
            <Printer className="w-5 h-5 mr-2" />
            <span className="font-medium">Imprimer</span>
          </button>
        </div>

        {/* Certificate */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden print:shadow-none print:rounded-none">
          <div className="p-8 md:p-12">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-blue-600 mb-2">RESTAURANT APP</h1>
              <h2 className="text-2xl font-semibold text-gray-800">
                {type === 'work' ? 'ATTESTATION DE TRAVAIL' : 'ATTESTATION DE CONGÉ'}
              </h2>
            </div>

            <div className="space-y-6 text-gray-700">
              <p>Je soussigné(e), Directeur du Restaurant, certifie que :</p>
              
              <div className="pl-4 border-l-4 border-blue-500">
                <p className="font-semibold text-lg">{servant.name}</p>
                <p>N° CIN : {servant.cin}</p>
              </div>

              {type === 'work' ? (
                <p>
                  Est employé(e) en qualité de Serveur(se) dans notre établissement depuis le{' '}
                  <span className="font-semibold">{formatDate(servant.created_at)}</span>.
                </p>
              ) : (
                <p>
                  Est autorisé(e) à prendre un congé à partir du{' '}
                  <span className="font-semibold">{currentDate}</span>.
                </p>
              )}

              <p>Cette attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit.</p>
            </div>

            <div className="mt-12 text-right">
              <p>Fait à Casablanca, le {currentDate}</p>
              <p className="font-semibold mt-4">Le Directeur</p>
            </div>

            <div className="mt-12 text-center text-sm text-gray-500">
              <p>Restaurant App - Tous droits réservés</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Certificate; 