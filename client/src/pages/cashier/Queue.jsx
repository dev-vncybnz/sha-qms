import React, { useEffect, useState } from 'react'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Sidebar from '../../components/Sidebar'
import Swal from 'sweetalert2'

const Queue = () => {

    const [cashier1Ticket, setCashier1Ticket] = useState(null);
    const [cashier2Ticket, setCashier2Ticket] = useState(null);
    const [page, setPage] = useState(1);
    const [response, setResponse] = useState({});
    const [refresh, setRefresh] = useState(false);

    useEffect(() => {
        setCashier1Ticket(null);
        setCashier2Ticket(null);

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

        return () => {
            setRefresh(false);
            controller.abort();
        }
    }, [refresh]);

    useEffect(() => {
        setResponse({});

        const controller = new AbortController();
        const fetchData = async () => {
            const baseUrl = import.meta.env.VITE_API_URL;
            const apiKey = import.meta.env.VITE_API_KEY;
            const url = `${baseUrl}/api/cashier/queues?page=${page}`;
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

            console.log(responseJSON);

            setResponse(responseJSON);
        };

        fetchData();

        return () => {
            setRefresh(false);
            controller.abort();
        }
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
        Swal.fire({
            title: 'Select a Cashier',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Cashier 1',
            cancelButtonText: 'Cashier 2',
        }).then((result) => {
            if (result.isConfirmed) {
                assignCashierQueueTicket('cashier_1');
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                assignCashierQueueTicket('cashier_2');
            }
        });
    }

    const onClickCall = (code, cashier) => {
        speakMessage(code, cashier);
    }

    const assignCashierQueueTicket = async (cashier) => {
        const baseUrl = import.meta.env.VITE_API_URL;
        const apiKey = import.meta.env.VITE_API_KEY;
        const url = `${baseUrl}/cashier/queues`;
        const requestOptions = {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-API-KEY': apiKey,
            },
            body: JSON.stringify({
                'person': cashier
            })
        };

        const response = await fetch(url, requestOptions);
        const responseJSON = await response.json();

        console.log(responseJSON);
    }

    const onClickRefresh = () => {
        setPage(1);
        setRefresh(true);
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
                confirmButton: 'bg-gray-300',
                cancelButton: 'bg-red-500'
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

            setRefresh(true);
        }
    }

    return (
        <>
            <div className="flex h-screen">
                <Sidebar className="w-1/5" />

                {/* Content */}
                <div className="w-full px-5 py-3">
                    <div className="flex justify-between">
                        <div className="w-1/4 text-left">
                            <p className="text-4xl">{cashier1Ticket ? cashier1Ticket.ticket_code : "----"}</p>
                            <p>Cashier 1</p>
                            <div className="flex gap-5">
                                <button onClick={() => onClickCall("CAS-001", "cashier_1")} className="text-white rounded-md bg-red-500 hover:bg-red-400 min-w-20 mt-3">Call</button>
                                <button className="text-white rounded-md bg-teal-500 hover:bg-teal-400 min-w-20 mt-3" onClick={() => onClickSkip('cashier_1')}>Skip</button>
                            </div>
                        </div>

                        <button className="text-white rounded-md py-2 bg-blue-500 hover:bg-blue-400 self-center min-w-36" onClick={onClickNext}>Next</button>

                        <div className="w-1/4 text-right">
                            <p className="text-4xl">{cashier2Ticket ? cashier2Ticket.ticket_code : "----"}</p>
                            <p>Cashier 2</p>
                            <div className="flex gap-5 justify-end">
                                <button className="text-white rounded-md bg-red-500 hover:bg-red-400 min-w-20 mt-3">Call</button>
                                <button className="text-white rounded-md bg-teal-500 hover:bg-teal-400 min-w-20 mt-3" onClick={() => onClickSkip('cashier_2')}>Skip</button>
                            </div>
                        </div>
                    </div>

                    {/* Queue Table */}
                    <table className="mt-10 w-full">
                        <thead className="bg-red-500 text-white">
                            <tr>
                                <th className="p-1 pl-5 text-left">Ticket Code</th>
                                <th className="p-1 text-left">Assigned Cashier</th>
                                <th className="p-1 text-left">Status</th>
                                <th className="p-1 text-left">Queue Date</th>
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
                            {!response.data && (
                                <tr>
                                    <td colSpan="5" className="text-center text-gray-300 py-5">No available data</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="mt-3 flex justify-between items-center">
                        <button className="hover:underline" onClick={onClickRefresh}>Refresh</button>

                        {response && response.data && (
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