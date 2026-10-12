import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";

export default function StatusLivreur() {
  const [status, setStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchLivreurStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (!token || !storedUser) {
          setMessageType("error");
          setMessage("Vous devez être connecté pour accéder à cette page.");
          setTimeout(() => {
            navigate("/login");
          }, 2000);
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        const userId = parsedUser.id;

        const response = await fetch(`http://localhost:8000/api/getstatus/${userId}`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch livreur status');
        }

        const data = await response.json();
        setStatus(data.status === "actif");
        setLoading(false);
      } catch (error) {
        console.error("Error fetching livreur status:", error);
        setLoading(false);
        setMessageType("error");
        setMessage("Erreur lors du chargement de votre statut.");
      }
    };

    fetchLivreurStatus();
  }, [navigate]);

  const handleStatusChange = async () => {
    setIsUpdating(true);
    setMessage("");
    setMessageType("");

    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (!token || !storedUser) {
        setMessageType("error");
        setMessage("Vous devez être connecté pour effectuer cette action.");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      const userId = parsedUser.id;

      const response = await fetch(`http://localhost:8000/api/updateStatus/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: status ? "inactif" : "actif"
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      setStatus(!status);
      setMessageType("success");
      setMessage(`Vous êtes maintenant ${!status ? 'actif' : 'inactif'}`);
    } catch (error) {
      console.error("Error updating status:", error);
      setMessageType("error");
      setMessage("Erreur lors de la mise à jour de votre statut.");
    } finally {
      setIsUpdating(false);
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        <p className="mt-4 text-blue-500 font-semibold">Chargement du statut...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">🔄 Modifier mon statut</h2>
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
        >
          Retour
        </button>
      </div>

      {/* Notification */}
      {message && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg transform transition-all duration-500 ease-in-out z-50 ${
          messageType === "success" 
            ? "bg-green-100 border-l-4 border-green-500" 
            : "bg-red-100 border-l-4 border-red-500"
        }`}>
          <div className="flex items-center">
            {messageType === "success" ? (
              <CheckCircle2 className="h-6 w-6 text-green-500 mr-2" />
            ) : (
              <XCircle className="h-6 w-6 text-red-500 mr-2" />
            )}
            <p className={`font-medium ${
              messageType === "success" ? "text-green-700" : "text-red-700"
            }`}>
              {message}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Statut actuel : 
            <span className={`ml-2 ${status ? 'text-green-600' : 'text-red-600'}`}>
              {status ? 'Actif' : 'Inactif'}
            </span>
          </h3>
          <p className="text-gray-600">
            {status 
              ? "Vous êtes actuellement disponible pour les livraisons."
              : "Vous êtes actuellement indisponible pour les livraisons."}
          </p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleStatusChange}
            disabled={isUpdating}
            className={`relative inline-flex items-center h-14 rounded-full w-28 transition-colors duration-300 ease-in-out focus:outline-none ${
              status 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-red-500 hover:bg-red-600'
            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`inline-block w-12 h-12 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${
                status ? 'translate-x-14' : 'translate-x-2'
              }`}
            />
            <span className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
              <span className={`text-xs font-medium ${status ? 'text-white' : 'text-transparent'}`}>
                ON
              </span>
              <span className={`text-xs font-medium ${status ? 'text-transparent' : 'text-white'}`}>
                OFF
              </span>
            </span>
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            {status 
              ? "En mode actif, vous recevrez des notifications pour les nouvelles livraisons."
              : "En mode inactif, vous ne recevrez pas de nouvelles livraisons."}
          </p>
        </div>
      </div>
    </div>
  );
}
