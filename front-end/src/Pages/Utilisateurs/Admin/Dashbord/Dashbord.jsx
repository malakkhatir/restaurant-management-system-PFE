import React, { useEffect, useState } from 'react';
import { ArrowLeft, DollarSign, ChefHat, Receipt, Users, MessageCircle, TrendingUp, LogOut, Mail, Phone, Truck, ShoppingCart, Calendar, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from './../../../../Api/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWorkers: 0,
    totalRevenue: 0,
    totalOrders: 0
  });
  const [servants, setServants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [deliveryStats, setDeliveryStats] = useState({
    reservation: 0,
    orders: 0,
    livreur: 0,
    livrison: 0
  });

  const fetchTotalWorkers = async () => {
    try {
      const response = await api.get('/total-workers');
      console.log(response.data);
      if (response.data) {
        setStats(prev => ({
          ...prev,
          totalUsers: response.data.total_workers || 0
        }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement du nombre total de clients:', error);
      setStats(prev => ({
        ...prev,
        totalUsers: 0
      }));
    }
  };

  const fetchServants = async () => {
    try {
      setLoading(true);
      const response = await api.get('/servants');
      if (response.data && Array.isArray(response.data)) {
        setServants(response.data);
        setStats(prev => ({
          ...prev,
          totalWorkers: response.data.length
        }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoadingPayments(true);
      const response = await api.get('/sales');
      if (response.data && response.data.data) {
        const sortedSales = response.data.data.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        setPayments(sortedSales);

        const totalRevenue = sortedSales.reduce((sum, sale) => {
          const price = parseFloat(sale.total_price) || 0;
          return sum + price;
        }, 0);

        setStats(prev => ({
          ...prev,
          totalRevenue,
          totalOrders: sortedSales.length
        }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des ventes:', error);
    } finally {
      setLoadingPayments(false);
    }
  };

  const fetchDeliveryStats = async () => {
    try {
      const response = await api.get('/nombrestatic');
      setDeliveryStats(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques de livraison:', error);
    }
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchServants(), 
        fetchPayments(),
        fetchTotalWorkers(),
        fetchDeliveryStats()
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    if (!token || !user) {
      navigate('/login');
    } else {
      if (user.role === 'client') {
        navigate('/user/client');
      } else if (user.role === 'admin') {
        navigate('/user/admin/dashboard');
      } else {
        navigate('/user/servant');
      }
    }

    fetchAllData();

    const refreshInterval = setInterval(fetchAllData, 5 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, []);

  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/user/admin/")}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Bienvenue, {user?.name || 'Propriétaire'} 👋
            </h1>
            <p className="text-sm text-gray-500 mt-1">Vue d'ensemble de votre restaurant</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Stats Overview */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenus Totaux</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900">{stats.totalRevenue.toLocaleString('fr-FR')} €</h3>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>

          {/* Total Orders Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Commandes</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900">{stats.totalOrders}</h3>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Receipt className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Total Workers Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Employés</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900">{stats.totalWorkers}</h3>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <ChefHat className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Total Users Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clients</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900">{stats.totalUsers}</h3>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <Users className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </div>

          {/* Réservations Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Réservations</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900">{deliveryStats.reservation}</h3>
              </div>
              <div className="p-3 bg-indigo-50 rounded-full">
                <Calendar className="w-6 h-6 text-indigo-500" />
              </div>
            </div>
          </div>
        </section>

        {/* Delivery Stats Section */}
        <section className="mt-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Truck className="w-6 h-6 text-blue-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Statistiques de Livraison</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Livreurs Card */}
              <div className="bg-gray-50 p-6 rounded-xl hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Livreurs Actifs</p>
                    <h3 className="text-2xl font-bold mt-2 text-gray-900">{deliveryStats.livreur}</h3>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-full">
                    <Users className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              </div>

              {/* Commandes en Ligne Card */}
              <div className="bg-gray-50 p-6 rounded-xl hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Commandes en Ligne</p>
                    <h3 className="text-2xl font-bold mt-2 text-gray-900">{deliveryStats.orders}</h3>
                  </div>
                  <div className="p-3 bg-green-50 rounded-full">
                    <ShoppingCart className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </div>

              {/* Livraisons Card */}
              <div className="bg-gray-50 p-6 rounded-xl hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Livraisons Effectuées</p>
                    <h3 className="text-2xl font-bold mt-2 text-gray-900">{deliveryStats.livrison}</h3>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-full">
                    <Package className="w-6 h-6 text-yellow-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Employees Section */}
        <section className="mt-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Liste des Employés</h2>
              </div>
              <button 
                onClick={() => navigate('/user/admin/servants')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Voir tout
              </button>
            </div>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : servants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {servants.slice(0, 3).map((servant) => (
                  <div key={servant.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        {servant.avatar ? (
                          <img 
                            src={servant.avatar} 
                            alt={servant.name} 
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <Users className="w-6 h-6 text-blue-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{servant.name}</h3>
                        <p className="text-sm text-gray-500">{servant.role || 'Employé'}</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      {servant.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span>{servant.email}</span>
                        </div>
                      )}
                      {servant.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{servant.phone}</span>
                        </div>
                      )}
                      {servant.status && (
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            servant.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {servant.status === 'active' ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Aucun employé trouvé</p>
                <button 
                  onClick={() => fetchServants()}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Rafraîchir
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Payments Section */}
        <section className="mt-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Commandes Récentes</h2>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => fetchPayments()}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Rafraîchir
                </button>
                <button 
                  onClick={() => navigate('/user/admin/ventes')}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Voir tout
                </button>
              </div>
            </div>
            {loadingPayments ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : payments.length > 0 ? (
              <div className="space-y-4">
                {payments.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-green-50 rounded-full">
                        <DollarSign className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-800">
                            Commande #{sale.id}
                          </h3>
                          <span className="text-sm text-gray-500">
                            Table {sale.table?.name || sale.table_id}
                          </span>
                        </div>
                        <div className="mt-1">
                          {sale.menus?.map((menu, index) => (
                            <div key={index} className="text-sm text-gray-600">
                              {menu.quantity} x {menu.title}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-500">
                            Serveur: {sale.servant?.name || 'Non assigné'}
                          </span>
                          <span className="text-sm text-gray-500">
                            • {new Date(sale.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {sale.total_price.toLocaleString('fr-FR')} €
                      </p>
                      <div className="flex flex-col items-end gap-1 mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          sale.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : sale.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {sale.payment_status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {sale.payment_type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Aucune commande trouvée</p>
                <button 
                  onClick={() => fetchPayments()}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Rafraîchir
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}