import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import logo from '../Images/logo2.jpg';

const Home = () => {
    const navigate = useNavigate();
    const [isConnected, setIsConnected] = useState(false);
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const user = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (user && token) {
            setIsConnected(true);
            const userData = JSON.parse(user);
            setUserRole(userData.role);
        }
    }, []);

    const handleReservation = () => {
        if (!isConnected) {
            navigate('/login');
            return;
        }

        switch (userRole) {
            case 'admin':
                navigate('/user/admin');
                break;
            case 'client':
                navigate('/user/client');
                break;
            case 'servant':
                navigate('/user/servant');
                break;
            default:
                navigate('/login');
        }
    };

  return (
        <div className="min-h-screen bg-gray-100">
            {/* Section Hero */}
            <div className="relative min-h-screen">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <img
                        src={logo}
                        alt="Restaurant Background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black opacity-50"></div>
                </div>

                {/* Content */}
                <div className="relative z-0 pt-16 xs:pt-20 flex flex-col items-center justify-center min-h-screen text-white px-4">
                    <h1 className="text-4xl xs:text-5xl md:text-6xl font-bold text-center mb-4 xs:mb-6 animate-fade-in">
                        Bienvenue chez Restaurant
                    </h1>
                    
                    <p className="text-lg xs:text-xl md:text-2xl text-center mb-6 xs:mb-8 max-w-[320px] xs:max-w-2xl animate-fade-in-delay">
                        Découvrez une expérience culinaire exceptionnelle
                    </p>

                    {isConnected ? (
                        <div className="text-center animate-scale-in">
                            <h2 className="text-xl xs:text-2xl font-semibold mb-3 xs:mb-4">
                                Bienvenue {userRole === 'admin' ? 'Administrateur' : 
                                         userRole === 'client' ? 'Client' : 
                                         userRole === 'servant' ? 'Serveur' : ''}
                            </h2>
                            <button
                                onClick={handleReservation}
                                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2.5 xs:py-3 md:py-4 px-7 xs:px-8 md:px-12 rounded-full text-base xs:text-lg md:text-xl transition-all duration-300 transform hover:scale-105"
                            >
                                Accéder à mon espace
                            </button>
                        </div>
                    ) : (
                        <div className="text-center animate-scale-in">
                            <button
                                onClick={handleReservation}
                                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2.5 xs:py-3 md:py-4 px-7 xs:px-8 md:px-12 rounded-full text-base xs:text-lg md:text-xl transition-all duration-300 transform hover:scale-105"
                            >
                                Réserver maintenant
                            </button>
                            <p className="mt-3 xs:mt-4 text-sm">
                                Connectez-vous pour accéder à toutes nos fonctionnalités
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
  );
};

export default Home;
