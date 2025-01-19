import React from 'react'
import shaLoonLogo from '../assets/images/sha-loon-logo.png'
import Swal from 'sweetalert2'
import { useAuth } from '../contexts/AuthContext'
import { useLocation, useNavigate } from 'react-router-dom'

const Sidebar = (props) => {

    const authContext = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const role = authContext.user.role;

    const logoutUser = async () => {
        // Delete tokens in the database
        const baseUrl = import.meta.env.VITE_API_URL;
        const apiKey = import.meta.env.VITE_API_KEY;
        const token = authContext.token;
        const url = `${baseUrl}/api/logout`;
        const requestOptions = {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-API-KEY': apiKey,
                Authorization: `Bearer ${token}`
            },
        };

        const response = await fetch(url, requestOptions);
        const responseJSON = await response.json();

        // Remove localStorage token and user info
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        navigate('/login');
    }

    const onClickLogout = async () => {
        const result = await Swal.fire({
            text: 'Are you sure you want to logout?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            reverseButtons: true,
            customClass: {
                confirmButton: "bg-red-500",
                cancelButton: "bg-gray-400"
            }
        });

        if (result.isConfirmed) {
            logoutUser();
        }
    }

    const onClickSidebarItem = (path) => {
        if (path == "") {
            navigate(`/${role}`);

            return;
        }

        if (role === 'cashier' || role === 'registrar') {
            navigate(`/${role}/${path}`);
        }
    }

    return (
        <>
            {/* Sidebar */}
            <div className={`${props.className} shadow-xl flex flex-col gap-3 p-5`}>
                <img src={shaLoonLogo} alt="SHA Loon Logo" />

                <button onClick={() => onClickSidebarItem("")} className={`rounded-md py-2 ${location.pathname === `/${role}` ? 'bg-red-500 text-white hover:bg-red-400 hover:text-white' : 'hover:text-white hover:bg-red-500'}`}>Dashboard</button>
                <button onClick={() => onClickSidebarItem('queue')} className={`rounded-md py-2 ${location.pathname.includes('queue') ? 'bg-red-500 text-white hover:bg-red-400 hover:text-white' : 'hover:text-white hover:bg-red-500'}`}>Queue</button>
                <button onClick={() => onClickSidebarItem('reports')} className={`rounded-md py-2 ${location.pathname.includes('reports') ? 'bg-red-500 text-white hover:bg-red-400 hover:text-white' : 'hover:text-white hover:bg-red-500'}`}>Reports</button>
                {authContext.user.role == "cashier" && (
                    <button onClick={() => onClickSidebarItem('videos')} className={`rounded-md py-2 ${location.pathname.includes('videos') ? 'bg-red-500 text-white hover:bg-red-400 hover:text-white' : 'hover:text-white hover:bg-red-500'}`}>Videos</button>
                )}

                <button onClick={onClickLogout} className="rounded-md py-2 hover:text-white hover:bg-red-500">Logout</button>
            </div>
        </>
    )
}

export default Sidebar