import { useState, useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react"; // Assurez-vous d'avoir installé lucide-react: npm install lucide-react
import { useNavigate } from "react-router-dom";

export default function ProfileClient() {
  const [userData, setUserData] = useState({ 
    name: "",
    num: "", // Utiliser 'num' pour correspondre à l'objet API
    address: "",
    email: ""
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'
  const [loading, setLoading] = useState(true); 
  const [submitting, setSubmitting] = useState(false); 

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserData({
          name: parsedUser.name || "",
          num: parsedUser.num || "", // Charger le numéro de téléphone depuis 'num'
          address: parsedUser.address || "",
          email: parsedUser.email || ""
        });
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du parsing du user:", error);
        setLoading(false);
        setMessageType("error");
        setMessage("Erreur lors du chargement de vos informations.");
      }
    } else {
      // Rediriger vers la page de connexion si l'utilisateur n'est pas dans le localStorage
      navigate("/login");
    }
  }, [navigate]); 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(""); 
    setMessageType("");
    
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser || !storedUser.id) {
        throw new Error("User not found in localStorage");
      }

      // Vérification des champs obligatoires
      if (!userData.name || !userData.num || !userData.email) {
        setMessageType("error");
        setMessage("Veuillez remplir tous les champs obligatoires (Nom, Numéro, Email).");
        setSubmitting(false);
        return;
      }

      // Endpoint API pour le client
      const response = await fetch(`http://localhost:8000/api/user/client/${storedUser.id}`, {
        method: 'PUT', 
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        // Envoyer les données avec la structure attendue par l'API (num au lieu de phone)
        body: JSON.stringify({
          name: userData.name,
          num: userData.num,
          address: userData.address,
          email: userData.email
        }), 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      
      // Mettre à jour le stockage local avec les nouvelles données (en s'assurant d'utiliser la clé 'num')
      localStorage.setItem("user", JSON.stringify({
        ...storedUser, // Conserver les autres propriétés non modifiées si nécessaire
        name: updatedUser.name,
        num: updatedUser.num, // Utiliser 'num' ici
        address: updatedUser.address,
        email: updatedUser.email
      }));

      setMessageType("success");
      setMessage("Votre profil a été mis à jour avec succès !");

      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessageType("error");
      setMessage(error.message || "Une erreur est survenue lors de la mise à jour du profil");
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(-1); // Revenir à la page précédente
  };

  // Image par défaut générée depuis ui-avatars (basé sur le nom)
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    userData.name || 'Client'
  )}&background=0D8ABC&color=fff&size=128`;

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        <p className="mt-4 text-blue-500 font-semibold">Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-2xl font-bold text-gray-800">👤 Mon Profil Client</h2>
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

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-md p-6 space-y-6 hover:shadow-lg transition-shadow duration-300"
      >
        {/* Photo et Nom */}
        <div className="flex items-center gap-4">
           <img
             src={defaultAvatar}
             alt="Photo de profil"
             className="w-24 h-24 object-cover rounded-full border-2 border-gray-200"
           />
           <div>
             <p className="text-gray-700 font-medium text-lg">{userData.name || "Nom non défini"}</p>
           </div>
         </div>

        {/* Champs d'information */}
        <div>
          <label htmlFor="name" className="block text-gray-600 mb-2 font-medium">Nom</label>
          <input
            type="text"
            id="name"
            name="name"
            value={userData.name}
            onChange={handleInputChange}
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            placeholder="Entrez votre nom"
            required 
          />
        </div>

        <div>
          <label htmlFor="num" className="block text-gray-600 mb-2 font-medium">Numéro de téléphone</label>
          <input
            type="tel" 
            id="num"
            name="num"
            value={userData.num}
            onChange={handleInputChange}
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            placeholder="Entrez votre numéro de téléphone"
            required
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-gray-600 mb-2 font-medium">Adresse</label>
          <input
            type="text"
            id="address"
            name="address"
            value={userData.address}
            onChange={handleInputChange}
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            placeholder="Entrez votre adresse"
            // L'adresse est facultative, donc pas de `required`
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-gray-600 mb-2 font-medium">Email</label>
          <input
            type="email" 
            id="email"
            name="email"
            value={userData.email}
            onChange={handleInputChange}
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            placeholder="Entrez votre email"
            required 
          />
        </div>

        {/* Bouton enregistrer */}
        <div className="text-right">
          <button
            type="submit"
            className="relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-medium text-white transition duration-300 ease-out rounded-lg shadow-md group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={submitting} 
          >
             <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 -translate-x-full bg-gradient-to-r from-blue-700 to-blue-800 group-hover:translate-x-0 ease">
               {submitting ? (
                 <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0116 0H4z"></path>
                 </svg>
               ) : (
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                 </svg>
               )}
             </span>
            <span className="absolute flex items-center justify-center w-full h-full text-white transition-all duration-300 transform group-hover:translate-x-full ease">{submitting ? 'Enregistrement...' : 'Enregistrer'}</span>
             <span className="relative invisible">Enregistrer</span> 
          </button>
        </div>
      </form>
    </div>
  );
} 