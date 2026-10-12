import React from 'react';
import { FaMapMarkerAlt, FaClock, FaDirections } from 'react-icons/fa';
import logo from '../Images/GoogleMapTA.jpg'; 

export default function Map() {
  return(
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex flex-col items-center justify-center py-10 px-2">
      {/* Bandeau d'intro */}
      <div className="flex flex-col items-center mb-8 animate-fade-in">
        <div className="bg-green-100 rounded-full p-4 mb-2 shadow-md">
          <FaMapMarkerAlt className="text-green-500 text-3xl" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-green-700 mb-2 text-center">Trouvez-nous sur Google Maps</h1>
        <p className="text-lg text-gray-600 text-center max-w-xl">Cliquez sur la carte pour accéder directement à l'emplacement du restaurant et obtenir l'itinéraire.</p>
      </div>

      {/* Carte principale */}
      <div className="bg-white rounded-3xl shadow-2xl flex flex-col items-center gap-6 p-10 w-full max-w-2xl animate-fade-in-up relative">
        {/* Badge Ouvert */}
        <span className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg z-10">Ouvert</span>
        <div className="flex flex-col items-center w-full">
          <div className="flex flex-col items-center mb-2">
            <span className="text-4xl text-green-400 animate-bounce">↓</span>
          </div>
          <a href="https://www.google.com/maps/place/%D9%85%D8%AF%D8%B1%D8%B3%D8%A9+%D8%A5%D8%A8%D8%AA%D8%AF%D8%A7%D8%A6%D9%8A%D8%A9+%D8%A5%D9%8A%D9%86+%D8%AD%D9%86%D8%A8%D9%84,+Ave+Abdelkader+Torres%D8%8C+%D8%A7%D9%84%D8%AF%D8%A7%D8%B1+%D8%A7%D9%84%D8%A8%D9%8A%D8%B6%D8%A7%D8%A1+20250%E2%80%AD/@33.586685,-7.5623884,18z/data=!4m12!1m5!3m4!2zMzPCsDM1JzEzLjIiTiA3wrAzMyc0Ni40Ilc!8m2!3d33.5869889!4d-7.5628967!3m5!1s0xda7ccde0434a095:0xb6503eb59ef1d7e1!8m2!3d33.587172!4d-7.563149!16s%2Fg%2F11bvtf3wqc?entry=ttu&g_ep=EgoyMDI1MDIwOS4wIKXMDSoJLDEwMjExMjMzSAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" className="group">
            <div className="relative">
              <img src={logo} alt="Carte Google Maps" className="w-full max-w-md rounded-2xl shadow-lg border-4 border-green-100 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-green-200 group-hover:shadow-2xl group-hover:ring-4 group-hover:ring-green-200 cursor-pointer" />
              {/* Effet halo coloré */}
              <span className="absolute inset-0 rounded-2xl pointer-events-none group-hover:shadow-[0_0_40px_10px_rgba(34,197,94,0.15)] transition-all duration-300" />
            </div>
          </a>
        </div>
        {/* Encadré info */}
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
          <div className="flex items-center gap-2 text-gray-700">
            <FaMapMarkerAlt className="text-green-400 text-lg" />
            <span className="font-medium">123 Hotel Street, City, Country</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <FaClock className="text-green-400 text-lg" />
            <span className="font-medium">Ouvert : 10h00 - 23h00</span>
          </div>
          <a href="https://www.google.com/maps/dir//33.587172,-7.563149" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full font-semibold shadow hover:bg-green-600 transition">
            <FaDirections /> Itinéraire
          </a>
        </div>
      </div>
      <style>{`
        .animate-fade-in { animation: fadeIn 1s; }
        .animate-fade-in-up { animation: fadeInUp 1s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
