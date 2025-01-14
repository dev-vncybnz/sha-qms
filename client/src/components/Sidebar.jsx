import React from 'react'
import shaLoonLogo from '../assets/images/sha-loon-logo.png'
import Swal from 'sweetalert2'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const Sidebar = (props) => {

    const authContext = useAuth();
    const navigate = useNavigate();

    const logoutUser = async () => {
        // Delete tokens in the database
        const baseUrl = import.meta.env.VITE_API_URL;
        const apiKey = import.meta.env.VITE_API_KEY;
        const token = authContext.token;
        const url = `${baseUrl}/logout`;
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
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // navigate('/login');
    }

    const onClickLogout = () => {
        Swal.fire({
            text: 'Are you sure you want to logout?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                logoutUser();
            } else {

            }
        });
    }

    return (
        <>
            {/* Sidebar */}
            <div className={`${props.className} shadow-xl flex flex-col gap-3 p-5`}>
                <img src={shaLoonLogo} alt="SHA Loon Logo" />
                <button className="rounded-md py-2 hover:text-white hover:bg-red-500">Dashboard</button>
                <button className="text-white rounded-md py-2 bg-red-500 hover:bg-red-400">Queue</button>
                <button className="rounded-md py-2 hover:text-white hover:bg-red-500">Reports</button>
                <button className="rounded-md py-2 hover:text-white hover:bg-red-500">Videos</button>
                <button onClick={onClickLogout} className="rounded-md py-2 hover:text-white hover:bg-red-500">Logout</button>
            </div>
        </>
    )
}

export default Sidebar