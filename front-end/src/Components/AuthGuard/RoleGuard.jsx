import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RoleGuard = ({ allowedRoles, children }) => {
    const navigate = useNavigate();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showError, setShowError] = useState(false);

    useEffect(() => {
        const checkRole = () => {
            const user = localStorage.getItem('user');
            if (!user) {
                navigate('/login');
                return;
            }

            try {
                const parsedUser = JSON.parse(user);
                const userRole = parsedUser.role.toLowerCase();

                if (allowedRoles.includes(userRole)) {
                    setIsAuthorized(true);
                    setShowError(false);
                } else {
                    setShowError(true);
                    // Rediriger après 3 secondes
                    setTimeout(() => {
                        switch (userRole) {
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
                                navigate('/login');
                                break;
                        }
                    }, 3000);
                }
            } catch (error) {
                console.error('Error checking role:', error);
                navigate('/login');
            }
            setIsLoading(false);
        };

        checkRole();
    }, [navigate, allowedRoles]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (showError) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                    <div className="flex items-center justify-center mb-4">
                        <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
                        Accès Non Autorisé
                    </h2>
                    <p className="text-center text-gray-600 mb-4">
                        Vous n'avez pas les permissions nécessaires pour accéder à cette page.
                    </p>
                    <div className="text-center text-sm text-gray-500">
                        Redirection automatique dans quelques secondes...
                    </div>
                    <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div className="bg-red-500 h-1.5 rounded-full animate-progress"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return isAuthorized ? children : null;
};

export default RoleGuard; 