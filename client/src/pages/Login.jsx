import React, { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState({});
    const authContext = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (error != null) {
            Swal.fire({
                title: 'Login Error!',
                text: error,
                icon: 'error',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
                allowOutsideClick: false,
                allowEscapeKey: false
            });
        }
    }, [error]);

    const handleChange = e => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    }

    const handleSubmit = async e => {
        e.preventDefault();

        const baseUrl = import.meta.env.VITE_API_URL;
        const apiKey = import.meta.env.VITE_API_KEY;
        const url = `${baseUrl}/api/login`;
        const requestOptions = {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-API-KEY": apiKey,
            },
            body: JSON.stringify({
                email: data.email,
                password: data.password
            })
        };

        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(url, requestOptions);

            if (!response.ok) {
                setError("Invalid Credentials");
                throw new Error(`API error: ${response.statusText}`);
            }

            const responseJSON = await response.json();
            const { token, user } = responseJSON;

            if (user.role === 'admin') {
                return;
            }

            localStorage.setItem("isAuthenticated", true);
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            authContext.setIsAuthenticated(true);
            authContext.setToken(token);
            authContext.setUser(user);

            if (user.role === 'cashier') {
                navigate('/cashier');
            } else if (user.role === 'registrar') {
                navigate('/registrar');
            }
        } catch (error) {
            setError("Invalid Credentials");
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div id="admin-login">
            <div className="container h-screen flex justify-center items-center">
                <div className="w-1/3 shadow-md p-10 rounded-xl">
                    <h1 className="text-center text-3xl uppercase mb-10">Login</h1>

                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-5">
                            <div>
                                <label htmlFor="email">Email</label>
                                <input type="text" id="email" name="email" onChange={handleChange} className="block w-full p-2 rounded-md border border-black" />
                            </div>
                            <div>
                                <label htmlFor="password">Password</label>
                                <input type="password" id="password" name="password" onChange={handleChange} className="block w-full p-2 rounded-md border border-black" />
                            </div>
                            <button type="submit" className="w-full py-3 bg-red-600 rounded-md uppercase text-white hover:bg-red-500 disabled:bg-red-300" disabled={isLoading || !data.email || !data.password}>Login</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login