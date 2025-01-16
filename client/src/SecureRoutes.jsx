import React from 'react'
import { useAuth } from './contexts/AuthContext'
import { Navigate, Outlet } from 'react-router-dom';

const SecureRoutes = () => {

    const { loading, isAuthenticated } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    return !loading && isAuthenticated ? <Outlet /> : <Navigate to="/login" />
}

export default SecureRoutes