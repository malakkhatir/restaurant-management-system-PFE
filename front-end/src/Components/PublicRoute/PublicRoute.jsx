import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    if (token && user) {
        // Rediriger immédiatement vers la page d'accueil appropriée selon le rôle
        switch (user.role) {
            case 'admin':
                return <Navigate to="/user/admin" replace />;
            case 'client':
                return <Navigate to="/user/client" replace />;
            case 'servant':
                return <Navigate to="/user/servant" replace />;
            case "livreur":
                return <Navigate to="/user/livreur" replace />;
            default:
                return <Navigate to="/" replace />;
        }
    }

    return children;
};

export default PublicRoute; 