import React, { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState({});
    const authContext = useAuth();

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

    const handleSubmit = async e => {
        e.preventDefault();

        const apiKey = import.meta.env.VITE_API_KEY;
        const url = `${import.meta.env.VITE_API_URL}/api/login`;
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

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            authContext.setIsAuthenticated(true);
            authContext.setToken(token);
            authContext.setUser(user);

            // console.log(authContext.isAuthenticated, authContext.token, authContext.user);
        } catch (error) {
            setError("Invalid Credentials");
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }

    const handleChange = e => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    }

    return (
        <div id="admin-login">
            <div className="container h-screen flex justify-center items-center">
                <div className="w-2/5 shadow-md p-10 rounded-xl">
                    <h1 className="text-center text-3xl uppercase mb-10">Admin Login</h1>

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