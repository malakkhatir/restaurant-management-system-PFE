import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaSignOutAlt, FaCheckCircle, FaTimes, FaUtensils, FaTruck, FaMotorcycle, FaUsers, FaShoppingCart, FaBox, FaCalendarAlt, FaHome } from "react-icons/fa";
import { MdDashboard, MdFeedback, MdReport, MdOutlineRestaurant } from "react-icons/md";
import { BiMessageAltError } from "react-icons/bi";
import { AiOutlineUser, AiOutlineShopping, AiOutlineTeam } from "react-icons/ai";
import { FiSettings } from "react-icons/fi";
import { BsListCheck } from "react-icons/bs";
import { GiMeal } from "react-icons/gi";
import axios from "axios";

export default function HomeAdmin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showSuccess, setShowSuccess] = useState(!!location.state?.successMessage);
  const menuRef = useRef();
  const [stats, setStats] = useState({
    reservation: 0,
    orders: 0,
    livreur: 0,
    livrison: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    if (!token || !user) {
      navigate('/login');
    }else{
      if (user.role === 'client') {
        navigate('/user/client');
      }else if(user.role === 'admin'){
        navigate('/user/admin');
      }else{
        navigate('/user/servant');
      }
    }
  },[])
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/login");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/nombrestatic');
        setStats(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
      }
    };

    fetchStats();
  }, []);

  const toggleMenu = () => setMenuVisible(!menuVisible);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8 relative">
      {/* Avatar & Menu */}
      <div className="absolute top-4 right-4" ref={menuRef}>
        {user && (
          <div className="relative inline-block">
            <img
              src={`https://ui-avatars.com/api/?name=${user.name}&background=0D8ABC&color=fff&rounded=true&size=100`}
              alt="avatar"
              className="rounded-full w-12 h-12 cursor-pointer border-2 border-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={toggleMenu}
            />
            {/* Notification de succès */}
            {showSuccess && (
              <div className="absolute top-1/2 right-full -translate-y-1/2 mr-4 z-50 flex items-center gap-3 bg-gradient-to-r from-green-400 via-green-300 to-green-200 border border-green-400 text-green-900 px-6 py-3 rounded-2xl shadow-2xl animate-fade-in-up min-w-max backdrop-blur-sm">
                <FaCheckCircle className="text-green-700 text-2xl drop-shadow animate-pulse" />
                <span className="font-bold text-base text-center drop-shadow">
                  Connexion réussie{user?.name ? `, ${user.name} !` : ' !'}
                </span>
                <button 
                  onClick={() => setShowSuccess(false)} 
                  className="ml-2 text-green-900 hover:text-red-500 focus:outline-none transition-colors duration-200 transform hover:scale-110"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
            )}
            {/* Menu déroulant */}
            {menuVisible && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl z-50 p-4 transform transition-all duration-300 animate-fade-in-down backdrop-blur-sm border border-gray-100">
                <div className="text-center border-b pb-3">
                  <h6 className="font-semibold text-gray-800">{user.name}</h6>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="flex justify-around mt-3">
                  <button
                    onClick={() => navigate("/")}
                    className="text-gray-600 hover:text-green-600 transform transition-all duration-300 hover:scale-110"
                    title="Accueil"
                  >
                    <FaHome size={22} />
                  </button>
                  <button
                    onClick={() => navigate("/user/admin/profile")}
                    className="text-gray-600 hover:text-blue-600 transform transition-all duration-300 hover:scale-110"
                    title="Profil"
                  >
                    <AiOutlineUser size={22} />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-red-500 transform transition-all duration-300 hover:scale-110"
                    title="Déconnexion"
                  >
                    <FaSignOutAlt size={22} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Titre */}
      <h2 className="text-center text-3xl font-bold text-gray-800 mb-8 mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        🎛 Espace Administrateur
      </h2>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Livreurs Actifs</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.livreur}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FaUsers className="text-blue-600 text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Commandes en Ligne</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.orders}</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FaShoppingCart className="text-green-600 text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Livraisons Effectuées</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.livrison}</h3>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <FaBox className="text-yellow-600 text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Réservations</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.reservation}</h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FaCalendarAlt className="text-purple-600 text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Grille d'accès aux pages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto p-4">
        <Card 
          icon={<MdDashboard size={40} />} 
          title="Tableau de bord" 
          onClick={() => navigate("/user/admin/dashboard")}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100"
        />
        <Card 
          icon={<AiOutlineUser size={40} />} 
          title="Profil" 
          onClick={() => navigate("/user/admin/profile")}
          className="bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100"
        />
        <Card 
          icon={<MdFeedback size={40} />} 
          title="Feedbacks" 
          onClick={() => navigate("/user/admin/feedbacks")}
          className="bg-gradient-to-br from-green-50 to-teal-50 hover:from-green-100 hover:to-teal-100"
        />
        <Card 
          icon={<BiMessageAltError size={40} />} 
          title="Réclamations" 
          onClick={() => navigate("/user/admin/reclamations")}
          className="bg-gradient-to-br from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100"
        />
        <Card 
          icon={<AiOutlineShopping size={40} />} 
          title="Stock" 
          onClick={() => navigate("/user/admin/stock")}
          className="bg-gradient-to-br from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100"
        />
        <Card 
          icon={<MdReport size={40} />} 
          title="Voir les rapports" 
          onClick={() => navigate("/user/admin/rapports")}
          className="bg-gradient-to-br from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100"
        />
        <Card 
          icon={<AiOutlineTeam size={40} />} 
          title="Voir les servants" 
          onClick={() => navigate("/user/admin/servants")}
          className="bg-gradient-to-br from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100"
        />
        <Card 
          icon={<AiOutlineShopping size={40} />} 
          title="Fournisseurs" 
          onClick={() => navigate("/user/admin/fournisseur")}
          className="bg-gradient-to-br from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100"
        />
        <Card 
          icon={<MdOutlineRestaurant size={40} />} 
          title="Gestion des Tables" 
          onClick={() => navigate("/user/admin/tables")}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100"
        />
        <Card 
          icon={<BsListCheck size={40} />} 
          title="Gestion des Catégories" 
          onClick={() => navigate("/user/admin/categories")}
          className="bg-gradient-to-br from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100"
        />
        <Card 
          icon={<GiMeal size={40} />} 
          title="Gestion des Menus" 
          onClick={() => navigate("/user/admin/menus")}
          className="bg-gradient-to-br from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100"
        />
        <Card
          icon={<MdOutlineRestaurant size={40} />}
          title="Gestion des Réservations"
          onClick={() => navigate("/user/admin/reservations")}
          className="bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200"
        />
        <Card
          icon={<AiOutlineShopping size={40} />}
          title="Gestion des Commandes en Ligne"
          onClick={() => navigate("/user/admin/orders")}
          className="bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200"
        />
        <Card
          icon={<FaTruck size={40} />}
          title="Gestion des Livraisons"
          onClick={() => navigate("/user/admin/livrisons")}
          className="bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200"
        />
        <Card
          icon={<FaMotorcycle size={40} />}
          title="Gestion des Livreurs"
          onClick={() => navigate("/user/admin/livreurs")}
          className="bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200"
        />
      </div>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 mt-12 p-4 bg-white/50 backdrop-blur-sm rounded-lg shadow-sm">
        Admin Dashboard © {new Date().getFullYear()}
      </footer>

      <style>{`
        .animate-fade-in-up { 
          animation: fadeInUp 0.7s ease-out;
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.7s ease-out;
        }
        @keyframes fadeInUp { 
          from { 
            opacity: 0; 
            transform: translateY(30px); 
          } 
          to { 
            opacity: 1; 
            transform: translateY(0); 
          } 
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
}

const Card = ({ icon, title, onClick, className = "" }) => (
  <div
    onClick={onClick}
    className={`flex flex-col items-center justify-center shadow-lg hover:shadow-xl rounded-2xl p-6 transition-all duration-300 hover:scale-105 cursor-pointer text-center backdrop-blur-sm border border-white/50 ${className}`}
  >
    <div className="text-indigo-600 mb-3 transform transition-transform duration-300 hover:scale-110">{icon}</div>
    <h4 className="text-lg font-semibold text-gray-700">{title}</h4>
  </div>
);
