import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute() {
    const { auth } = useAuth();
    const location = useLocation();

    if (!auth?.token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    return <Outlet />;
}

export default ProtectedRoute;