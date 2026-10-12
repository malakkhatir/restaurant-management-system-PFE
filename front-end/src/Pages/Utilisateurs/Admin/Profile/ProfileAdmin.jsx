import { useState, useEffect } from "react";
import { Camera, CheckCircle2, XCircle } from "lucide-react";

export default function ProfileAdmin() {
  const [userData, setUserData] = useState({
    name: "",
    num: "",
    address: "",
    email: "",
    photo: null,
    preview: null
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserData(prev => ({
          ...prev,
          name: parsedUser.name || "Admin",
          num: parsedUser.num || "",
          address: parsedUser.address || "",
          email: parsedUser.email || ""
        }));
      } catch (error) {
        console.error("Erreur lors du parsing du user:", error);
        setUserData(prev => ({
          ...prev,
          name: "Admin"
        }));
      }
    }
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserData(prev => ({
        ...prev,
        photo: file,
        preview: URL.createObjectURL(file)
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const response = await fetch(`http://localhost:8000/api/users/${storedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: userData.name,
          num: userData.num,
          address: userData.address,
          email: userData.email
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      
      // Update local storage with new user data
      localStorage.setItem("user", JSON.stringify({
        ...storedUser,
        name: userData.name,
        num: userData.num,
        address: userData.address,
        email: userData.email
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
      setMessage("Une erreur est survenue lors de la mise à jour du profil");
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  // Image par défaut générée depuis ui-avatars
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    userData.name
  )}&background=0D8ABC&color=fff&size=128`;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">👤 Mon Profil</h2>

      {message && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg transform transition-all duration-500 ease-in-out ${
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
        {/* Photo */}
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 group">
            <img
              src={userData.preview || defaultAvatar}
              alt="Photo de profil"
              className="w-full h-full object-cover rounded-full border-2 border-gray-200 transition-transform duration-300 group-hover:scale-105"
            />
            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors duration-300 shadow-lg">
              <Camera size={20} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </label>
          </div>
          <div>
            <p className="text-gray-700 font-medium text-lg">{userData.name || "Chargement..."}</p>
          </div>
        </div>
        
        <div>
          <label className="block text-gray-600 mb-2 font-medium">Nom</label>
          <input
            type="text"
            name="name"
            value={userData.name}
            onChange={handleInputChange}
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            placeholder="Entrez votre nom"
            required
          />
        </div>

        <div>
          <label className="block text-gray-600 mb-2 font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={userData.email}
            onChange={handleInputChange}
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            placeholder="Entrez votre email"
            required
          />
        </div>

        <div>
          <label className="block text-gray-600 mb-2 font-medium">Numéro de téléphone</label>
          <input
            type="tel"
            name="num"
            value={userData.num}
            onChange={handleInputChange}
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            placeholder="Entrez votre numéro de téléphone"
            required
          />
        </div>

        <div>
          <label className="block text-gray-600 mb-2 font-medium">Adresse</label>
          <input
            type="text"
            name="address"
            value={userData.address}
            onChange={handleInputChange}
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            placeholder="Entrez votre adresse"
          />
        </div>

        {/* Bouton enregistrer */}
        <div className="text-right">
          <button
            type="submit"
            className="relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-medium text-white transition duration-300 ease-out rounded-lg shadow-md group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 -translate-x-full bg-gradient-to-r from-blue-700 to-blue-800 group-hover:translate-x-0 ease">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </span>
            <span className="absolute flex items-center justify-center w-full h-full text-white transition-all duration-300 transform group-hover:translate-x-full ease">Enregistrer</span>
            <span className="relative invisible">Enregistrer</span>
          </button>
        </div>
      </form>

      {/* Bouton pour revenir */}
      <div className="mt-6 text-center">
        <button
          onClick={handleBack}
          className="relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-medium text-white transition duration-300 ease-out rounded-lg shadow-md group bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700"
        >
          <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 -translate-x-full bg-gradient-to-r from-gray-600 to-gray-700 group-hover:translate-x-0 ease">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          </span>
          <span className="absolute flex items-center justify-center w-full h-full text-white transition-all duration-300 transform group-hover:translate-x-full ease">Retour</span>
          <span className="relative invisible">Retour</span>
        </button>
      </div>
    </div>
  );
}
