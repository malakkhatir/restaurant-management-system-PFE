import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../Api/api';
import { Smartphone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
const API_BASE_URL = "http://localhost:8000"; 

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMobileQR, setShowMobileQR] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Générer un ID unique pour la session mobile
  const mobileSessionId = React.useMemo(() => {
    return Math.random().toString(36).substring(2, 15);
  }, []);

  // Données à encoder dans le QR code
  const qrCodeData = `${window.location.origin}/login?mobile=true`;

  // Vérifier périodiquement si la connexion mobile a été effectuée
  useEffect(() => {
    let interval;
    if (showMobileQR) {
      interval = setInterval(async () => {
        try {
          const response = await api.get(`/check-mobile-login/${mobileSessionId}`);
          if (response.data.authenticated) {
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            navigate('/user/' + response.data.user.role, { 
              state: { successMessage: "Connexion mobile réussie !" } 
            });
          }
        } catch (error) {
          console.error('Erreur lors de la vérification de la connexion mobile:', error);
        }
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showMobileQR, mobileSessionId, navigate]);

  // Vérifier si nous sommes sur la page mobile de connexion
  const isMobileLogin = location.search.includes('mobile=true');

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.includes('@') || password.length < 6) {
      setErrorMessage('Veuillez remplir correctement les champs.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      const response = await api.post('/login', {
        email,
        password
      });

      if (isMobileLogin) {
        // Si c'est une connexion mobile, on envoie juste la confirmation
        await api.post('/confirm-mobile-login', {
          sessionId: mobileSessionId,
          token: response.data.token,
          user: response.data.user
        });
        navigate('/mobile-login-success');
      } else {
        // Connexion normale
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        if (response.data.user.role === 'admin') {
          navigate('/user/admin', { state: { successMessage: "Connexion réussie !" } }); 
        } else if (response.data.user.role === 'client') {
          navigate('/user/client', { state: { successMessage: "Connexion réussie !" } });
        } else if (response.data.user.role === 'livreur') {
          navigate('/user/livreur', { state: { successMessage: "Connexion réussie !" } });
        } else {
          navigate('/user/servant', { state: { successMessage: "Connexion réussie !" } });
        }
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.message || 'Erreur de connexion.');
      } else {
        setErrorMessage('Erreur de connexion.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Si nous sommes sur la page mobile, afficher uniquement le formulaire de connexion
  if (isMobileLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-20">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md space-y-6 my-8"
        >
          <h2 className="text-2xl font-semibold text-gray-800 text-center">Connexion Mobile</h2>

          {errorMessage && (
            <div className="bg-red-100 text-red-800 p-3 rounded-xl text-center">
              {errorMessage}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Adresse e-mail</label>
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Mot de passe</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center gap-2 bg-black text-white py-2 rounded-xl text-base font-medium shadow transition duration-300 ${
                loading ? "bg-gray-400 cursor-not-allowed" : "hover:bg-gray-900"
              }`}
            >
              {loading && (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              )}
              {loading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Page de connexion normale
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-20">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md space-y-6 my-8"
      >
        <h2 className="text-2xl font-semibold text-gray-800 text-center">Connexion</h2>

        {errorMessage && (
          <div className="bg-red-100 text-red-800 p-3 rounded-xl text-center">
            {errorMessage}
          </div>
        )}

        {/* Option de connexion mobile */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setShowMobileQR(!showMobileQR)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200"
          >
            <Smartphone size={20} />
            <span>Connexion Mobile</span>
          </button>
        </div>

        {/* Mobile QR Code */}
        {showMobileQR && (
          <div className="w-full max-w-sm mx-auto p-4 bg-white rounded-xl shadow-lg mb-8">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Connexion Mobile</h3>
              <p className="text-sm text-gray-600">
                Scannez ce QR code avec votre téléphone pour vous connecter
              </p>
            </div>
            <div className="flex justify-center p-4 bg-white rounded-lg">
              <QRCodeSVG
                value={qrCodeData}
                size={200}
                level="H"
                includeMargin={true}
                className="rounded-lg"
              />
            </div>
            <p className="text-xs text-center text-gray-500 mt-4">
              Le QR code expire dans 5 minutes
            </p>
          </div>
        )}

        {/* Login Form */}
        {!showMobileQR && (
          <div className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Adresse e-mail</label>
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Mot de passe</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center gap-2 bg-black text-white py-2 rounded-xl text-base font-medium shadow transition duration-300 ${
                loading ? "bg-gray-400 cursor-not-allowed" : "hover:bg-gray-900"
              }`}
            >
              {loading && (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              )}
              {loading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </div>
        )}

        <div className="flex flex-col gap-3 mt-4">
          <a
            href={`${API_BASE_URL}/api/auth/google/redirect`}
            className="flex items-center justify-center gap-3 bg-white text-gray-700 font-semibold py-2 rounded-xl w-full text-base shadow hover:shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 no-underline"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Connexion avec Google
          </a>

          <a
            href={`${API_BASE_URL}/api/auth/facebook/redirect`}
            className="flex items-center justify-center gap-3 bg-[#1877F2] text-white font-semibold py-2 rounded-xl w-full text-base shadow hover:shadow-md hover:bg-[#145dbf] focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 no-underline"
          >
            <img
              src="https://www.svgrepo.com/show/157818/facebook.svg"
              alt="Facebook"
              className="w-5 h-5 invert"
            />
            Connexion avec Facebook
          </a>
        </div>

        {/* Register Link */}
        <p className="text-sm text-center text-gray-500 mt-4">
          Vous n'avez pas de compte ?{' '}
          <a href="/register" className="text-black hover:underline">
            S'inscrire
          </a>
        </p>
      </form>
    </div>
  );
}
