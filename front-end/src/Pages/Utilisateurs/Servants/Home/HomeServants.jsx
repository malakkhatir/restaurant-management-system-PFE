import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaUserCircle, FaHome, FaPhoneAlt, FaMapMarkerAlt, FaEnvelope, FaUser, FaUtensils, FaChair } from "react-icons/fa";
import { MdRestaurantMenu, MdOutlineShoppingCart, MdOutlinePointOfSale, MdOutlineDeliveryDining, MdOutlineTableRestaurant } from "react-icons/md";
import { HiOutlineClipboardList } from "react-icons/hi";

const HomeServants = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [adminContact, setAdminContact] = useState(null);
  const menuRef = useRef();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/login");
    } else {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role === "admin") {
        navigate("/user/admin");
      } else if (parsedUser.role === "client") {
        navigate("/user/client");
      } else {
        setUser(parsedUser);
        setTimeout(() => setLoading(false), 1200);
      }
    }
  }, []);

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
    const firstLogin = sessionStorage.getItem("firstLogin");
    if (!firstLogin && user) {
      setMessage(`Bienvenue ${user.name} 🎉`);
      setShowSuccessMessage(true);
      sessionStorage.setItem("firstLogin", "true");
      setTimeout(() => setShowSuccessMessage(false), 4000);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => setMenuVisible(!menuVisible);

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
              src={`https://ui-avatars.com/api/?name=${user?.name}&background=0D8ABC&color=fff&rounded=true&size=40`}
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
              src={`https://ui-avatars.com/api/?name=${user.name}&background=0D8ABC&color=fff&rounded=true&size=100`}
              alt="avatar"
              className="rounded-full w-10 h-10 sm:w-12 sm:h-12 cursor-pointer border-2 border-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={toggleMenu}
            />

            {menuVisible && (
              <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-xl shadow-2xl z-40 p-3 sm:p-4 transform transition-all duration-300 animate-fade-in-down backdrop-blur-sm border border-gray-100">
                <div className="text-center border-b pb-2 sm:pb-3 mb-2 sm:mb-3">
                  <h5 className="text-gray-800 font-semibold text-sm sm:text-base">{user.name}</h5>
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
                    onClick={() => navigate("/user/servant/profil")} 
                    className="text-gray-600 hover:text-blue-600 transform transition-all duration-300 hover:scale-110 p-2"
                    title="Profil"
                  >
                    <FaUserCircle size={22} />
                  </button>
                  <button 
                    onClick={() => navigate("/gerer/ventes")}
                    className="text-gray-600 hover:text-indigo-600 transform transition-all duration-300 hover:scale-110 p-2"
                    title="Commandes"
                  >
                    <HiOutlineClipboardList size={22} />
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

      {/* Titre */}
      <h2 className="text-center text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 mt-12 sm:mt-0">
        🍽 Bienvenue sur votre espace servant
      </h2>

      {/* Cards for actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto px-2 sm:px-4">
        {/* Voir les commandes en ligne Card */}
        <div
          className="group bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-300 rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl p-4 sm:p-6 md:p-8 text-center cursor-pointer transform hover:-translate-y-1"
          onClick={() => navigate("/user/servant/commandes-en-ligne")}
        >
          <div className="bg-blue-100 group-hover:bg-blue-200 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 transition-colors duration-300">
            <MdOutlineShoppingCart className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-2 sm:mb-3">Voir les commandes en ligne</h3>
          <p className="text-xs sm:text-sm text-blue-700 group-hover:text-blue-800 transition-colors duration-300">
            Gérez et suivez les commandes en ligne des clients.
          </p>
        </div>

        {/* Passer une commande locale Card */}
        <div
          className="group bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-300 rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl p-4 sm:p-6 md:p-8 text-center cursor-pointer transform hover:-translate-y-1"
          onClick={() => navigate("/user/servant/commandes-locales")}
        >
          <div className="bg-green-100 group-hover:bg-green-200 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 transition-colors duration-300">
            <FaUtensils className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-green-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-green-900 mb-2 sm:mb-3">Passer une commande locale</h3>
          <p className="text-xs sm:text-sm text-green-700 group-hover:text-green-800 transition-colors duration-300">
            Enregistrez une nouvelle commande pour un client sur place.
          </p>
        </div>

        {/* Voir les livraisons Card */}
        <div
          className="group bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 transition-all duration-300 rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl p-4 sm:p-6 md:p-8 text-center cursor-pointer transform hover:-translate-y-1"
          onClick={() => navigate("/user/servant/livraisons")}
        >
          <div className="bg-orange-100 group-hover:bg-orange-200 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 transition-colors duration-300">
            <MdOutlineDeliveryDining className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-orange-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-orange-900 mb-2 sm:mb-3">Voir les livraisons</h3>
          <p className="text-xs sm:text-sm text-orange-700 group-hover:text-orange-800 transition-colors duration-300">
            Suivez et gérez les livraisons en cours.
          </p>
        </div>

        {/* Voir les réservations Card */}
        <div
          className="group bg-gradient-to-br from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200 transition-all duration-300 rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl p-4 sm:p-6 md:p-8 text-center cursor-pointer transform hover:-translate-y-1"
          onClick={() => navigate("/user/servant/reservations")}
        >
          <div className="bg-pink-100 group-hover:bg-pink-200 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 transition-colors duration-300">
            <MdOutlineTableRestaurant className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-pink-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-pink-900 mb-2 sm:mb-3">Voir les réservations</h3>
          <p className="text-xs sm:text-sm text-pink-700 group-hover:text-pink-800 transition-colors duration-300">
            Gérez les réservations de tables des clients.
          </p>
        </div>

        {/* Gestion des tables Card */}
        <div
          className="group bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 transition-all duration-300 rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl p-4 sm:p-6 md:p-8 text-center cursor-pointer transform hover:-translate-y-1"
          onClick={() => navigate("/user/servant/tables")}
        >
          <div className="bg-indigo-100 group-hover:bg-indigo-200 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 transition-colors duration-300">
            <FaChair className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-indigo-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-indigo-900 mb-2 sm:mb-3">Gestion des tables</h3>
          <p className="text-xs sm:text-sm text-indigo-700 group-hover:text-indigo-800 transition-colors duration-300">
            Gérez la disponibilité et l'état des tables du restaurant.
          </p>
        </div>

        {/* Voir le menu Card */}
        <div
          className="group bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all duration-300 rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl p-4 sm:p-6 md:p-8 text-center cursor-pointer transform hover:-translate-y-1"
          onClick={() => navigate("/user/servant/menu")}
        >
          <div className="bg-purple-100 group-hover:bg-purple-200 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 transition-colors duration-300">
            <MdRestaurantMenu className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-purple-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-purple-900 mb-2 sm:mb-3">Voir le menu</h3>
          <p className="text-xs sm:text-sm text-purple-700 group-hover:text-purple-800 transition-colors duration-300">
            Consultez la carte et les plats disponibles.
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
        Foody Restaurant | Espace Servant
      </footer>

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
    </div>
  );
};

export default HomeServants;
