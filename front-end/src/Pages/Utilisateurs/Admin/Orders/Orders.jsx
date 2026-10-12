import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaSearch, FaFilter, FaArrowLeft, FaUndo, FaCheck, FaEdit, FaEye, FaPhone } from 'react-icons/fa';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(2);
  const [totalPages, setTotalPages] = useState(2);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [deliveryMen, setDeliveryMen] = useState([]);
  const [selectedDeliveryMan, setSelectedDeliveryMan] = useState(null);
  const [loadingDeliveryMen, setLoadingDeliveryMen] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [formErrors, setFormErrors] = useState({
    deliveryDate: '',
    deliveryAddress: '',
    deliveryMan: ''
  });
  const [showMenuModal, setShowMenuModal] = useState(false);

  const fetchOrders = async (page = 2) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/orders?page=${page}`);
      const reversedOrders = [...response.data.data].reverse();
      setOrders(reversedOrders);
      setTotalPages(response.data.last_page);
      setCurrentPage(response.data.current_page);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des commandes');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(2);
  }, []);

  const handlePageChange = (page) => {
    fetchOrders(page);
  };

  const fetchActiveDeliveryMen = async () => {
    try {
      setLoadingDeliveryMen(true);
      const response = await axios.get('http://localhost:8000/api/Orders/livreuractif');
      setDeliveryMen(response.data);
    } catch (err) {
      console.error('Error fetching delivery men:', err);
    } finally {
      setLoadingDeliveryMen(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setSelectedOrderId(orderId);
    setActionType(newStatus);
    if (newStatus === 'confirmé') {
      const order = orders.find(o => o.id_order === orderId);
      setSelectedOrderDetails(order);
      setDeliveryAddress(order?.user?.address || '');
      await fetchActiveDeliveryMen();
      setShowDeliveryModal(true);
    } else {
      setShowConfirmModal(true);
    }
  };

  const confirmStatusChange = async () => {
    try {
      if (actionType === 'confirmé') {
        await createDelivery();
      } else {
        await axios.put(`http://localhost:8000/api/orderstatus/${selectedOrderId}`, {
          status: 'annulé'
        });
        fetchOrders(currentPage);
        setShowConfirmModal(false);
        showSuccessNotification('Commande annulée avec succès');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      showSuccessNotification('Erreur lors de la mise à jour du statut de la commande');
    }
  };

  const showSuccessNotification = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const validateDeliveryForm = () => {
    const errors = {};
    if (!deliveryDate) {
      errors.deliveryDate = 'La date de livraison est obligatoire';
    }
    if (!deliveryAddress) {
      errors.deliveryAddress = 'L\'adresse de livraison est obligatoire';
    }
    if (!selectedDeliveryMan) {
      errors.deliveryMan = 'Veuillez sélectionner un livreur';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createDelivery = async () => {
    try {
      if (!validateDeliveryForm()) {
        showSuccessNotification('Veuillez remplir tous les champs obligatoires');
        return;
      }

      await axios.put(`http://localhost:8000/api/orderstatus/${selectedOrderId}`, {
        status: 'confirmé'
      });

      const deliveryData = {
        date_livrison: deliveryDate,
        address: deliveryAddress,
        status: 'en_cours',
        id_user: selectedOrderDetails?.user?.id,
        id_livreur: selectedDeliveryMan,
        id_order: selectedOrderId
      };

      const createResponse = await axios.post('http://localhost:8000/api/livrisons', deliveryData);
      
      const notificationMessage = `Commande confirmée avec succès !`;
      
      fetchOrders(currentPage);
      setShowDeliveryModal(false);
      setShowConfirmModal(false);
      setSelectedDeliveryMan(null);
      setDeliveryDate('');
      setDeliveryAddress('');
      setSelectedOrderDetails(null);
      setIsEditingAddress(false);
      setFormErrors({});
      
      showSuccessNotification(notificationMessage);

    } catch (err) {
      console.error('Error creating delivery:', err);
      showSuccessNotification('Erreur lors de la création de la livraison');
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter('');
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id_order.toString().includes(searchTerm) ||
                         order.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesDate = !dateFilter || format(new Date(order.created_at), 'yyyy-MM-dd') === dateFilter;
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'en attente':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmé':
        return 'bg-green-100 text-green-800';
      case 'livré':
        return 'bg-blue-100 text-blue-800';
      case 'annulé':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd MMMM yyyy HH:mm', { locale: fr });
  };

  const parseMenuItems = (menuString) => {
    try {
      return JSON.parse(menuString);
    } catch (e) {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg max-w-md">
            <div className="flex items-start">
              <FaCheck className="mr-2 mt-1 flex-shrink-0" />
              <div className="whitespace-pre-line text-sm">
                {notificationMessage}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">Gestion des Commandes</h1>
          <button
            onClick={() => navigate('/user/admin')}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Retour
          </button>
        </div>
        
        {/* Search and Filter Section */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher par nom, email ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="en attente">En attente</option>
            <option value="confirmé">Confirmé</option>
            <option value="livré">Livré</option>
            <option value="annulé">Annulé</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={resetFilters}
            className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <FaUndo className="mr-2" />
            Réinitialiser les filtres
          </button>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Menu</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id_order} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{order.id_order}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.user.name}</div>
                      <div className="text-sm text-gray-500">{order.user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowMenuModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                      >
                        <FaEye className="mr-1" />
                        Voir détails
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {parseFloat(order.total_price).toFixed(2)} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {order.status === 'en attente' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(order.id_order, 'confirmé')}
                              className="text-green-600 hover:text-green-900"
                              title="Confirmer la commande"
                            >
                              <FaCheckCircle size={20} />
                            </button>
                            <button
                              onClick={() => handleStatusChange(order.id_order, 'annulé')}
                              className="text-red-600 hover:text-red-900"
                              title="Annuler la commande"
                            >
                              <FaTimesCircle size={20} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Voir les détails et contacter le client"
                        >
                          <FaEye size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-6">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  currentPage === page
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Menu Modal */}
      {showMenuModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Menu de la commande #{selectedOrder.id_order}</h3>
              <div className="mt-2 px-7 py-3">
                <div className="space-y-4">
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Détails de la commande</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      {parseMenuItems(selectedOrder.menu).map((item, index) => (
                        <div key={index} className="flex justify-between items-center mb-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.title}</p>
                            <p className="text-sm text-gray-500">Quantité: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{parseFloat(item.total).toFixed(2)} €</p>
                        </div>
                      ))}
                      <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between items-center">
                          <p className="text-lg font-medium text-gray-900">Total</p>
                          <p className="text-lg font-medium text-gray-900">{parseFloat(selectedOrder.total_price).toFixed(2)} €</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => setShowMenuModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Détails de la commande #{selectedOrder.id_order}</h3>
              <div className="mt-2 px-7 py-3">
                <div className="space-y-4">
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Informations client</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Nom: {selectedOrder.user.name}</p>
                      <p className="text-sm text-gray-600">Email: {selectedOrder.user.email}</p>
                      <p className="text-sm text-gray-600">Téléphone: {selectedOrder.user.num || 'Non spécifié'}</p>
                      {selectedOrder.user.num && (
                        <a
                          href={`tel:${selectedOrder.user.num}`}
                          className="mt-2 inline-flex items-center px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors"
                        >
                          <FaPhone className="mr-1" />
                          Appeler le client
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Détails de la commande</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      {parseMenuItems(selectedOrder.menu).map((item, index) => (
                        <div key={index} className="flex justify-between items-center mb-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.title}</p>
                            <p className="text-sm text-gray-500">Quantité: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{parseFloat(item.total).toFixed(2)} €</p>
                        </div>
                      ))}
                      <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between items-center">
                          <p className="text-lg font-medium text-gray-900">Total</p>
                          <p className="text-lg font-medium text-gray-900">{parseFloat(selectedOrder.total_price).toFixed(2)} €</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Statut</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Date de commande</h4>
                    <p className="text-sm text-gray-600">{formatDate(selectedOrder.created_at)}</p>
                  </div>
                </div>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {actionType === 'confirmé' ? 'Confirmer la commande' : 'Annuler la commande'}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Êtes-vous sûr de vouloir {actionType === 'confirmé' ? 'confirmer' : 'annuler'} cette commande ?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmStatusChange}
                  className={`px-4 py-2 text-white text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                    actionType === 'confirmé'
                      ? 'bg-green-500 hover:bg-green-600 focus:ring-green-300'
                      : 'bg-red-500 hover:bg-red-600 focus:ring-red-300'
                  }`}
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Man Selection Modal */}
      {showDeliveryModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sélectionner un livreur</h3>
              
              {/* Date de livraison */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de livraison <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => {
                    setDeliveryDate(e.target.value);
                    setFormErrors(prev => ({ ...prev, deliveryDate: '' }));
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.deliveryDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
                {formErrors.deliveryDate && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.deliveryDate}</p>
                )}
              </div>

              {/* Adresse de livraison */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Adresse de livraison <span className="text-red-500">*</span>
                  </label>
                  <button
                    onClick={() => setIsEditingAddress(!isEditingAddress)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaEdit />
                  </button>
                </div>
                {isEditingAddress ? (
                  <div>
                    <textarea
                      value={deliveryAddress}
                      onChange={(e) => {
                        setDeliveryAddress(e.target.value);
                        setFormErrors(prev => ({ ...prev, deliveryAddress: '' }));
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.deliveryAddress ? 'border-red-500' : 'border-gray-300'
                      }`}
                      rows="3"
                      placeholder="Entrez l'adresse de livraison"
                    />
                    {formErrors.deliveryAddress && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.deliveryAddress}</p>
                    )}
                  </div>
                ) : (
                  <div className={`p-2 rounded-lg ${
                    formErrors.deliveryAddress ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                  }`}>
                    {deliveryAddress ? (
                      <p className="text-sm text-gray-600">{deliveryAddress}</p>
                    ) : (
                      <p className="text-sm text-gray-500 italic">Aucune adresse spécifiée</p>
                    )}
                  </div>
                )}
              </div>

              {loadingDeliveryMen ? (
                <div className="flex justify-center">
                  <FaSpinner className="animate-spin text-4xl text-blue-500" />
                </div>
              ) : (
                <div className="space-y-4">
                  {deliveryMen.length === 0 ? (
                    <p className="text-red-500">Aucun livreur actif disponible</p>
                  ) : (
                    <>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sélectionnez un livreur <span className="text-red-500">*</span>
                      </label>
                      {formErrors.deliveryMan && (
                        <p className="text-sm text-red-500 mb-2">{formErrors.deliveryMan}</p>
                      )}
                      {deliveryMen.map((deliveryMan) => (
                        <div
                          key={deliveryMan.id_livreur}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedDeliveryMan === deliveryMan.id_livreur
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:bg-gray-50'
                          } ${formErrors.deliveryMan ? 'border-red-500' : ''}`}
                          onClick={() => {
                            setSelectedDeliveryMan(deliveryMan.id_livreur);
                            setFormErrors(prev => ({ ...prev, deliveryMan: '' }));
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{`${deliveryMan.nom} ${deliveryMan.prenom}`}</p>
                              <p className="text-sm text-gray-500">{deliveryMan.telephone}</p>
                              <p className="text-xs text-gray-400">{deliveryMan.ville}</p>
                            </div>
                            <div className="flex items-center">
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                {deliveryMan.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeliveryModal(false);
                    setShowConfirmModal(false);
                    setSelectedDeliveryMan(null);
                    setDeliveryDate('');
                    setDeliveryAddress('');
                    setSelectedOrderDetails(null);
                    setIsEditingAddress(false);
                    setFormErrors({});
                  }}
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Annuler
                </button>
                <button
                  onClick={createDelivery}
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
