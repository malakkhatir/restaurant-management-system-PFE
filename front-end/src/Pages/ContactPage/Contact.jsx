import React from 'react';
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaRegPaperPlane } from 'react-icons/fa';
import logo from '../Images/logo1.jpg';

export default function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col items-center justify-center py-8 px-2">
      {/* Encadré d'intro */}
      <div className="flex flex-col items-center mb-8 animate-fade-in">
        <div className="bg-blue-100 rounded-full p-4 mb-2 shadow-md">
          <FaRegPaperPlane className="text-blue-500 text-3xl" />
        </div>
        <h1 className="text-4xl font-bold text-blue-700 mb-2 text-center">Contactez-nous</h1>
        <p className="text-lg text-gray-600 text-center max-w-xl">
          Nous sommes ravis de vous aider à réserver une table ou à passer une commande.<br />
          N'hésitez pas à nous contacter via les informations ci-dessous !
        </p>
      </div>

      {/* Carte de contact */}
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row items-center md:items-start gap-10 p-10 w-full max-w-3xl animate-fade-in-up">
        <div className="flex-shrink-0 flex justify-center w-full md:w-auto">
          <img src={logo} alt="Hotel" className="w-44 h-44 object-cover rounded-full border-4 border-blue-200 shadow-lg" />
        </div>
        <div className="flex-1 w-full">
          <h2 className="text-2xl font-semibold text-blue-600 mb-4 flex items-center gap-2">
            <FaRegPaperPlane className="text-blue-400" /> Informations de contact
          </h2>
          <ul className="space-y-5 mb-6">
            <li className="flex items-center gap-3">
              <FaEnvelope className="text-blue-400 text-xl" />
              <span className="font-medium text-gray-800">Email :</span>
              <a href="mailto:support@hotel.com" className="text-blue-500 hover:underline hover:text-blue-700 transition">support@hotel.com</a>
            </li>
            <li className="flex items-center gap-3">
              <FaPhoneAlt className="text-blue-400 text-xl" />
              <span className="font-medium text-gray-800">Téléphone :</span>
              <a href="tel:+1234567890" className="text-blue-500 hover:underline hover:text-blue-700 transition">+1 (234) 567-890</a>
            </li>
            <li className="flex items-center gap-3">
              <FaMapMarkerAlt className="text-blue-400 text-xl" />
              <span className="font-medium text-gray-800">Adresse :</span>
              <span className="text-gray-700">123 Hotel Street, City, Country</span>
            </li>
          </ul>
          <div className="flex gap-4 mt-4">
            <a href="tel:+1234567890" className="inline-block px-6 py-2 bg-blue-500 text-white rounded-full font-semibold shadow hover:bg-blue-600 transition">Appeler</a>
            <a href="mailto:support@hotel.com" className="inline-block px-6 py-2 bg-white border border-blue-500 text-blue-600 rounded-full font-semibold shadow hover:bg-blue-50 transition">Envoyer un email</a>
          </div>
        </div>
      </div>

      {/* Animations Tailwind custom */}
      <style>{`
        .animate-fade-in { animation: fadeIn 1s; }
        .animate-fade-in-up { animation: fadeInUp 1s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
