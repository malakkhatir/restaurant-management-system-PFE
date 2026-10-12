import React, { useState } from 'react';
import { FaPhoneAlt } from 'react-icons/fa';

export default function CallButton({ phoneNumber = "060004040" }) {
  const [showNumber, setShowNumber] = useState(false);

  const handleCall = () => {
    if (showNumber) {
      setShowNumber(false);
    } else {
      setShowNumber(true);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50">
      <button
        onClick={handleCall}
        className="group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
      >
        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
        <FaPhoneAlt className="text-xl sm:text-2xl transform group-hover:rotate-12 transition-transform duration-300" />
        <span className="absolute -top-10 sm:-top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded-lg text-xs sm:text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Appelez-nous
        </span>
      </button>

      {/* Numéro qui sort du bouton */}
      {showNumber && (
        <div className="fixed bottom-20 left-4 sm:bottom-24 sm:left-6 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pop-out">
          <div className="flex items-center gap-2">
            <FaPhoneAlt className="text-lg" />
            <span className="font-semibold">{phoneNumber}</span>
          </div>
        </div>
      )}

      {/* Animation styles */}
      <style>{`
        .animate-pop-out {
          animation: popOut 0.3s ease-out;
        }
        @keyframes popOut {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
} 