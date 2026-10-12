import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthGuard = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const user = localStorage.getItem('user');
            const token = localStorage.getItem('token');

            if (!user || !token) {
                setShowAlert(true);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
                setIsAuthenticated(false);
            } else {
                try {
                    const parsedUser = JSON.parse(user);
                    console.log("User role:", parsedUser.role); // Pour le débogage

                    // Vérifier le rôle de l'utilisateur et rediriger vers l'espace approprié
                    if (location.pathname === '/login' || location.pathname === '/') {
                        switch (parsedUser.role.toLowerCase()) {
                            case 'livreur':
                                navigate('/user/livreur');
                                break;
                            case 'servant':
                                navigate('/user/servant');
                                break;
                            case 'client':
                                navigate('/user/client');
                                break;
                            case 'admin':
                                navigate('/user/admin');
                                break;
                            default:
                                console.log("Rôle non reconnu:", parsedUser.role);
                                navigate('/login');
                                break;
                        }
                    }
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('Error parsing user data:', error);
                    setShowAlert(true);
                    setTimeout(() => {
                        navigate('/login');
                    }, 3000);
                    setIsAuthenticated(false);
                }
            }
            setIsLoading(false);
        };

        checkAuth();
    }, [navigate, location]);

    const handleCloseAlert = () => {
        setShowAlert(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <>
            {showAlert && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down">
                    <div className="bg-white rounded-lg shadow-lg border-l-4 border-yellow-500 p-4 max-w-md w-full">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Accès restreint
                                </h3>
                                <div className="mt-2 text-sm text-gray-600">
                                    <p>Veuillez vous connecter pour accéder à cette page.</p>
                                </div>
                            </div>
                            <div className="ml-auto pl-3">
                                <div className="-mx-1.5 -my-1.5">
                                    <button
                                        onClick={handleCloseAlert}
                                        className="inline-flex rounded-md p-1.5 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                    >
                                        <span className="sr-only">Fermer</span>
                                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div className="bg-yellow-500 h-1.5 rounded-full animate-progress"></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {isAuthenticated ? children : null}
        </>
    );
};

export default AuthGuard; 