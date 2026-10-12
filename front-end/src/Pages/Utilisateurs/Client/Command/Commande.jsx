import React, { useState, useEffect, useRef } from "react";
import { FaShoppingCart, FaCreditCard, FaWifi, FaPrint, FaDownload, FaArrowLeft, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../../../Api/api";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { MdOutlineShoppingCart } from "react-icons/md";

// Composant du ticket de commande
const OrderTicket = ({ orderData, onClose }) => {
  const ticketRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const ticketContent = ticketRef.current.innerHTML;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket de Commande - Foody</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Poppins:wght@400;500;600&display=swap');
            
            body {
              font-family: 'Poppins', sans-serif;
              background: #f5f5f5;
              margin: 0;
              padding: 20px;
            }
            
            .ticket {
              max-width: 400px;
              margin: 20px auto;
              padding: 25px;
              background: white;
              border: 1px solid #e0e0e0;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            
            .header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 2px dashed #e0e0e0;
            }
            
            .restaurant-name {
              font-family: 'Playfair Display', serif;
              font-size: 24px;
              font-weight: 700;
              color: #1e40af;
              margin-bottom: 5px;
            }
            
            .info-section {
              margin: 15px 0;
              padding: 15px;
              background: #f8fafc;
              border-radius: 8px;
            }
            
            .info-row {
              display: flex;
              justify-content: space-between;
              margin: 8px 0;
              padding: 5px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            
            .menu-items {
              margin: 20px 0;
              padding: 15px;
              background: #f8fafc;
              border-radius: 8px;
            }
            
            .menu-item {
              display: flex;
              justify-content: space-between;
              margin: 8px 0;
              padding: 8px;
              background: white;
              border-radius: 6px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            }
            
            .total-section {
              margin: 20px 0;
              padding: 15px;
              background: #f0f9ff;
              border-radius: 8px;
              border: 1px solid #bae6fd;
            }
            
            @media print {
              body {
                background: white;
                padding: 0;
              }
              
              .ticket {
                box-shadow: none;
                border: 1px solid #e0e0e0;
                margin: 0;
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <div class="restaurant-name">Foody</div>
              <div style="font-size: 18px; color: #374151; margin: 8px 0;">Ticket de Commande</div>
              <div style="font-size: 12px; color: #6b7280;">
                Date: ${new Date().toLocaleString()}
              </div>
            </div>
            
            <div class="info-section">
              <div class="info-row">
                <span>Numéro de Commande</span>
                <span style="font-weight: 600; color: #1e40af;">#${orderData?.id || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span>Date</span>
                <span>${new Date().toLocaleDateString()}</span>
              </div>
              <div class="info-row">
                <span>Heure</span>
                <span>${new Date().toLocaleTimeString()}</span>
              </div>
            </div>
            
            <div class="menu-items">
              <div style="font-weight: 600; color: #374151; margin-bottom: 10px;">Articles commandés</div>
              ${orderData?.items?.map(item => `
                <div class="menu-item">
                  <div>
                    <span style="font-weight: 500;">${item.title}</span>
                    <span style="color: #6b7280; margin-left: 8px;">x${item.quantity}</span>
                  </div>
                  <span style="font-weight: 600; color: #1e40af;">${item.total} DH</span>
                </div>
              `).join('')}
            </div>
            
            <div class="total-section">
              <div style="display: flex; justify-content: space-between; font-weight: 600; color: #0369a1;">
                <span>Total</span>
                <span>${orderData?.total || 0} DH</span>
              </div>
              <div class="info-row" style="margin-top: 8px;">
                <span>Méthode de paiement</span>
                <span style="color: #1e40af;">${orderData?.payment || 'N/A'}</span>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  const handleSaveAsImage = async () => {
    try {
      setIsLoading(true);
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
      });
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `commande-${orderData?.id || 'ticket'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erreur lors de la génération de l\'image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-4 max-w-sm w-full">
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Ticket de Commande</h2>
          <div className="flex justify-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg text-xs"
            >
              <FaPrint size={14} /> Imprimer
            </button>
            <button
              onClick={handleSaveAsImage}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg text-xs disabled:opacity-50"
            >
              <FaDownload size={14} /> {isLoading ? 'Génération...' : 'Sauvegarder'}
            </button>
          </div>
        </div>

        <div ref={ticketRef} className="bg-white p-4 rounded-lg border border-gray-300 shadow-lg">
          <div className="text-center mb-3 border-b pb-2">
            <h2 className="text-base font-bold text-gray-800">Foody</h2>
            <p className="text-xs text-gray-500">Date: {new Date().toLocaleString()}</p>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between border-b pb-1">
              <span className="font-semibold">Commande</span>
              <span className="text-blue-600 font-bold">#{orderData?.id || 'N/A'}</span>
            </div>
            
            <div className="flex justify-between border-b pb-1">
              <span className="font-semibold">Date</span>
              <span className="text-gray-700">{new Date().toLocaleDateString()}</span>
            </div>
            
            <div className="flex justify-between border-b pb-1">
              <span className="font-semibold">Heure</span>
              <span className="text-gray-700">{new Date().toLocaleTimeString()}</span>
            </div>
            
            <div className="border-b pb-1">
              <span className="font-semibold block mb-1">Articles</span>
              <ul className="space-y-1">
                {orderData?.items?.map((item, index) => (
                  <li key={index} className="flex justify-between bg-gray-50 p-1 rounded">
                    <div>
                      <span className="font-medium">{item.title}</span>
                      <span className="text-gray-500 ml-1">x{item.quantity}</span>
                    </div>
                    <span className="font-semibold text-blue-600">{item.total} DH</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex justify-between border-b pb-1">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-green-600">
                {orderData?.total || 0} DH
              </span>
            </div>
            
            <div className="flex justify-between border-b pb-1">
              <span className="font-semibold">Paiement</span>
              <span className="text-blue-600">{orderData?.payment || 'N/A'}</span>
            </div>
          </div>
          
          <div className="mt-3 text-center text-xs text-gray-600 border-t pt-2">
            <p className="font-semibold text-gray-800">Merci de votre commande!</p>
            <p>Présentez ce ticket pour récupérer votre commande</p>
          </div>
        </div>
        
        <div className="mt-3 flex justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors shadow-lg text-sm"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Commande() {
  const [categories, setCategories] = useState([]);
  const [menus, setMenus] = useState([]);
  const [cart, setCart] = useState([]);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [cardData, setCardData] = useState({ number: "", name: "", expiry: "", cvc: "" });
  const [nfcProcessing, setNfcProcessing] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [notification, setNotification] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [userOrders, setUserOrders] = useState([]);
  const [showOrderStatus, setShowOrderStatus] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les catégories avec leurs menus
        const response = await api.get("/menu/category");
        console.log('Réponse catégories avec menus:', response.data);
        
        // Extraire les catégories et leurs menus
        const categoriesWithMenus = Array.isArray(response.data) ? response.data : [];
        setCategories(categoriesWithMenus);

        // Extraire tous les menus pour le filtrage
        const allMenus = categoriesWithMenus.reduce((acc, category) => {
          return [...acc, ...(category.menus || [])];
        }, []);
        setMenus(allMenus);

      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setNotification({ 
          type: "error", 
          message: "Erreur lors du chargement des menus. Veuillez réessayer." 
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addToCart = (menu) => {
    const existingItem = cart.find(item => item.id === menu.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === menu.id
          ? { 
              ...item, 
              quantity: item.quantity + 1, 
              total: parseFloat((item.quantity + 1) * parseFloat(item.price)).toFixed(2)
            }
          : item
      ));
    } else {
      setCart([...cart, { 
        ...menu, 
        quantity: 1, 
        total: parseFloat(menu.price).toFixed(2)
      }]);
    }
  };

  const removeFromCart = (menuId) => {
    setCart(cart.filter(item => item.id !== menuId));
  };

  const updateQuantity = (menuId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(cart.map(item =>
      item.id === menuId
        ? { 
            ...item, 
            quantity: newQuantity, 
            total: parseFloat(newQuantity * parseFloat(item.price)).toFixed(2)
          }
        : item
    ));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => {
      const itemTotal = parseFloat(item.total) || 0;
      return sum + itemTotal;
    }, 0);
  };

  // Fonction pour récupérer les commandes de l'utilisateur
  const fetchUserOrders = async (userId) => {
    try {
      const response = await api.get(`/orders/user/${userId}`);
      setUserOrders(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des commandes:", error);
    }
  };

  // Fonction pour afficher le statut de la commande
  const showOrderStatusNotification = (order) => {
    setCurrentOrder(order);
    setShowOrderStatus(true);
    setTimeout(() => {
      setShowOrderStatus(false);
    }, 5000); // La notification disparaît après 5 secondes
  };

  const handleNfcPayment = async () => {
    setNfcProcessing(true);
    try {
      const orderData = {
        total_price: calculateTotal(),
        menu: JSON.stringify(cart.map(item => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          price: item.price,
          total: item.total
        }))),
        status: "en attente",
        payment_method: "NFC",
        id_user: user.id
      };

      const response = await api.post("/orders", orderData);
      
      if (response.data) {
        const orderResponse = {
          id: response.data.id_order,
        items: cart,
        total: calculateTotal(),
        payment: "NFC",
        date: new Date().toISOString()
      };
      
        setOrderData(orderResponse);
      setShowTicket(true);
      setStep(3);
      setCart([]);
      setPaymentMethod("");
        setNotification({ type: "success", message: "Commande enregistrée avec succès!" });
        
        // Marquer qu'une nouvelle commande a été passée pour notification
        localStorage.setItem('newOrderPlaced', 'true');

        // Récupérer les commandes mises à jour
        await fetchUserOrders(user.id);
        // Afficher le statut de la commande
        showOrderStatusNotification(response.data);
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la commande:", error);
      setNotification({ 
        type: "error", 
        message: "Erreur lors de l'enregistrement de la commande. Veuillez réessayer." 
      });
    } finally {
      setNfcProcessing(false);
    }
  };

  const handleCardPayment = async (e) => {
    e.preventDefault();
    try {
      const orderData = {
        total_price: calculateTotal(),
        menu: JSON.stringify(cart.map(item => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          price: item.price,
          total: item.total
        }))),
        status: "en attente",
        payment_method: "CARD",
        id_user: user.id
      };

      const response = await api.post("/orders", orderData);
      
      if (response.data) {
        const orderResponse = {
          id: response.data.id_order,
        items: cart,
        total: calculateTotal(),
        payment: "Carte",
        date: new Date().toISOString()
      };
      
        setOrderData(orderResponse);
      setShowTicket(true);
      setStep(3);
      setCart([]);
      setPaymentMethod("");
      setCardData({ number: "", name: "", expiry: "", cvc: "" });
        setNotification({ type: "success", message: "Commande enregistrée avec succès!" });
        
        // Marquer qu'une nouvelle commande a été passée pour notification
        localStorage.setItem('newOrderPlaced', 'true');

        // Récupérer les commandes mises à jour
        await fetchUserOrders(user.id);
        // Afficher le statut de la commande
        showOrderStatusNotification(response.data);
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la commande:", error);
      setNotification({ 
        type: "error", 
        message: "Erreur lors de l'enregistrement de la commande. Veuillez réessayer." 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-2 sm:p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Notification */}
        {notification.message && (
          <div className="fixed top-4 right-4 z-50 animate-fade-in-down w-[90%] sm:w-auto">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white
              ${notification.type === "success" ? "bg-green-500" : ""}
              ${notification.type === "error" ? "bg-red-500" : ""}
              ${notification.type === "info" ? "bg-blue-500" : ""}
            `}>
              {notification.type === "success" && <FaCheckCircle size={20} />}
              {notification.type === "error" && <FaTimesCircle size={20} />}
              <span className="text-sm">{notification.message}</span>
              <button className="ml-2" onClick={() => setNotification({ type: "", message: "" })}>×</button>
            </div>
          </div>
        )}

        {/* Animation style */}
        <style>{`
          .animate-fade-in-down {
            animation: fadeInDown 0.7s ease-out;
          }
          @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-30px);}
            to { opacity: 1; transform: translateY(0);}
          }
        `}</style>

        <div className="flex justify-between items-center mb-4 sm:mb-6">
        {/* Bouton retour */}
        <button
          onClick={() => navigate('/user/client')}
            className="flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg shadow hover:bg-gray-300 transition-all text-sm sm:text-base"
        >
          <FaArrowLeft /> Retour
        </button>

          {/* Icône Mes Commandes */}
          <button
            onClick={() => navigate('/user/client/commandes')}
            className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg shadow hover:bg-gray-300 transition-all text-sm sm:text-base"
            title="Voir mes commandes"
          >
            <MdOutlineShoppingCart size={20} /> Mes Commandes
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
            <FaShoppingCart className="text-blue-500" /> Commander en ligne
          </h1>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
              ))}
            </div>
          ) : step === 1 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Liste des menus */}
              <div className="lg:col-span-2">
                {/* Sélection de la catégorie */}
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">Choisissez une catégorie</h2>
                  <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 sm:pb-0">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap
                        ${selectedCategory === "all" 
                          ? "bg-blue-600 text-white shadow-md" 
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                      Tous les menus
                    </button>
                    {categories && categories.length > 0 ? (
                      categories.map(category => (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id.toString())}
                          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap
                            ${selectedCategory === category.id.toString()
                              ? "bg-blue-600 text-white shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                          {category.title}
                        </button>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">Chargement des catégories...</p>
                    )}
                  </div>
                </div>

                {/* Liste des menus filtrés */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {selectedCategory === "all" ? (
                    // Afficher tous les menus
                    menus.map(menu => (
                      <div key={menu.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                        <div className="relative">
                          <img
                            src={`http://localhost:8000/storage/${menu.image}`}
                            alt={menu.title}
                            className="w-full h-40 sm:h-48 object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/300x200?text=Image+non+disponible';
                            }}
                          />
                          <div className="absolute top-2 right-2">
                            <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                              {menu.price} DH
                            </span>
                          </div>
                          <div className="absolute top-2 left-2">
                            <span className="bg-gray-800 text-white px-2 py-1 rounded-full text-xs font-medium">
                              {categories.find(cat => cat.id === menu.category_id)?.title || 'Sans catégorie'}
                            </span>
                          </div>
                        </div>
                        <div className="p-3 sm:p-4">
                          <h3 className="font-semibold text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base">{menu.title}</h3>
                          <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">{menu.description}</p>
                          <button
                            onClick={() => addToCart(menu)}
                            className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-md text-xs sm:text-sm"
                          >
                            <FaShoppingCart size={14} />
                            <span>Ajouter au panier</span>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Afficher les menus de la catégorie sélectionnée
                    categories
                      .find(cat => cat.id.toString() === selectedCategory)
                      ?.menus?.map(menu => (
                        <div key={menu.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                          <div className="relative">
                            <img
                              src={`http://localhost:8000/storage/${menu.image}`}
                              alt={menu.title}
                              className="w-full h-40 sm:h-48 object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/300x200?text=Image+non+disponible';
                              }}
                            />
                            <div className="absolute top-2 right-2">
                              <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                                {menu.price} DH
                              </span>
                            </div>
                          </div>
                          <div className="p-3 sm:p-4">
                            <h3 className="font-semibold text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base">{menu.title}</h3>
                            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">{menu.description}</p>
                            <button
                              onClick={() => addToCart(menu)}
                              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-md text-xs sm:text-sm"
                            >
                              <FaShoppingCart size={14} />
                              <span>Ajouter au panier</span>
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
                {selectedCategory === "all" ? (
                  menus.length === 0 && !loading && (
                    <div className="text-center py-6 sm:py-8">
                      <p className="text-gray-500 text-sm sm:text-base">Aucun menu disponible.</p>
                    </div>
                  )
                ) : (
                  categories
                    .find(cat => cat.id.toString() === selectedCategory)
                    ?.menus?.length === 0 && !loading && (
                      <div className="text-center py-6 sm:py-8">
                        <p className="text-gray-500 text-sm sm:text-base">Aucun menu disponible dans cette catégorie.</p>
                      </div>
                    )
                )}
              </div>

              {/* Panier */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 shadow-md">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Votre panier</h2>
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-4 text-sm sm:text-base">Votre panier est vide</p>
                ) : (
                  <>
                    <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4 max-h-[300px] sm:max-h-[400px] overflow-y-auto">
                      {cart.map(item => (
                        <div key={item.id} className="flex items-center justify-between bg-white p-2 sm:p-3 rounded-lg shadow-sm hover:shadow-md transition-all">
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 text-sm sm:text-base">{item.title}</p>
                            <p className="text-xs sm:text-sm text-gray-600">{item.price} DH</p>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors text-sm"
                            >
                              -
                            </button>
                            <span className="w-6 sm:w-8 text-center font-medium text-sm sm:text-base">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors text-sm"
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="ml-1 sm:ml-2 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors text-sm"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-3 sm:pt-4">
                      <div className="flex justify-between mb-3 sm:mb-4">
                        <span className="font-semibold text-sm sm:text-base">Total</span>
                        <span className="font-bold text-blue-600 text-sm sm:text-base">{calculateTotal().toFixed(2)} DH</span>
                      </div>
                      <button
                        onClick={() => setStep(2)}
                        disabled={cart.length === 0}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-md text-sm sm:text-base"
                      >
                        Passer la commande
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : step === 2 ? (
            <>
              {/* Paiement */}
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Paiement</h2>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <button
                  onClick={() => setPaymentMethod("nfc")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg shadow font-semibold transition-all
                    ${paymentMethod === "nfc" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-blue-50"}
                  `}
                >
                  <FaWifi /> Paiement NFC
                </button>
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg shadow font-semibold transition-all
                    ${paymentMethod === "card" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-blue-50"}
                  `}
                >
                  <FaCreditCard /> Carte bancaire
                </button>
              </div>

              {/* NFC */}
              {paymentMethod === "nfc" && (
                <div className="text-center my-6">
                  <FaWifi className="mx-auto text-blue-500 text-4xl animate-pulse mb-2" />
                  <p className="mb-4 text-gray-700">Approchez votre carte NFC du terminal...</p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => setStep(1)}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold shadow hover:bg-gray-300 transition-all"
                    >
                      Retour
                    </button>
                    <button
                      onClick={handleNfcPayment}
                      disabled={nfcProcessing}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-all disabled:opacity-60"
                    >
                      {nfcProcessing ? "Paiement en cours..." : "Simuler le paiement NFC"}
                    </button>
                  </div>
                </div>
              )}

              {/* Carte bancaire */}
              {paymentMethod === "card" && (
                <form onSubmit={handleCardPayment} className="max-w-md mx-auto bg-gray-50 rounded-lg p-6 shadow-inner">
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-1">Numéro de carte</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                      maxLength={19}
                      placeholder="1234 5678 9012 3456"
                      value={cardData.number}
                      onChange={e => setCardData({ ...cardData, number: e.target.value })}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-1">Nom sur la carte</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                      placeholder="Nom Prénom"
                      value={cardData.name}
                      onChange={e => setCardData({ ...cardData, name: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                      <label className="block text-gray-700 mb-1">Expiration</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                        placeholder="MM/AA"
                        maxLength={5}
                        value={cardData.expiry}
                        onChange={e => setCardData({ ...cardData, expiry: e.target.value })}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-gray-700 mb-1">CVC</label>
                      <input
                        type="password"
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                        placeholder="CVC"
                        maxLength={4}
                        value={cardData.cvc}
                        onChange={e => setCardData({ ...cardData, cvc: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold shadow hover:bg-gray-300 transition-all"
                    >
                      Retour
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-all"
                    >
                      Valider le paiement
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : (
            // Confirmation finale
            <div className="text-center py-12">
              <FaCheckCircle className="mx-auto text-green-500 text-5xl mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Commande confirmée !</h2>
              <p className="text-gray-600 mb-6">Votre commande a été enregistrée avec succès.</p>
              
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => navigate('/user/client')}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors shadow-lg"
                >
                  <FaArrowLeft size={20} /> Retour à l'accueil
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Afficher le ticket */}
      {showTicket && orderData && (
        <OrderTicket
          orderData={orderData}
          onClose={() => setShowTicket(false)}
        />
      )}
    </div>
  );
}
