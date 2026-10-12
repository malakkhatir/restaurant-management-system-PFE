import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  Package,
  Clock,
  User,
  AlertCircle,
  Download,
  Filter,
} from "lucide-react";
import html2canvas from "html2canvas";

export default function Historique() {
  const [livraisons, setLivraisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(null);
  const [filter, setFilter] = useState("all"); // "all", "livree", "annulee"
  const [sortBy, setSortBy] = useState("date"); // "date", "status"
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistorique = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        if (!token || !storedUser) {
          setError("Vous devez être connecté pour accéder à cette page.");
          setTimeout(() => {
            navigate("/login");
          }, 2000);
          return;
        }
        const parsedUser = JSON.parse(storedUser);
        const userId = parsedUser.id;

        const response = await fetch(
          `http://localhost:8000/api/getlivrisonbylivreur/${userId}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch historique");
        }

        const data = await response.json();
        setLivraisons(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching historique:", error);
        setError("Erreur lors du chargement de l'historique.");
        setLoading(false);
      }
    };

    fetchHistorique();
  }, [navigate]);

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  const parseMenuItems = (menuString) => {
    try {
      return JSON.parse(menuString);
    } catch (error) {
      console.error("Error parsing menu:", error);
      return [];
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "en_cours":
        return "bg-yellow-100 text-yellow-800";
      case "livree":
        return "bg-green-100 text-green-800";
      case "annulee":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "en_cours":
        return "En cours";
      case "livree":
        return "Livrée";
      case "annulee":
        return "Annulée";
      default:
        return status;
    }
  };

  const handleDownload = async (livraisonId) => {
    setDownloading(livraisonId);
    try {
      const element = document.getElementById(`livraison-${livraisonId}`);
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `livraison-${livraisonId}-${new Date()
        .toISOString()
        .split("T")[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading livraison:", error);
      setError("Erreur lors du téléchargement de la livraison.");
    } finally {
      setDownloading(null);
    }
  };

  const filteredAndSortedLivraisons = livraisons
    .filter((livraison) => filter === "all" || livraison.status === filter)
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      return a.status.localeCompare(b.status);
    });

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        <p className="mt-4 text-blue-500 font-semibold">Chargement de l'historique...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <p className="text-red-500 text-lg font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">📋 Historique des Livraisons</h2>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
        >
          Retour
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="livree">Livrées</option>
            <option value="annulee">Annulées</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Trier par date</option>
            <option value="status">Trier par statut</option>
          </select>
        </div>
      </div>

      {filteredAndSortedLivraisons.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Aucune livraison trouvée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedLivraisons.map((livraison) => {
            const menuItems = parseMenuItems(livraison.orders.menu);
            return (
              <div
                key={livraison.id_livrison}
                id={`livraison-${livraison.id_livrison}`}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        livraison.status
                      )}`}
                    >
                      {getStatusText(livraison.status)}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(livraison.id_livrison)}
                        disabled={downloading === livraison.id_livrison}
                        className="p-2 text-gray-600 hover:text-blue-600 transition-colors rounded-full hover:bg-gray-100"
                        title="Télécharger la livraison"
                      >
                        {downloading === livraison.id_livrison ? (
                          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Download className="w-5 h-5" />
                        )}
                      </button>
                      <span className="text-sm text-gray-500">
                        {formatDate(livraison.date_livrison)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-gray-500 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-800">{livraison.user.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Phone className="w-4 h-4" />
                          <span>{livraison.user.num}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Mail className="w-4 h-4" />
                          <span>{livraison.user.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                      <div>
                        <h4 className="font-medium text-gray-700">Adresse de livraison</h4>
                        <p className="text-sm text-gray-600">{livraison.address}</p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-700 mb-2">Détails de la commande</h4>
                      <div className="space-y-2">
                        {menuItems.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {item.quantity}x {item.title}
                            </span>
                            <span className="text-gray-800 font-medium">
                              {item.total} DH
                            </span>
                          </div>
                        ))}
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between font-medium">
                            <span>Total</span>
                            <span>{livraison.orders.total_price} DH</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>Commande créée le {formatDate(livraison.orders.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}