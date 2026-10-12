import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../Api/api"; // Assurez-vous que le chemin est correct
import {
  FaArrowLeft,
  FaShoppingCart,
  FaCreditCard,
  FaWifi,
  FaTimesCircle,
  FaDownload,
  FaCheckCircle,
} from "react-icons/fa";
import html2canvas from "html2canvas";

const CommandesEnLigne = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [savingOrderId, setSavingOrderId] = useState(null);
  const [saveSuccessNotification, setSaveSuccessNotification] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  // Fonction de pagination
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await api.get(`/orders/user/${user.id}`);
        const ordersWithParsedMenu = response.data.map((order) => ({
          ...order,
          menu: order.menu ? JSON.parse(order.menu) : [],
          ticketRef: React.createRef(),
        }));
        const reversedOrders = ordersWithParsedMenu.reverse();
        setOrders(reversedOrders);
      } catch (err) {
        console.error("Erreur lors de la récupération des commandes:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  // Annuler une commande
  const handleCancelOrder = (orderId) => {
    setOrderToCancel(orderId);
    setShowCancelConfirm(true);
  };

  const confirmCancellation = async () => {
    if (!orderToCancel) return;
    setShowCancelConfirm(false);
    setCancellingOrderId(orderToCancel);
    try {
      await api.put(`/orderstatus/${orderToCancel}`, { status: "annulé" });
      setOrders(
        orders.map((order) =>
          order.id_order === orderToCancel ? { ...order, status: "annulé" } : order
        )
      );
      setNotification({
        show: true,
        message: "Commande annulée avec succès !",
        type: "success",
      });
      setTimeout(() => setNotification({ show: false, message: "", type: "" }), 5000);
    } catch (err) {
      setNotification({
        show: true,
        message: "Erreur lors de l'annulation.",
        type: "error",
      });
      setTimeout(() => setNotification({ show: false, message: "", type: "" }), 5000);
    } finally {
      setCancellingOrderId(null);
      setOrderToCancel(null);
    }
  };

  const cancelCancellation = () => {
    setShowCancelConfirm(false);
    setOrderToCancel(null);
  };

  // Sauvegarder le ticket comme image
  const handleSaveAsImage = async (order, ticketElementRef) => {
    if (!ticketElementRef || !ticketElementRef.current) {
      console.error("Référence introuvable.");
      return;
    }
    setSavingOrderId(order.id_order);
    try {
      const canvas = await html2canvas(ticketElementRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.href = imgData;
      link.download = `commande-${order.id_order}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSaveSuccessNotification(true);
      setTimeout(() => setSaveSuccessNotification(false), 5000);
    } catch (error) {
      console.error("Erreur image:", error);
      alert("Erreur lors de la sauvegarde.");
    } finally {
      setSavingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        <p className="mt-4 text-blue-500 font-semibold">Chargement des commandes...</p>
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
        {/* Notifications */}
        {notification.show && (
          <div className="fixed top-4 right-4 z-50 animate-fade-in-down w-[90%] sm:w-auto">
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white ${
                notification.type === "success" ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {notification.type === "success" ? <FaCheckCircle size={20} /> : <FaTimesCircle size={20} />}
              <span>{notification.message}</span>
            </div>
          </div>
        )}

        {saveSuccessNotification && (
          <div className="fixed top-4 right-4 z-50 animate-fade-in-down w-[90%] sm:w-auto">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white bg-green-500">
              <FaCheckCircle size={20} />
              <span>Ticket sauvegardé avec succès !</span>
            </div>
          </div>
        )}

        {/* Bouton Retour */}
        <button
          onClick={() => navigate("/user/servant")}
          className="flex items-center gap-2 px-3 py-2 mb-6 bg-gray-200 text-gray-700 rounded-lg shadow hover:bg-gray-300 transition-all"
        >
          <FaArrowLeft /> Retour
        </button>

        {/* Titre */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <FaShoppingCart className="text-blue-500" /> Mes Commandes
        </h1>

        {/* Liste des commandes */}
        {orders.length === 0 ? (
          <div className="text-center py-10 text-gray-600">
            <p className="text-lg">Vous n'avez pas encore passé de commandes.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {currentOrders.map((order) => (
              <div
                key={order.id_order}
                className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-200"
              >
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                    Commande #{order.id_order}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === "confirmé"
                        ? "bg-green-100 text-green-800"
                        : order.status === "annulé"
                        ? "bg-red-100 text-red-800"
                        : order.status === "livré"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Total:</span>
                    <span className="font-semibold text-blue-600">
                      {parseFloat(order.total_price).toFixed(2)} DH
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Méthode de paiement:</span>
                    <span className="font-semibold text-gray-800 flex items-center gap-1">
                      {order.payment_method === "NFC" ? <FaWifi /> : <FaCreditCard />}
                      {order.payment_method}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Date:</span>
                    <span className="font-semibold text-gray-800">
                      {new Date(order.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-md font-semibold text-gray-800 mb-3">Articles:</h3>
                  <ul className="space-y-2">
                    {order.menu.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
                        className="flex justify-between text-sm text-gray-700 bg-gray-50 p-2 rounded"
                      >
                        <span>{item.title} x {item.quantity}</span>
                        <span className="font-semibold">
                          {parseFloat(item.total).toFixed(2)} DH
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 flex justify-end gap-3">
                  {order.status === "en attente" && (
                    <button
                      onClick={() => handleCancelOrder(order.id_order)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md disabled:opacity-50"
                      disabled={cancellingOrderId === order.id_order}
                    >
                      <FaTimesCircle size={14} />
                      {cancellingOrderId === order.id_order ? "Annulation..." : "Annuler"}
                    </button>
                  )}
                  <button
                    onClick={() => handleSaveAsImage(order, order.ticketRef)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                    disabled={savingOrderId === order.id_order}
                  >
                    <FaDownload size={14} />
                    {savingOrderId === order.id_order ? "Sauvegarde..." : "Sauvegarder Image"}
                  </button>
                </div>

                {/* Ticket caché */}
                <div style={{ position: "absolute", left: "-9999px" }}>
                  <div ref={order.ticketRef} className="ticket-printable p-6 bg-white border border-gray-300 rounded-lg shadow w-80">
                    <div className="text-center mb-6 pb-4 border-b border-dashed border-gray-300">
                      <div className="text-2xl font-bold text-blue-700">Foody</div>
                      <p className="text-sm text-gray-600">Ticket #{order.id_order}</p>
                      <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm text-gray-700">
                        <span>Paiement:</span>
                        <span className="font-semibold">{order.payment_method}</span>
                      </div>
                      <ul className="space-y-2">
                        {order.menu.map((item, i) => (
                          <li key={i} className="flex justify-between text-sm text-gray-700 bg-gray-50 p-2 rounded">
                            <span>{item.title} x {item.quantity}</span>
                            <span>{parseFloat(item.total).toFixed(2)} DH</span>
                          </li>
                        ))}
                      </ul>
                      <div className="text-lg font-bold text-blue-700 mt-3 border-t pt-2 border-dashed text-right">
                        Total: {parseFloat(order.total_price).toFixed(2)} DH
                      </div>
                    </div>
                    <div className="text-center mt-4 pt-3 border-t text-xs text-gray-600">
                      <p className="font-semibold">Merci de votre commande !</p>
                      <p>Présentez ce ticket pour récupérer votre commande.</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {orders.length > ordersPerPage && (
          <div className="flex justify-center mt-8">
            <nav aria-label="Pagination">
              <ul className="inline-flex -space-x-px">
                <li>
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 disabled:opacity-50"
                  >
                    Précédent
                  </button>
                </li>
                {[...Array(totalPages)].map((_, i) => (
                  <li key={i + 1}>
                    <button
                      onClick={() => paginate(i + 1)}
                      className={`px-3 py-2 leading-tight border border-gray-300 ${
                        currentPage === i + 1
                          ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                          : "text-gray-500 bg-white hover:bg-gray-100"
                      }`}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}

        {/* Modal Confirmation Annulation */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirmer l'annulation</h3>
              <p className="text-gray-600 mb-6">Êtes-vous sûr de vouloir annuler cette commande ?</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelCancellation}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Non
                </button>
                <button
                  onClick={confirmCancellation}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Oui, annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommandesEnLigne;