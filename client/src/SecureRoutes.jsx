import React from 'react'
import { useAuth } from './contexts/AuthContext'
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const SecureRoutes = () => {

    const location = useLocation();
    const { loading, user, isAuthenticated } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (!location.pathname.includes(`${user.role}`)) {
        return <Navigate to="/forbidden" />
    }

    return <Outlet />;
}

export default SecureRoutes