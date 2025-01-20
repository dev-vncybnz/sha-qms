import React, { useEffect, useState } from 'react'
import { faChevronLeft, faChevronRight, faL } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Sidebar from '../../components/Sidebar'
import Swal from 'sweetalert2'
import { useAuth } from '../../contexts/AuthContext'
import Loader from '../../components/Loader'

const Queue = () => {

    const [loading, setLoading] = useState(false);
    const [registrarTicket, setRegistrarTicket] = useState(null);
    const [page, setPage] = useState(1);
    const [tab, setTab] = useState(1);
    const [response, setResponse] = useState({});
    const [incompleteData, setIncompleteData] = useState({});
    const [refresh, setRefresh] = useState(false);
    const authContext = useAuth();

    // Get tickets
    useEffect(() => {
        setLoading(true);
        const controller = new AbortController();

        const fetchCurrentInProgressTicket = async () => {
            const baseUrl = import.meta.env.VITE_API_URL;
            const apiKey = import.meta.env.VITE_API_KEY;
            const url = `${baseUrl}/api/latest-tickets`;
            const requestOptions = {
                signal: controller.signal,
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-API-KEY': apiKey,
                },
            };

            try {
                const response = await fetch(url, requestOptions);
                const responseJSON = await response.json();
                const { registrar } = responseJSON;

                setRegistrarTicket(registrar);
            } catch (error) {
                console.log(`API Error: ${error}`);
            }
        };

        const fetchIncompleteTickets = async () => {
            const baseUrl = import.meta.env.VITE_API_URL;
            const apiKey = import.meta.env.VITE_API_KEY;
            const token = authContext.token;
            const url = `${baseUrl}/api/admin/queues?page=${page}&person=registrar`;
            const requestOptions = {
                signal: controller.signal,
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-API-KEY': apiKey,
                    Authorization: `Bearer ${token}`,
                },
            };

            try {
                const response = await fetch(url, requestOptions);
                const responseJSON = await response.json();
                setIncompleteData(responseJSON);
            } catch (error) {
                console.log(`API Error: ${error.message}`);
            }
        };

        const fetchAllTickets = async () => {
            const baseUrl = import.meta.env.VITE_API_URL;
            const apiKey = import.meta.env.VITE_API_KEY;
            const token = authContext.token;
            const url = `${baseUrl}/api/admin/queues?page=${page}&status=${tab}&person=registrar`;
            const requestOptions = {
                signal: controller.signal,
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-API-KEY': apiKey,
                    Authorization: `Bearer ${token}`,
                },
            };

            try {
                const response = await fetch(url, requestOptions);
                const responseJSON = await response.json();
                setResponse(responseJSON);
            } catch (error) {
                console.log(`API Error: ${error.message}`);
            } finally {
                setTimeout(() => setLoading(false), 500);
            }
        };

        fetchCurrentInProgressTicket();
        fetchIncompleteTickets();
        fetchAllTickets();

        return () => controller.abort();
    }, [refresh, page]);

    const formatStatus = status => ['Pending', 'In Progress', 'Completed'][status];

    const formatText = person => {
        let formatted = person.replace('_', ' ');
        formatted = formatted.charAt(0).toUpperCase() + formatted.substring(1);

        return formatted;
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

    const formatMessage = (text) => text.replace(/0/g, " zero ")
        .replace(/1/g, " one ")
        .replace(/2/g, " two ")
        .replace(/3/g, " three ")
        .replace(/4/g, " four ")
        .replace(/5/g, " five ")
        .replace(/6/g, " six ")
        .replace(/7/g, " seven ")
        .replace(/8/g, " eight ")
        .replace(/9/g, " nine ");

    const speakMessage = (code) => {
        const formattedCode = code.split('').join(' ');
        const destination = "registrar"
        const message = `${formattedCode}, please proceed to ${destination}!`;
        const utterance = new SpeechSynthesisUtterance(formatMessage(message));
        utterance.lang = 'en-US';
        utterance.rate = 1.1;

        const setFemaleVoice = () => {
            const voices = speechSynthesis.getVoices();

            const femaleVoice = voices.find(voice =>
                voice.lang === 'en-US' &&
                (/female|woman/i.test(voice.name) || /Zira|Jenny/i.test(voice.name))
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
    }

    const onClickCall = code => speakMessage(code);

    const onClickNext = async () => {
        const result = await Swal.fire({
            text: 'Please select "Yes" to confirm',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            reverseButtons: true,
            customClass: {
                confirmButton: "bg-red-500",
                cancelButton: "bg-gray-400 text-white"
            }
        });

        if (result.isConfirmed) {
            updateQueueTicket();
        }
    }

    const updateQueueTicket = async () => {
        setLoading(true);

        const baseUrl = import.meta.env.VITE_API_URL;
        const apiKey = import.meta.env.VITE_API_KEY;
        const token = authContext.token;
        const url = `${baseUrl}/api/admin/queues`;
        const requestOptions = {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-API-KEY': apiKey,
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                person: "registrar"
            })
        };

        try {
            const response = await fetch(url, requestOptions);
            const responseJSON = await response.json();
            const { ticket_code } = responseJSON;

            setRefresh(prev => !prev);
            setTimeout(() => speakMessage(ticket_code), 500);
        } catch (error) {
            console.log(`API Error: ${error}`);
        } 
    }

    const onClickRefresh = () => {
        setPage(1);
        setRefresh(prev => !prev);
    };

    const onClickPrevPagination = () => setPage(prev => --prev);

    const onClickNextPagination = () => setPage(prev => ++prev);

    const onClickSkip = async () => {
        const result = await Swal.fire({
            text: 'Please select "Yes" to confirm',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            reverseButtons: true,
            customClass: {
                confirmButton: 'bg-red-500',
                cancelButton: 'bg-gray-400 text-white'
            }
        });

        if (result.isConfirmed) {
            const id = registrarTicket.id;
            const baseUrl = import.meta.env.VITE_API_URL;
            const apiKey = import.meta.env.VITE_API_KEY;
            const token = authContext.token;
            const url = `${baseUrl}/api/admin/queues/${id}/skip`;
            const requestOptions = {
                method: 'PUT',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-API-KEY': apiKey,
                    Authorization: `Bearer ${token}`
                },
            };

            try {
                const response = await fetch(url, requestOptions);
                const responseJSON = await response.json();
                setRefresh(prev => !prev);
            } catch (error) {
                console.log(`API Error: ${error}`);
            }
        }
    }

    const onClickTab = (tab) => {
        setTab(tab);
        setRefresh(prev => !prev);
    }

    return (
        <>
            <Loader loading={loading} />

            <div className="flex h-screen">
                <Sidebar className="w-1/5" />

                {/* Content */}
                <div className="w-full min-h-full px-5 py-3">
                    <div className="w-full flex flex-col items-center">
                        <p className="text-4xl">{registrarTicket ? registrarTicket.ticket_code : "----"}</p>
                        <div className="flex gap-5">
                            {registrarTicket && (
                                <button onClick={() => onClickCall(registrarTicket.ticket_code)} className="text-white rounded-md bg-red-500 hover:bg-red-400 min-w-20 mt-3">Call</button>
                            )}

                            {incompleteData && incompleteData.data && incompleteData.data.length > 0 && registrarTicket && (
                                <button className="text-white rounded-md bg-teal-500 hover:bg-teal-400 min-w-20 mt-3" onClick={onClickSkip}>Skip</button>
                            )
                            }

                            {incompleteData && incompleteData.data && incompleteData.data.length > 0 && (
                                <button className="text-white rounded-md bg-blue-500 hover:bg-blue-400 min-w-20 mt-3" onClick={onClickNext}>Next</button>
                            )}
                        </div>

                    </div>

                    <div className="flex mt-10 gap-3">
                        <button onClick={() => onClickTab(1)} className={`rounded-full py-2 px-3 ${tab == 1 ? 'bg-red-500 text-white hover:bg-red-400' : 'hover:text-white hover:bg-red-500'}`}>Waiting List</button>
                        <button onClick={() => onClickTab(2)} className={`rounded-full py-2 px-3 ${tab == 2 ? 'bg-red-500 text-white hover:bg-red-400' : 'hover:text-white hover:bg-red-500'}`}>Completed</button>
                    </div>

                    {/* Queue Table */}
                    <table className="mt-3 w-full">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-1 py-2 pl-5 text-left font-normal">Ticket Code</th>
                                <th className="p-1 py-2 text-left font-normal">Assigned Person</th>
                                <th className="p-1 py-2 text-left font-normal">Status</th>
                                <th className="p-1 py-2 text-left font-normal">Queue Date</th>
                            </tr>
                        </thead>
                        <tbody className="shadow-md">
                            {response && response.data && response.data.length > 0 && response.data.map(item => (
                                <tr key={item.id}>
                                    <td className="p-1 pl-5">{item.ticket_code}</td>
                                    <td className="p-1">{item.assigned_person ? formatText(item.assigned_person) : "None"}</td>
                                    <td className="p-1">{formatStatus(item.status)}</td>
                                    <td className="p-1">{formatDateTime(item.created_at)}</td>
                                </tr>
                            ))}

                            {response && response.data && response.data.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center text-gray-300 py-5">No available data</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="my-3 flex justify-between items-center">
                        <button className="hover:underline" onClick={onClickRefresh}>Refresh</button>

                        {response && response.data && response.data.length > 0 && (
                            <div className="flex items-center gap-5">
                                <p>
                                    Showing {(response.meta.current_page - 1) * response.meta.per_page + 1}
                                    ~
                                    {Math.min(response.meta.current_page * response.meta.per_page, response.meta.total)} of {response.meta.total} items
                                </p>

                                <FontAwesomeIcon icon={faChevronLeft}
                                    onClick={response.links.prev ? onClickPrevPagination : null} className={`text-${response.links.prev ? 'black' : 'gray'}-300 cursor-pointer`} />

                                <FontAwesomeIcon icon={faChevronRight}
                                    onClick={response.links.next ? onClickNextPagination : null} className={`text-${response.links.next ? 'black' : 'gray'}-300 cursor-pointer`} />

                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Queue