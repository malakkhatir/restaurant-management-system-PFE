import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    try {
        const parsedUser = JSON.parse(user);
        // Si l'utilisateur est un livreur, rediriger vers l'espace livreur
        if (parsedUser.role === 'livreur') {
            return <Navigate to="/user/livreur" replace />;
        }
    } catch (error) {
        console.error('Error parsing user data:', error);
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute; 