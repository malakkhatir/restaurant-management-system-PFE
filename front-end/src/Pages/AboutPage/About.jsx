import React from "react";
import { FaStar, FaLeaf, FaSmile, FaHeart } from 'react-icons/fa';
import aboutImage from '../Images/logo6.jpg';

export default function About() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100 flex flex-col items-center justify-center py-10 px-2">
            {/* Bandeau d'intro */}
            <div className="flex flex-col items-center mb-10 animate-fade-in">
                <div className="bg-yellow-100 rounded-full p-4 mb-2 shadow-md">
                    <FaStar className="text-yellow-500 text-3xl" />
                </div>
                <h1 className="text-4xl font-extrabold text-yellow-700 mb-2 text-center">À propos de notre restaurant</h1>
                <p className="text-xl text-gray-600 text-center max-w-2xl italic">"Là où la passion rencontre la saveur"</p>
            </div>

            {/* Séparateur décoratif */}
            <div className="w-24 h-1 bg-yellow-300 rounded-full mb-10 animate-fade-in" />

            {/* Carte principale */}
            <div className="bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row items-center md:items-start gap-10 p-10 w-full max-w-4xl animate-fade-in-up">
                <img 
                    src={aboutImage} 
                    alt="À propos de nous" 
                    className="w-64 h-64 object-cover rounded-2xl shadow-lg border-4 border-yellow-100 mb-6 md:mb-0 transform transition-transform duration-300 hover:scale-105" 
                />
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-yellow-700 mb-4">Notre histoire</h2>
                    <p className="text-lg text-gray-700 mb-4">
                        Bienvenue dans notre restaurant ! Nous nous engageons à offrir une expérience culinaire exceptionnelle et à ravir vos papilles avec des plats savoureux, préparés avec des ingrédients frais et de qualité.
                    </p>
                    <p className="text-lg text-gray-700 mb-4">
                        Notre mission est de créer un environnement chaleureux et accueillant où chaque client se sent comme chez lui. Que ce soit pour un repas en famille, entre amis ou un événement spécial, nous sommes là pour vous servir avec passion et professionnalisme.
                    </p>
                    <p className="text-lg text-gray-700">
                        Merci de choisir notre restaurant. Nous avons hâte de vous accueillir et de partager avec vous des moments gourmands inoubliables !
                    </p>
                </div>
            </div>

            {/* Encadré Nos valeurs */}
            <div className="mt-12 mb-10 w-full max-w-4xl animate-fade-in-up">
                <h3 className="text-2xl font-bold text-yellow-700 mb-6 text-center">Nos valeurs</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="flex flex-col items-center bg-yellow-50 rounded-xl p-6 shadow hover:shadow-lg transition">
                        <FaLeaf className="text-green-500 text-3xl mb-2" />
                        <span className="font-semibold text-gray-800 mb-1">Fraîcheur</span>
                        <span className="text-gray-600 text-center text-sm">Des ingrédients locaux et de saison pour une cuisine authentique.</span>
                    </div>
                    <div className="flex flex-col items-center bg-yellow-50 rounded-xl p-6 shadow hover:shadow-lg transition">
                        <FaSmile className="text-yellow-400 text-3xl mb-2" />
                        <span className="font-semibold text-gray-800 mb-1">Accueil</span>
                        <span className="text-gray-600 text-center text-sm">Un service chaleureux et attentionné pour chaque client.</span>
                    </div>
                    <div className="flex flex-col items-center bg-yellow-50 rounded-xl p-6 shadow hover:shadow-lg transition">
                        <FaHeart className="text-red-400 text-3xl mb-2" />
                        <span className="font-semibold text-gray-800 mb-1">Passion</span>
                        <span className="text-gray-600 text-center text-sm">Une équipe passionnée par la gastronomie et le partage.</span>
                    </div>
                    <div className="flex flex-col items-center bg-yellow-50 rounded-xl p-6 shadow hover:shadow-lg transition">
                        <FaStar className="text-yellow-500 text-3xl mb-2" />
                        <span className="font-semibold text-gray-800 mb-1">Qualité</span>
                        <span className="text-gray-600 text-center text-sm">Des plats savoureux, préparés avec soin et exigence.</span>
                    </div>
                </div>
            </div>

            {/* Citation / Témoignage */}
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-8 flex flex-col items-center animate-fade-in">
                <p className="text-lg italic text-gray-700 text-center mb-4">“Un lieu où chaque repas devient un souvenir inoubliable. Merci pour votre accueil et la qualité de vos plats !”</p>
                <span className="text-yellow-700 font-bold">— Client satisfait</span>
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
