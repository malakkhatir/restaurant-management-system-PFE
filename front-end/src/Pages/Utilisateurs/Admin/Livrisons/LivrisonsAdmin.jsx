import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaEye, FaSpinner, FaSearch, FaFilter, FaArrowLeft, FaPrint, FaDownload, FaTimes, FaEdit } from 'react-icons/fa';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LivrisonsAdmin = () => {
  const navigate = useNavigate();
  const ticketRef = useRef(null);
  const [livrisons, setLivrisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLivrison, setSelectedLivrison] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    id_livreur: '',
    date_livrison: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [livreurs, setLivreurs] = useState([]);
  const [loadingLivreurs, setLoadingLivreurs] = useState(false);

  useEffect(() => {
    fetchLivrisons();
  }, [currentPage]);

  const fetchLivrisons = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/livrisons?page=${currentPage}`);
      const reversedData = [...response.data.data].reverse();
      setLivrisons(reversedData);
      setTotalPages(response.data.last_page);
      
      if (currentPage === 1 && response.data.last_page > 1) {
        setCurrentPage(response.data.last_page);
      }
    } catch (error) {
      console.error('Error fetching livrisons:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLivreurs = async () => {
    try {
      setLoadingLivreurs(true);
      const response = await axios.get('http://localhost:8000/api/getLivreurActif');
      setLivreurs(response.data);
    } catch (error) {
      console.error('Error fetching livreurs:', error);
      alert('Erreur lors du chargement des livreurs disponibles');
    } finally {
      setLoadingLivreurs(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewDetails = (livrison) => {
    setSelectedLivrison(livrison);
    setShowDetailsModal(true);
  };

  const handlePrintTicket = () => {
    setShowTicket(true);
  };

  const handleDownloadTicket = async () => {
    if (ticketRef.current) {
      try {
        const canvas = await html2canvas(ticketRef.current, {
          scale: 2,
          useCORS: true,
          logging: false
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: [80, 150] // Format plus petit pour un ticket
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`ticket-livraison-${selectedLivrison.id_livrison}.pdf`);
        
        toast.success('Ticket téléchargé avec succès', {
          position: "top-right",
          autoClose: 2000,
        });
      } catch (error) {
        console.error('Error generating PDF:', error);
        toast.error('Erreur lors de la génération du ticket', {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };

  const handleCloseTicket = () => {
    setShowTicket(false);
  };

  const handleEditClick = (livrison) => {
    setSelectedLivrison(livrison);
    setEditForm({
      id_livreur: livrison.livreur.id_livreur,
      date_livrison: format(new Date(livrison.date_livrison), 'yyyy-MM-dd'),
      address: livrison.address
    });
    setErrors({});
    setShowEditModal(true);
    fetchLivreurs();
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const response = await axios.put(
        `http://localhost:8000/api/livrisons/${selectedLivrison.id_livrison}`, 
        editForm
      );
      
      setShowEditModal(false);
      fetchLivrisons();
      toast.success('Livraison modifiée avec succès', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        toast.error('Erreur de validation', {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error('Erreur lors de la modification de la livraison', {
          position: "top-right",
          autoClose: 3000,
        });
      }
      console.error('Error updating livrison:', error);
    }
  };

  const filteredLivrisons = livrisons.filter(livrison => {
    const matchesSearch = 
      livrison.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      livrison.livreur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      livrison.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !dateFilter || livrison.date_livrison === dateFilter;
    const matchesStatus = !statusFilter || livrison.status === statusFilter;

    return matchesSearch && matchesDate && matchesStatus;
  });

  const handleResetFilters = () => {
    setDateFilter('');
    setStatusFilter('');
    setSearchTerm('');
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 3;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(
        <button
          key="first"
          onClick={() => handlePageChange(1)}
          className="px-3 py-1 mx-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          «
        </button>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded ${
            currentPage === i
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      pages.push(
        <button
          key="last"
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-1 mx-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          »
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer />
      
      {/* Bouton de retour */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/user/admin')}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Retour à l'administration
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-6">Gestion des Livraisons</h1>

      {/* Filtres */}
      <div className="mb-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="relative flex-1 mr-4">
            <input
              type="text"
              placeholder="Rechercher par nom client, livreur ou adresse..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
          >
            <FaFilter className="mr-2" />
            Filtres
          </button>
        </div>

        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de livraison
                </label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous les statuts</option>
                  <option value="en_cours">En cours</option>
                  <option value="livrée">Livrée</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Livrisons Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-4xl text-blue-500" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Livreur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adresse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date de livraison
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLivrisons.map((livrison) => (
                <tr key={livrison.id_livrison}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{livrison.user.name}</div>
                    <div className="text-sm text-gray-500">{livrison.user.num || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {livrison.livreur.nom} {livrison.livreur.prenom}
                    </div>
                    <div className="text-sm text-gray-500">{livrison.livreur.telephone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{livrison.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {format(new Date(livrison.date_livrison), 'dd/MM/yyyy', { locale: fr })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      livrison.status === 'en_cours' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {livrison.status === 'en_cours' ? 'En cours' : 'Livrée'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditClick(livrison)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Modifier"
                      >
                        <FaEdit className="text-xl" />
                      </button>
                      <button
                        onClick={() => handleViewDetails(livrison)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Voir détails"
                      >
                        <FaEye className="text-xl" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-4 flex justify-center">
        {renderPagination()}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedLivrison && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Détails de la livraison</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700">Client</h4>
                  <p className="text-gray-600">{selectedLivrison.user.name}</p>
                  <p className="text-gray-500">{selectedLivrison.user.num || 'N/A'}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700">Livreur</h4>
                  <p className="text-gray-600">{selectedLivrison.livreur.nom} {selectedLivrison.livreur.prenom}</p>
                  <p className="text-gray-500">{selectedLivrison.livreur.telephone}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700">Adresse de livraison</h4>
                  <p className="text-gray-600">{selectedLivrison.address}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700">Date de livraison</h4>
                  <p className="text-gray-600">
                    {format(new Date(selectedLivrison.date_livrison), 'dd/MM/yyyy', { locale: fr })}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700">Statut</h4>
                  <p className="text-gray-600">
                    {selectedLivrison.status === 'en_cours' ? 'En cours' : 'Livrée'}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700">Détails de la commande</h4>
                  <p className="text-gray-600">Total: {selectedLivrison.orders.total_price} DH</p>
                  <div className="mt-2">
                    {JSON.parse(selectedLivrison.orders.menu).map((item, index) => (
                      <div key={index} className="text-gray-600">
                        {item.quantity}x {item.title} - {item.total} DH
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={handlePrintTicket}
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 flex items-center"
                >
                  <FaPrint className="mr-2" />
                  Imprimer le ticket
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Modal */}
      {showTicket && selectedLivrison && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[400px] shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Ticket de livraison</h3>
              <button
                onClick={handleCloseTicket}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <div ref={ticketRef} className="bg-white p-4 border-2 border-dashed border-gray-300 rounded-lg">
              {/* En-tête du ticket */}
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Restaurants Foody</h2>
                <p className="text-sm text-gray-600">Ticket de livraison</p>
                <p className="text-xs text-gray-500">#{selectedLivrison.id_livrison}</p>
              </div>

              {/* Informations de livraison */}
              <div className="space-y-2 text-sm">
                <div className="border-b pb-2">
                  <h4 className="font-semibold text-gray-700 text-xs">Client</h4>
                  <p className="text-gray-600">{selectedLivrison.user.name}</p>
                  <p className="text-gray-500 text-xs">{selectedLivrison.user.num || 'N/A'}</p>
                </div>

                <div className="border-b pb-2">
                  <h4 className="font-semibold text-gray-700 text-xs">Livreur</h4>
                  <p className="text-gray-600">{selectedLivrison.livreur.nom} {selectedLivrison.livreur.prenom}</p>
                  <p className="text-gray-500 text-xs">{selectedLivrison.livreur.telephone}</p>
                </div>

                <div className="border-b pb-2">
                  <h4 className="font-semibold text-gray-700 text-xs">Adresse</h4>
                  <p className="text-gray-600 text-xs">{selectedLivrison.address}</p>
                </div>

                <div className="border-b pb-2">
                  <h4 className="font-semibold text-gray-700 text-xs">Date</h4>
                  <p className="text-gray-600 text-xs">
                    {format(new Date(selectedLivrison.date_livrison), 'dd/MM/yyyy', { locale: fr })}
                  </p>
                </div>

                <div className="border-b pb-2">
                  <h4 className="font-semibold text-gray-700 text-xs">Commande</h4>
                  <p className="text-gray-600 text-xs">Total: {selectedLivrison.orders.total_price} DH</p>
                  <div className="mt-1">
                    {JSON.parse(selectedLivrison.orders.menu).map((item, index) => (
                      <div key={index} className="text-gray-600 text-xs">
                        {item.quantity}x {item.title} - {item.total} DH
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pied de page */}
              <div className="mt-4 text-center text-xs text-gray-500">
                <p>Merci de votre confiance</p>
                <p>Restaurants Foody</p>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={handleDownloadTicket}
                className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 flex items-center"
              >
                <FaDownload className="mr-2" />
                Télécharger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedLivrison && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Modifier la livraison</h3>
              
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Livreur disponible</label>
                  <select
                    value={editForm.id_livreur}
                    onChange={(e) => setEditForm({...editForm, id_livreur: e.target.value})}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.id_livreur ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    required
                    disabled={loadingLivreurs}
                  >
                    <option value="">Sélectionner un livreur disponible</option>
                    {loadingLivreurs ? (
                      <option value="" disabled>Chargement des livreurs...</option>
                    ) : (
                      livreurs.map((livreur) => (
                        <option key={livreur.id_livreur} value={livreur.id_livreur}>
                          {livreur.nom} {livreur.prenom} - {livreur.telephone}
                        </option>
                      ))
                    )}
                  </select>
                  {errors.id_livreur && (
                    <p className="mt-1 text-sm text-red-600">{errors.id_livreur[0]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Date de livraison</label>
                  <input
                    type="date"
                    value={editForm.date_livrison}
                    onChange={(e) => setEditForm({...editForm, date_livrison: e.target.value})}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.date_livrison ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    required
                  />
                  {errors.date_livrison && (
                    <p className="mt-1 text-sm text-red-600">{errors.date_livrison[0]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Adresse de livraison</label>
                  <textarea
                    value={editForm.address}
                    onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    rows="3"
                    maxLength="255"
                    required
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address[0]}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LivrisonsAdmin;
