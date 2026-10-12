import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../Api/api"; // Adjust import path if necessary
import { FaArrowLeft, FaCalendarCheck, FaTimesCircle, FaCheckCircle, FaPrint, FaEllipsisV } from "react-icons/fa";
import { MdOutlinePendingActions } from "react-icons/md";

export default function AdminReservation() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingReservationId, setUpdatingReservationId] = useState(null);
  const [pagination, setPagination] = useState(null);
  const navigate = useNavigate();

  // Notification state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('');

  // Confirmation Dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [reservationToActOn, setReservationToActOn] = useState(null);
  const [actionType, setActionType] = useState(null);

  // Table Modification Modal state
  const [showTableModal, setShowTableModal] = useState(false);
  const [availableTables, setAvailableTables] = useState([]);
  const [currentReservationIdToModify, setCurrentReservationIdToModify] = useState(null);

  // Print Ticket state
  const [showPrintView, setShowPrintView] = useState(false);
  const [reservationToPrint, setReservationToPrint] = useState(null);

  const [activeMenuId, setActiveMenuId] = useState(null);

  const fetchReservations = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      console.log('fetchReservations: Fetching page', page);
      const response = await api.get(`/reservations?page=${page}`);
      
      // Log the response data to check status values
      console.log('Reservations data:', response.data.data);
      
      setReservations(response.data.data.map(reservation => ({
         ...reservation,
         menu: reservation.menu ? JSON.parse(reservation.menu) : [],
         id: reservation.id_reservation,
         status: reservation.status || 'en attente'
      })).reverse());
      
      setPagination({
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          links: response.data.links,
          total: response.data.total
      });

      setLoading(false);
    } catch (err) {
      console.error("Error fetching reservations:", err);
      setError("Erreur lors du chargement des réservations.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialFetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/reservations?page=1`);

        const reservationsData = response.data.data.map(reservation => ({
           ...reservation,
           menu: reservation.menu ? JSON.parse(reservation.menu) : [],
           id: reservation.id_reservation
        })).reverse();

        const paginationData = {
            current_page: response.data.current_page,
            last_page: response.data.last_page,
            links: response.data.links,
            total: response.data.total
        };

        setPagination(paginationData);
        setReservations(reservationsData);

        if (paginationData.last_page > 1) {
             fetchReservations(paginationData.last_page);
        } else {
             setLoading(false);
        }

      } catch (err) {
        console.error("Error fetching reservations:", err);
        setError("Erreur lors du chargement des réservations.");
        setLoading(false);
      }
    };

    initialFetch();
  }, [fetchReservations]);

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
        setNotificationMessage('');
        setNotificationType('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  const updateReservationStatus = async (reservationId, newStatus, currentPage) => {
    setUpdatingReservationId(reservationId);
    try {
      const apiUrl = newStatus === 'confirmée'
        ? `/reservation/statusv/${reservationId}`
        : `/reservation/statusa/${reservationId}`;

      await api.put(apiUrl, {});

      setReservations(prevReservations =>
        prevReservations.map(reservation =>
          reservation.id_reservation === reservationId ? { ...reservation, status: newStatus } : reservation
        )
      );

      console.log(`Reservation ${reservationId} status updated to ${newStatus}`);
      setShowNotification(true);
      setNotificationMessage(`Réservation ${reservationId} mise à jour avec succès !`);
      setNotificationType('success');

      fetchReservations(currentPage);

    } catch (err) {
      console.error(`Error updating reservation ${reservationId} status to ${newStatus}:`, err);
      setShowNotification(true);
      setNotificationMessage(`Erreur lors de la mise à jour du statut de la réservation.`);
      setNotificationType('error');
    } finally {
      setUpdatingReservationId(null);
    }
  };

  const handleValidate = (reservation) => {
    // Check if table is available
    if (reservation.table && reservation.table.status === 0) {
      setShowNotification(true);
      setNotificationMessage("Impossible de valider la réservation : La table n'est pas disponible.");
      setNotificationType('error');
      return;
    }
    
    setReservationToActOn(reservation);
    setActionType('validate');
    setShowConfirmDialog(true);
  };

  const handleCancel = (reservation) => {
     setReservationToActOn(reservation);
     setActionType('cancel');
     setShowConfirmDialog(true);
  };

  const handleModifyTable = async (reservationId) => {
      setCurrentReservationIdToModify(reservationId);
      setShowTableModal(true);
      setLoading(true);
      try {
          const response = await api.get('/reservation/etattable');
          setAvailableTables(response.data);
          setLoading(false);
      } catch (error) {
          console.error('Error fetching available tables:', error);
          setAvailableTables([]);
          setLoading(false);
          setShowTableModal(false);
      }
  };

  const handleSelectNewTable = async (tableId) => {
      if (!currentReservationIdToModify || !pagination) return;

      setShowTableModal(false);
      setUpdatingReservationId(currentReservationIdToModify);

      try {
          const response = await api.put(`/reservation/updateetattable/${currentReservationIdToModify}`, {
              id_table: tableId
          });

          console.log('Update Table API Response:', response.data);

          setShowNotification(true);
          setNotificationMessage(`Table mise à jour pour la réservation #${currentReservationIdToModify} !`);
          setNotificationType('success');

          console.log('handleSelectNewTable: Calling fetchReservations to refetch page', pagination.current_page);

          fetchReservations(pagination.current_page);

      } catch (error) {
          console.error('Error updating reservation table:', error);
          setShowNotification(true);
          setNotificationMessage(`Erreur lors de la mise à jour de la table pour la réservation #${currentReservationIdToModify}.`);
          setNotificationType('error');
      } finally {
          setUpdatingReservationId(null);
          setCurrentReservationIdToModify(null);
      }
  };

  const handlePrintTicketClick = (reservation) => {
      setReservationToPrint(reservation);
      setShowPrintView(true);
  };

  const handleReturnFromPrint = () => {
      setReservationToPrint(null);
      setShowPrintView(false);
  };

  const confirmAction = async () => {
      if (!reservationToActOn || !actionType || !pagination) return;

      setShowConfirmDialog(false);

      const statusToUpdate = actionType === 'validate' ? 'confirmée' : 'annulé';
      await updateReservationStatus(reservationToActOn.id_reservation, statusToUpdate, pagination.current_page);

      setReservationToActOn(null);
      setActionType(null);
  };

  const cancelAction = () => {
      setShowConfirmDialog(false);
      setReservationToActOn(null);
      setActionType(null);
  };

  const handlePageChange = (url) => {
      if (!url) return;
      const pageMatch = url.match(/page=(\d+)/);
      if (pageMatch && pageMatch[1]) {
          fetchReservations(parseInt(pageMatch[1]));
      }
  };

  const toggleActionMenu = (reservationId) => {
    setActiveMenuId(activeMenuId === reservationId ? null : reservationId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        <p className="mt-4 text-blue-500 font-semibold">Chargement des réservations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-red-600 text-lg font-semibold">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/user/admin')}
          className="flex items-center gap-2 px-3 py-2 mb-6 bg-gray-200 text-gray-700 rounded-lg shadow hover:bg-gray-300 transition-all text-sm sm:text-base"
        >
          <FaArrowLeft /> Retour au tableau de bord
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <FaCalendarCheck className="text-green-600" /> Gestion des Réservations
        </h1>

        {showNotification && (
          <div className={`fixed top-4 right-4 p-4 rounded-md shadow-md z-50 text-white ${notificationType === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {notificationMessage}
          </div>
        )}

        {showPrintView && reservationToPrint ? (
          <div className="print-view p-4 sm:p-8 bg-white min-h-screen">
            <button
              onClick={handleReturnFromPrint}
              className="flex items-center gap-2 px-3 py-2 mb-6 bg-gray-200 text-gray-700 rounded-lg shadow hover:bg-gray-300 transition-all text-sm sm:text-base no-print"
            >
              <FaArrowLeft /> Retour
            </button>

            <div className="ticket-printable p-6 bg-white border border-gray-300 rounded-lg shadow-lg w-80 mx-auto">
              <style>
                {`
                  @media print {
                    body * {
                      visibility: hidden;
                    }
                    .ticket-printable, .ticket-printable * {
                      visibility: visible;
                    }
                    .ticket-printable {
                      position: absolute;
                      left: 50%;
                      top: 50%;
                      transform: translate(-50%, -50%);
                      width: 300px;
                      margin: 0;
                      padding: 20px;
                      box-shadow: none;
                      border: 1px solid #ccc;
                    }
                    .no-print {
                      display: none !important;
                    }
                  }
                `}
              </style>
              <div className="header text-center mb-6 pb-4 border-b-2 border-dashed border-gray-300">
                <div className="restaurant-name text-2xl font-bold text-blue-700 mb-1">Foody</div>
                <p className="text-sm text-gray-600">Ticket de Réservation #{reservationToPrint.id_reservation}</p>
                <p className="text-xs text-gray-500">Date de Réservation: {new Date(reservationToPrint.date).toLocaleString()}</p>
              </div>
              <div className="body space-y-4 text-sm text-gray-700">
                <p><span className="font-semibold">Utilisateur ID:</span> {reservationToPrint.id_user}</p>
                <p><span className="font-semibold">Table:</span> {reservationToPrint.id_table} {reservationToPrint.table ? `(${reservationToPrint.table.status === 1 ? 'Disponible' : 'Non Disponible'})` : ''}</p>
                <p><span className="font-semibold">Nombre de personnes:</span> {reservationToPrint.number_of_guests}</p>
                <p><span className="font-semibold">Menu (pour info):</span>
                  <ul>
                    {reservationToPrint.menu && reservationToPrint.menu.map((item, index) => (
                      <li key={index} className="ml-4 text-gray-600">{item.title} x {item.quantity} ({item.total} DH)</li>
                    ))}
                  </ul>
                </p>
                <p><span className="font-semibold">Statut:</span> {reservationToPrint.status}</p>
              </div>
              <div className="footer text-center mt-6 pt-4 border-t border-gray-300 text-xs text-gray-600">
                <p className="font-semibold text-gray-800 mb-1">Merci pour la réservation!</p>
                <p>Ce ticket confirme la réservation.</p>
              </div>
            </div>

            <div className="flex justify-center mt-6 no-print">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors font-semibold"
              >
                <FaPrint /> Imprimer
              </button>
            </div>
          </div>
        ) : (
          <>
            {reservations.length === 0 ? (
              <div className="text-center py-10 text-gray-600">
                <p className="text-lg">Aucune réservation trouvée.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reservations.map(reservation => (
                  <div key={reservation.id_reservation} className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-4 border-b pb-3">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Réservation #{reservation.id_reservation}</h2>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium
                          ${reservation.status === 'confirmée' ? 'bg-green-100 text-green-800' :
                            reservation.status === 'annulée' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'}
                        `}>
                          {reservation.status === 'confirmée' ? (
                            <span className="flex items-center gap-1"><FaCheckCircle /> Confirmée</span>
                          ) : reservation.status === 'annulée' ? (
                            <span className="flex items-center gap-1"><FaTimesCircle /> Annulée</span>
                          ) : (
                            <span className="flex items-center gap-1"><MdOutlinePendingActions /> En attente</span>
                          )}
                        </span>
                        <div className="relative">
                          <button
                            onClick={() => toggleActionMenu(reservation.id_reservation)}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <FaEllipsisV className="text-gray-600" />
                          </button>
                          
                          {activeMenuId === reservation.id_reservation && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                              <div className="py-1">
                                {reservation.status === 'en attente' && (
                                  <>
                                    <button
                                      onClick={() => {
                                        handleValidate(reservation);
                                        setActiveMenuId(null);
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                                    >
                                      <FaCheckCircle size={14} /> Valider
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleCancel(reservation);
                                        setActiveMenuId(null);
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                      <FaTimesCircle size={14} /> Annuler
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => {
                                    handleModifyTable(reservation.id_reservation);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                                >
                                  <FaCalendarCheck size={14} /> Modifier Table
                                </button>
                                <button
                                  onClick={() => {
                                    handlePrintTicketClick(reservation);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <FaPrint size={14} /> Imprimer Ticket
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4 text-sm text-gray-700">
                      <p><span className="font-semibold">Utilisateur ID:</span> {reservation.id_user}</p>
                      <p><span className="font-semibold">Table:</span> {reservation.id_table} {reservation.table ? `(${reservation.table.status === 1 ? 'Disponible' : 'Non Disponible'})` : ''}</p>
                      <p><span className="font-semibold">Date & Heure:</span> {new Date(reservation.date).toLocaleString()}</p>
                      <p><span className="font-semibold">Menu:</span>
                        <ul>
                          {reservation.menu.map((item, index) => (
                            <li key={index} className="ml-4 text-gray-600">{item.title} x {item.quantity} ({item.total} DH)</li>
                          ))}
                        </ul>
                      </p>
                      <p><span className="font-semibold">Paiement:</span> {reservation.payment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {pagination && pagination.links && pagination.links.length > 3 && (
              <nav className="flex justify-center mt-8">
                <ul className="inline-flex items-center -space-x-px">
                  {pagination.links.map((link, index) => (
                    <li key={index}>
                      <button
                        onClick={() => handlePageChange(link.url)}
                        disabled={!link.url || link.active}
                        className={`px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 ${
                          link.active ? 'z-10 text-blue-600 bg-blue-50 border-blue-300' : ''}
                          ${index === 0 ? 'rounded-l-lg' : ''} ${index === pagination.links.length - 1 ? 'rounded-r-lg' : ''}
                          disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                      />
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </>
        )}

        {showConfirmDialog && reservationToActOn && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {actionType === 'validate' ? 'Confirmer la validation' : 'Confirmer l\'annulation'}
              </h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir {actionType === 'validate' ? 'valider' : 'annuler'} la réservation #{reservationToActOn.id_reservation} ? Cette action est {actionType === 'validate' ? '' : 'irréversible'}.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelAction}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Non
                </button>
                <button
                  onClick={confirmAction}
                  className={`px-4 py-2 rounded-lg transition-colors font-semibold ${actionType === 'validate' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                >
                  Oui, {actionType === 'validate' ? 'valider' : 'annuler'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showTableModal && !loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl max-w-2xl w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Sélectionner une nouvelle table</h3>
                <button
                  onClick={() => setShowTableModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimesCircle size={24} />
                </button>
              </div>

              {availableTables.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 text-lg">Aucune table disponible pour le moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableTables.map(table => (
                    <div
                      key={table.id}
                      onClick={() => handleSelectNewTable(table.id)}
                      className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                        table.status === 1 
                          ? 'bg-green-50 hover:bg-green-100 border-2 border-green-200' 
                          : 'bg-red-50 hover:bg-red-100 border-2 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-800">Table {table.name || table.id}</h4>
                          <p className={`text-sm ${
                            table.status === 1 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {table.status === 1 ? 'Disponible' : 'Non Disponible'}
                          </p>
                        </div>
                        <div className={`p-2 rounded-full ${
                          table.status === 1 ? 'bg-green-200' : 'bg-red-200'
                        }`}>
                          {table.status === 1 ? (
                            <FaCheckCircle className="text-green-600" size={20} />
                          ) : (
                            <FaTimesCircle className="text-red-600" size={20} />
                          )}
                        </div>
                      </div>
                      {table.status === 1 && (
                        <p className="mt-2 text-sm text-gray-600">
                          Cliquez pour sélectionner cette table
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowTableModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
