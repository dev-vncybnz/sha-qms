import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const ManageQueue = () => {

    const [inProgressCode, setInProgressCode] = useState(null);
    const [response, setResponse] = useState({});
    const [statusTab, setStatusTab] = useState(0);
    const authContext = useAuth();
    const navigate = useNavigate();

    /**
     * GET Latest Queue Code
     */
    useEffect(() => {
        const controller = new AbortController();

        const fetchData = async () => {
            const apiKey = import.meta.env.VITE_API_KEY;
            const url = `${import.meta.env.VITE_API_URL}/api/latest-queue-codes`;
            const requestOptions = {
                signal: controller.signal,
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-API-KEY": apiKey,
                },
            };

            try {
                const response = await fetch(url, requestOptions);

                if (!response.ok) {
                    throw new Error(`API error: ${response.statusText}`);
                }

                const responseJSON = await response.json();
                const { cashierWIPCode, registrarWIPCode } = responseJSON;

                setInProgressCode(authContext.user.role == 0 ? cashierWIPCode : registrarWIPCode);
            } catch (error) {
                console.log(error);
            }
        };

        fetchData();

        return () => {
            controller.abort();
        }
    }, [statusTab]);

    useEffect(() => {
        const controller = new AbortController();

        const fetchData = async () => {
            const apiKey = import.meta.env.VITE_API_KEY;
            const token = authContext.token;
            const url = `${import.meta.env.VITE_API_URL}/api/queues?status=${statusTab}&order_by=desc`;
            const requestOptions = {
                signal: controller.signal,
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-API-KEY": apiKey,
                    Authorization: `Bearer ${token}`
                },
            };

            try {
                const response = await fetch(url, requestOptions);

                if (!response.ok) {
                    throw new Error(`API error: ${response.statusText}`);
                }

                const responseJSON = await response.json();
                setResponse(responseJSON);
                console.log(responseJSON);
            } catch (error) {
                console.log(error);
            }
        };

        fetchData();

        return () => {
            controller.abort();
        }
    }, [statusTab, inProgressCode]);

    const formatMessage = (text) => {
        return text.replace(/0/g, " zero ")
            .replace(/1/g, " one ")
            .replace(/2/g, " two ")
            .replace(/3/g, " three ")
            .replace(/4/g, " four ")
            .replace(/5/g, " five ")
            .replace(/6/g, " six ")
            .replace(/7/g, " seven ")
            .replace(/8/g, " eight ")
            .replace(/9/g, " nine ");
    };

    const speakMessage = (message) => {
        const utterance = new SpeechSynthesisUtterance(formatMessage(message));
        utterance.lang = 'en-US';
        utterance.rate = 1.2;

        const setFemaleVoice = () => {
            const voices = speechSynthesis.getVoices();

            const femaleVoice = voices.find(voice =>
                voice.lang === 'en-US' &&
                (/female|woman/i.test(voice.name) || /Zira|Jenny/i.test(voice.name)) // Microsoft female voices
            ) || voices.find(voice =>
                voice.lang === 'en-US' && voice.name.includes('Google')
            );

            if (femaleVoice) {
                utterance.voice = femaleVoice;
            }

            speechSynthesis.speak(utterance);
        };

        if (speechSynthesis.getVoices().length) {
            setFemaleVoice();
        } else {
            speechSynthesis.onvoiceschanged = setFemaleVoice;
        }
    };

    const formatDateTime = (datetime) => {
        const formatter = new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Manila',
            hour12: true
        });

        const formattedDate = formatter.format(new Date(datetime));

        const [month, day, year, hour, minute, period] =
            formattedDate.match(/\d+/g).concat(formattedDate.match(/[APM]+/g));
        const formattedString = `${year}-${month}-${day} ${hour}:${minute} ${period}`;

        return formattedString;
    }

    const formatStatus = (status) => {
        return ['Pending', 'In Progress', 'Completed'][status];
    }

    const onClickCall = async (queue_id = null, code) => {
        if (queue_id != null) {
            const apiKey = import.meta.env.VITE_API_KEY;
            const token = authContext.token;
            const url = `${import.meta.env.VITE_API_URL}/api/queues/${queue_id}`;
            const requestOptions = {
                method: "PUT",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-API-KEY": apiKey,
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: 1
                })
            };

            try {
                const response = await fetch(url, requestOptions);

                if (!response.ok) {
                    throw new Error(`API error: ${response.statusText}`);
                }

                const responseJSON = await response.json();
                setInProgressCode(code);

                const destination = code.includes('CAS') ? 'Cashier' : 'Registrar';

                setTimeout(() => {
                    speakMessage(`${code.split('').join(' ')}, please proceed to ${destination} window`);
                }, 1000);
            } catch (error) {
                console.log(error);
            }
        } else {
            const destination = code.includes('CAS') ? 'Cashier' : 'Registrar';

            setTimeout(() => {
                speakMessage(`${code.split('').join(' ')}, please proceed to ${destination} window`);
            }, 1000);
        }
    }

    const onClickDone = async (queue_id) => {
        const controller = new AbortController();
        const apiKey = import.meta.env.VITE_API_KEY;
        const token = "2|xlU8zL2LOG2lroCcxmhyTy7rHSGn2LSCAI0N86Ji72cd8199";
        const url = `${import.meta.env.VITE_API_URL}/api/queues/${queue_id}`;
        const requestOptions = {
            signal: controller.signal,
            method: "PUT",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-API-KEY": apiKey,
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                status: 2
            })
        };

        try {
            const response = await fetch(url, requestOptions);

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const responseJSON = await response.json();
            console.log(responseJSON);

            setResponse([]);
            setStatusTab(2);
        } catch (error) {
            console.log(error);
        } finally {
            controller.abort();
        }
    }

    const onClickTab = (status) => {
        setResponse([]);
        setStatusTab(status);
    }

    const onClickPageNext = async () => {
        const apiKey = import.meta.env.VITE_API_KEY;
        const token = authContext.token;
        const page = response.meta.current_page + 1;
        const url = `${import.meta.env.VITE_API_URL}/api/queues?page=${page}&status=${statusTab}&order_by=desc`;
        const requestOptions = {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-API-KEY": apiKey,
                Authorization: `Bearer ${token}`
            },
        };

        try {
            const response = await fetch(url, requestOptions);

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const responseJSON = await response.json();
            setResponse(responseJSON);
        } catch (error) {
            console.log(error);
        }
    }

    const onClickPagePrev = async () => {
        const apiKey = import.meta.env.VITE_API_KEY;
        const token = authContext.token;
        const page = response.meta.current_page - 1;
        const url = `${import.meta.env.VITE_API_URL}/api/queues?page=${page}&status=${statusTab}&order_by=desc`;
        const requestOptions = {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-API-KEY": apiKey,
                Authorization: `Bearer ${token}`
            },
        };

        try {
            const response = await fetch(url, requestOptions);

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const responseJSON = await response.json();
            setResponse(responseJSON);
        } catch (error) {
            console.log(error);
        }
    }

    const onClickLogout = async () => {
        const result = await Swal.fire({
            text: 'Please select "Yes" to confirm',
            cancelButtonText: "Cancel",
            showCancelButton: true,
            confirmButtonText: "Yes",
            reverseButtons: true,
            customClass: {
                confirmButton: "w-32",
                cancelButton: "w-32"
            }
        });

        const { isConfirmed } = result;

        if (isConfirmed) {
            const apiKey = import.meta.env.VITE_API_KEY;
            const token = authContext.token;
            const url = `${import.meta.env.VITE_API_URL}/api/logout`;
            const requestOptions = {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-API-KEY": apiKey,
                    Authorization: `Bearer ${token}`
                },
            };

            try {
                const response = await fetch(url, requestOptions);

                if (!response.ok) {
                    throw new Error(`API error: ${response.statusText}`);
                }

                authContext.setIsAuthenticated(false);
                authContext.setToken(null);
                authContext.setUser(null);

                localStorage.removeItem('token');
                localStorage.removeItem('user');

                navigate('/admin/login');
            } catch (error) {
                console.log(error);
            }
        }
    }

    return (
        <div id="admin-queue" className="h-screen p-5">
            <div className="container pb-10">
                <div className="mb-5 flex justify-between items-center">
                    <div>
                        <p className="text-xl uppercase">You are currently serving</p>
                        <p className="text-4xl uppercase">{inProgressCode ?? '----'}</p>
                    </div>
                    <button onClick={onClickLogout} className="bg-red-500 w-32 self-start text-white py-2 rounded-md hover:bg-red-400">Logout</button>
                </div>
                <div className="mb-10 flex gap-10">
                    <button onClick={() => onClickCall(null, inProgressCode)} className="bg-blue-300 py-2 w-32 hover:bg-blue-200">Call</button>
                </div>
                <div className="border-b border-gray-100">
                    <button onClick={() => onClickTab(0)} className={`w-32 py-3 ${statusTab == 0 ? 'text-white bg-red-600 hover:bg-red-500' : 'hover:bg-red-600'} hover:text-white`}>Waiting List</button>
                    <button onClick={() => onClickTab(2)} className={`w-32 py-3 ${statusTab == 2 ? 'text-white bg-red-600 hover:bg-red-500' : 'hover:bg-red-600'} hover:text-white`}>Completed</button>
                </div>
                {response.data && response.data.length > 0 ? (
                    <>
                        <table className="w-full text-center">
                            <thead className="bg-gray-200">
                                <tr>
                                    {statusTab == 0 && <th className="py-3 w-1/5">Action</th>}
                                    <th className="py-3 w-1/5">Code</th>
                                    <th className="py-3 w-1/5">Status</th>
                                    <th className="py-3 w-1/5">{statusTab == 0 ? 'Queue Date' : 'Completion Date'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {response.data.map(item =>
                                    <tr key={item.queue_id} className="shadow-sm mb-2">
                                        {statusTab == 0 && <td className="py-3 w-1/5">
                                            <div className="flex gap-10 justify-center">
                                                <button onClick={() => onClickCall(item.queue_id, item.code)} className="bg-blue-300 py-2 w-32 hover:bg-blue-200">Call</button>
                                                <button onClick={() => onClickDone(item.queue_id)} className="bg-green-300 py-2 w-32 hover:bg-green-200">Done</button>
                                            </div>
                                        </td>}
                                        <td className="py-3">{item.code}</td>
                                        <td className="py-3">{formatStatus(item.status)}</td>
                                        <td className="py-3">{statusTab == 0 ? formatDateTime(item.created_at) : formatDateTime(item.updated_at)}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <div className="mt-5 flex gap-10 items-center justify-end">
                            <p>Showing 1 to 15 of 100 items</p>
                            <div className="flex gap-5">
                                <FontAwesomeIcon onClick={onClickPagePrev} icon={faChevronLeft} className={`cursor-pointer ${response.links.prev == undefined ? 'opacity-30' : ''}`} />
                                <FontAwesomeIcon onClick={onClickPageNext} icon={faChevronRight} className={`cursor-pointer ${response.links.next == undefined ? 'opacity-30' : ''}`} />
                            </div>
                        </div>
                    </>
                ) : (
                    <p className="text-center p-10 text-gray-400">No data</p>
                )}
            </div>
        </div>
    )
}

export default ManageQueue