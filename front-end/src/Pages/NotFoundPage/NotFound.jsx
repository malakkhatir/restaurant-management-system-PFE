import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    };

    const goHome = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 px-4 py-12">
            <div className="relative w-full max-w-2xl">
                {/* Cercle décoratif */}
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

                {/* Contenu principal */}
                <div className="relative bg-white/80 backdrop-blur-lg p-8 sm:p-12 rounded-3xl shadow-2xl transform transition-all duration-500 hover:scale-[1.02]">
                    {/* Icône 404 */}
                    <div className="flex justify-center mb-8">
                        <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-6xl font-bold text-white">404</span>
                        </div>
                    </div>

                    {/* Message d'erreur */}
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4 text-center">
                        Oups ! Page introuvable
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 mb-8 text-center max-w-lg mx-auto">
                        La page que vous recherchez semble avoir disparu dans le cyberespace.
                    </p>

                    {/* Boutons */}
                    <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
                        <button
                            onClick={goBack}
                            className="group relative px-8 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-gray-800/30"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Retour
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                        </button>

                        <button
                            onClick={goHome}
                            className="group relative px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/30"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                Retour à l'accueil
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                        </button>
                    </div>

                    {/* Message supplémentaire */}
                    <p className="mt-8 text-sm text-gray-500 text-center">
                        Besoin d'aide ? Contactez notre support
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
