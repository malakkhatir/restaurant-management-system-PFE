import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaSignOutAlt, FaPhoneAlt, FaMapMarkerAlt, FaEnvelope, FaClipboardList, FaUser, FaUtensils, FaHome, FaCheckCircle } from "react-icons/fa";
import { AiOutlineUser } from "react-icons/ai";
import { MdOutlineDeliveryDining, MdOutlineHistory, MdOutlineFeedback } from "react-icons/md";

const HomeLivreur = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showNotificationDots, setShowNotificationDots] = useState(false);
  const [showDeliveryDots, setShowDeliveryDots] = useState(false);
  const [adminContact, setAdminContact] = useState(null);
  const menuRef = useRef();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const newDeliveryAssigned = localStorage.getItem('newDeliveryAssigned');
    const firstLogin = sessionStorage.getItem("firstLogin");

    if (newDeliveryAssigned) {
      setShowNotificationDots(true);
    }

    if (!token || !storedUser) {
      navigate("/login");
    } else {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setLoading(false);

      // Afficher le message de succès uniquement lors de la première connexion
      if (!firstLogin && location.state?.successMessage) {
        setMessage(location.state.successMessage);
        setShowSuccessMessage(true);
        setShowNotificationDots(true);
        sessionStorage.setItem("firstLogin", "true");
        setTimeout(() => setShowSuccessMessage(false), 4000);
      }
    }
  }, [navigate, location]);

  useEffect(() => {
    const fetchAdminContact = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/admincontact', {
          headers: {
            'Accept': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setAdminContact(data[0]);
          }
        } else {
          console.error("Failed to fetch admin contact:", response.status);
        }
      } catch (error) {
        console.error("Error fetching admin contact:", error);
      }
    };

    fetchAdminContact();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
    if (showNotificationDots) {
      setShowNotificationDots(false);
      setShowDeliveryDots(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("firstLogin");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        <p className="mt-4 text-blue-500 font-semibold">Chargement en cours...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 sm:px-6 lg:px-8 py-6 relative">
      
      {/* Toast Bienvenue */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 w-[90%] sm:w-auto">
          <div className="bg-green-500 text-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 animate-fade-in-down">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                user?.name? `${user.name}` : 'Livreur'
              )}&background=0D8ABC&color=fff&rounded=true&size=40`}
              alt="avatar"
              className="w-8 h-8 rounded-full"
            />
            <span className="text-sm sm:text-base">{message}</span>
            <button
              className="ml-2 text-white hover:text-gray-200"
              onClick={() => setShowSuccessMessage(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Avatar et Menu */}
      {user && (
        <div className="absolute top-4 right-4" ref={menuRef}>
          <div className="relative inline-block">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.name ? `${user.name}` : 'Livreur'
              )}&background=0D8ABC&color=fff&rounded=true&size=100`}
              alt="avatar"
              className="rounded-full w-10 h-10 sm:w-12 sm:h-12 cursor-pointer border-2 border-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative"
              onClick={toggleMenu}
            />
            {showNotificationDots && (
              <span className="absolute top-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-red-600 animate-pulse"></span>
            )}

            {menuVisible && (
              <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-xl shadow-2xl z-40 p-3 sm:p-4 transform transition-all duration-300 animate-fade-in-down backdrop-blur-sm border border-gray-100">
                <div className="text-center border-b pb-2 sm:pb-3 mb-2 sm:mb-3">
                  <h5 className="text-gray-800 font-semibold text-sm sm:text-base">
                    {user.name ? `${user.name}` : "Livreur"}
                  </h5>
                  <p className="text-xs sm:text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="flex justify-around">
                  <button 
                    onClick={() => navigate("/")} 
                    className="text-gray-600 hover:text-green-600 transform transition-all duration-300 hover:scale-110 p-2"
                    title="Accueil"
                  >
                    <FaHome size={22} />
                  </button>
                  <button 
                    onClick={() => navigate("/user/livreur/profile")} 
                    className="text-gray-600 hover:text-blue-600 transform transition-all duration-300 hover:scale-110 p-2"
                    title="Profil"
                  >
                    <AiOutlineUser size={22} />
                  </button>
                  <button 
                    onClick={() => {
                      localStorage.removeItem('newDeliveryAssigned');
                      setShowDeliveryDots(false);
                      navigate("/user/livreur/livrisons");
                    }}
                    className="text-gray-600 hover:text-blue-600 transform transition-all duration-300 hover:scale-110 p-2 relative"
                    title="Mes livraisons"
                  >
                    <MdOutlineDeliveryDining size={22} />
                    {showDeliveryDots && (
                      <span className="absolute top-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-red-600 animate-pulse"></span>
                    )}
                  </button>
                  <button 
                    onClick={handleLogout} 
                    className="text-gray-600 hover:text-red-500 transform transition-all duration-300 hover:scale-110 p-2"
                    title="Déconnexion"
                  >
                    <FaSignOutAlt size={22} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add the animation styles */}
      <style>{`
        .animate-fade-in-down {
          animation: fadeInDown 0.7s ease-out;
        }
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Titre */}
      <h2 className="text-center text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 mt-12 sm:mt-0">
        🚚 Bienvenue sur votre espace livreur
      </h2>

      {/* Cards for actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto px-2 sm:px-4">
        {/* Statut Livreur Card */}
        <div
          className="group bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 transition-all duration-300 rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl p-4 sm:p-6 md:p-8 text-center cursor-pointer transform hover:-translate-y-1"
          onClick={() => navigate("/user/livreur/status")}
        >
          <div className="bg-orange-100 group-hover:bg-orange-200 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 transition-colors duration-300">
            <FaUser className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-orange-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-orange-900 mb-2 sm:mb-3">Modifier mon statut</h3>
          <p className="text-xs sm:text-sm text-orange-700 group-hover:text-orange-800 transition-colors duration-300">
            Changer votre disponibilité pour les livraisons.
          </p>
        </div>

        {/* Livraisons en cours Card */}
        <div
          className="group bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-300 rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl p-4 sm:p-6 md:p-8 text-center cursor-pointer transform hover:-translate-y-1"
          onClick={() => navigate("/user/livreur/livrisons")}
        >
          <div className="bg-green-100 group-hover:bg-green-200 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 transition-colors duration-300">
            <MdOutlineDeliveryDining className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-green-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-green-900 mb-2 sm:mb-3">Livraisons en cours</h3>
          <p className="text-xs sm:text-sm text-green-700 group-hover:text-green-800 transition-colors duration-300">
            Consultez et gérez vos livraisons en cours.
          </p>
        </div>

        {/* Historique des livraisons Card */}
        <div
          className="group bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-300 rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl p-4 sm:p-6 md:p-8 text-center cursor-pointer transform hover:-translate-y-1"
          onClick={() => navigate("/user/livreur/historique")}
        >
          <div className="bg-blue-100 group-hover:bg-blue-200 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 transition-colors duration-300">
            <MdOutlineHistory className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-2 sm:mb-3">Historique des livraisons</h3>
          <p className="text-xs sm:text-sm text-blue-700 group-hover:text-blue-800 transition-colors duration-300">
            Consultez l'historique de toutes vos livraisons passées.
          </p>
        </div>

        {/* Menu du Restaurant Card */}
        <div
          className="group bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all duration-300 rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl p-4 sm:p-6 md:p-8 text-center cursor-pointer transform hover:-translate-y-1"
          onClick={() => navigate("/user/livreur/menu")}
        >
          <div className="bg-purple-100 group-hover:bg-purple-200 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 transition-colors duration-300">
            <FaUtensils className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-purple-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-purple-900 mb-2 sm:mb-3">Menu du Restaurant</h3>
          <p className="text-xs sm:text-sm text-purple-700 group-hover:text-purple-800 transition-colors duration-300">
            Consultez le menu complet du restaurant Foody.
          </p>
        </div>

        {/* Contact Support Card */}
        <div
          className="group bg-gradient-to-br from-cyan-50 to-cyan-100 hover:from-cyan-100 hover:to-cyan-200 transition-all duration-300 rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl p-4 sm:p-6 md:p-8 text-center cursor-pointer transform hover:-translate-y-1 sm:col-span-2"
        >
          <div className="bg-cyan-100 group-hover:bg-cyan-200 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 transition-colors duration-300">
            <FaPhoneAlt className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-cyan-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-cyan-900 mb-4 sm:mb-5">Contactez le support</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
              <FaUser className="text-cyan-600" />
              <div>
                <p className="text-xs text-gray-500">Nom</p>
                <p className="text-sm font-semibold text-cyan-900">
                  {adminContact ? adminContact.name : 'Chargement...'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
              <FaPhoneAlt className="text-cyan-600" />
              <div>
                <p className="text-xs text-gray-500">Téléphone</p>
                <p className="text-sm font-semibold text-cyan-900">
                  {adminContact ? adminContact.num : 'Chargement...'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
              <FaEnvelope className="text-cyan-600" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-semibold text-cyan-900">
                  {adminContact ? adminContact.email : 'Chargement...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-200 py-6 mt-8 sm:mt-12 text-center text-gray-700 text-xs sm:text-sm">
        Foody Restaurant | Espace Livreur
      </footer>
    </div>
  );
};

export default HomeLivreur;
