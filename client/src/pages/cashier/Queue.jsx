import React, { useEffect, useState } from 'react'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Sidebar from '../../components/Sidebar'
import Swal from 'sweetalert2'
import { useAuth } from '../../contexts/AuthContext'
import Loader from '../../components/Loader'

const Queue = () => {

    const [loading, setLoading] = useState(false);
    const [cashier1Ticket, setCashier1Ticket] = useState(null);
    const [cashier2Ticket, setCashier2Ticket] = useState(null);
    const [page, setPage] = useState(1);
    const [tab, setTab] = useState(1);
    const [response, setResponse] = useState({});
    const [incompleteData, setIncompleteData] = useState({});
    const [refresh, setRefresh] = useState(false);
    const authContext = useAuth();

    // Get latest cashier tickets
    useEffect(() => {
        const controller = new AbortController();
        const fetchData = async () => {
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

            const response = await fetch(url, requestOptions);
            const responseJSON = await response.json();

            const { cashier_1, cashier_2 } = responseJSON;

            setCashier1Ticket(cashier_1);
            setCashier2Ticket(cashier_2);
        };

        fetchData();

        return () => controller.abort();
    }, [refresh]);

    // Get tickets
    useEffect(() => {
        setLoading(true);

        const controller = new AbortController();

        const fetchIncompleteTickets = async () => {
            const baseUrl = import.meta.env.VITE_API_URL;
            const apiKey = import.meta.env.VITE_API_KEY;
            const token = authContext.token;
            const url = `${baseUrl}/api/admin/queues?page=${page}&person=cashier`;
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
            const url = `${baseUrl}/api/admin/queues?page=${page}&status=${tab}&person=cashier`;
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
                setTimeout(() => {
                    setLoading(false);
                }, 500);
            }
        };

        fetchIncompleteTickets();
        fetchAllTickets();

        return () => controller.abort();
    }, [refresh, page]);

    const formatStatus = status => ['Pending', 'In Progress', 'Completed'][status];

    const formatCashier = person => {
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

    const speakMessage = (code, cashier) => {
        const formattedCode = code.split('').join(' ');
        const destination = cashier == 'cashier_1' ? 'Cashier 1' : 'Cashier 2';
        const message = `${formattedCode}, please proceed to ${destination}!`;
        const utterance = new SpeechSynthesisUtterance(formatMessage(message));
        utterance.lang = 'en-US';
        utterance.rate = 1.2;

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

    const onClickNext = async () => {
        const showConfirmButton = response.data.length == 1 && response.data[0].assigned_person && response.data[0].assigned_person != 'cashier_1' ? false : true
        const showCancelButton = response.data.length == 1 && response.data[0].assigned_person && response.data[0].assigned_person != 'cashier_2' ? false : true

        const result = await Swal.fire({
            title: 'Select a Cashier',
            icon: 'question',
            showConfirmButton,
            showCancelButton,
            confirmButtonText: 'Cashier 1',
            cancelButtonText: 'Cashier 2',
        });

        if (result.isConfirmed) {
            assignCashierQueueTicket('cashier_1');
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            assignCashierQueueTicket('cashier_2');
        }
    }

    const onClickCall = (code, cashier) => speakMessage(code, cashier);

    const assignCashierQueueTicket = async (cashier) => {
        setRefresh(true);

        try {
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
                    'person': cashier
                })
            };

            const response = await fetch(url, requestOptions);
            const responseJSON = await response.json();
            const { ticket_code } = responseJSON;

            setRefresh(prev => !prev);
            setTimeout(() => speakMessage(ticket_code, cashier), 500);
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

    const onClickSkip = async (cashier) => {
        const result = await Swal.fire({
            title: 'Please select "Yes" to confirm',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            reverseButtons: true,
            customClass: {
                cancelButton: 'bg-gray-300 text-black',
                confirmButton: 'bg-red-500'
            }
        });

        if (result.isConfirmed) {
            const id = cashier == 'cashier_1' ? cashier1Ticket.id : cashier2Ticket.id;
            const baseUrl = import.meta.env.VITE_API_URL;
            const apiKey = import.meta.env.VITE_API_KEY;
            const url = `${baseUrl}/api/cashier/queues/${id}/skip`;
            const requestOptions = {
                method: 'PUT',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-API-KEY': apiKey,
                },
            };

            const response = await fetch(url, requestOptions);
            const responseJSON = await response.json();
            setRefresh(prev => !prev);
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
                    <div className="flex justify-between">
                        <div className="w-1/4 text-left">
                            <p className="text-4xl">{cashier1Ticket ? cashier1Ticket.ticket_code : "----"}</p>
                            <p>Cashier 1</p>
                            {cashier1Ticket && (
                                <div className="flex gap-5">
                                    <button onClick={() => onClickCall(cashier1Ticket.ticket_code, "cashier_1")} className="text-white rounded-md bg-red-500 hover:bg-red-400 min-w-20 mt-3">Call</button>
                                    <button className="text-white rounded-md bg-teal-500 hover:bg-teal-400 min-w-20 mt-3" onClick={() => onClickSkip('cashier_1')}>Skip</button>
                                </div>
                            )}
                        </div>

                        {
                            incompleteData && incompleteData.data && incompleteData.meta.total > 0 && (
                                <button className="text-white rounded-md py-2 bg-blue-500 hover:bg-blue-400 self-center min-w-36" onClick={onClickNext}>Next</button>
                            )
                        }

                        <div className="w-1/4 text-right">
                            <p className="text-4xl">{cashier2Ticket ? cashier2Ticket.ticket_code : "----"}</p>
                            <p>Cashier 2</p>
                            {cashier2Ticket && (
                                <div className="flex gap-5 justify-end">
                                    <button className="text-white rounded-md bg-red-500 hover:bg-red-400 min-w-20 mt-3" onClick={() => onClickCall(cashier2Ticket.ticket_code, "cashier_2")}>Call</button>
                                    <button className="text-white rounded-md bg-teal-500 hover:bg-teal-400 min-w-20 mt-3" onClick={() => onClickSkip('cashier_2')}>Skip</button>
                                </div>
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
                                <th className="p-1 py-2 text-left font-normal">Assigned Cashier</th>
                                <th className="p-1 py-2 text-left font-normal">Status</th>
                                <th className="p-1 py-2 text-left font-normal">Queue Date</th>
                            </tr>
                        </thead>
                        <tbody className="shadow-md">
                            {response.data && response.data.map(item => (
                                <tr key={item.id}>
                                    <td className="p-1 pl-5">{item.ticket_code}</td>
                                    <td className="p-1">{item.assigned_person ? formatCashier(item.assigned_person) : "None"}</td>
                                    <td className="p-1">{formatStatus(item.status)}</td>
                                    <td className="p-1">{formatDateTime(item.created_at)}</td>
                                </tr>
                            ))}
                            {response.data && response.data.length == 0 && (
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