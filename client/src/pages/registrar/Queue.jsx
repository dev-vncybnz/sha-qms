import React, { useEffect, useState } from 'react'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Sidebar from '../../components/Sidebar'
import Swal from 'sweetalert2'

const Queue = () => {

    const [response, setResponse] = useState({});

    useEffect(() => {
        const controller = new AbortController();
        const fetchData = async () => {
            const baseUrl = import.meta.env.VITE_API_URL;
            const apiKey = import.meta.env.VITE_API_KEY;
            const url = `${baseUrl}/cashier/queues`;
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

            setResponse(responseJSON);
        };

        fetchData();

        return () => {
            controller.abort();
        }
    }, []);

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

    return (
        <>
            <div className="flex h-screen">
                <Sidebar className="w-1/5" />

                {/* Content */}
                <div className="w-full px-5 py-3">
                    <div className="flex justify-between">
                        <div className="w-1/4 text-left">
                            <p className="text-4xl">CAS-0001</p>
                            <p>Cashier 1</p>
                            <div className="flex gap-5">
                                <button onClick={() => onClickCall("CAS-001", "cashier_1")} className="text-white rounded-md bg-red-500 hover:bg-red-400 min-w-20 mt-3">Call</button>
                                <button className="text-white rounded-md bg-teal-500 hover:bg-teal-400 min-w-20 mt-3">Skip</button>
                            </div>
                        </div>

                        <button className="text-white rounded-md py-2 bg-blue-500 hover:bg-blue-400 self-center min-w-36" onClick={onClickNext}>Next</button>

                        <div className="w-1/4 text-right">
                            <p className="text-4xl">CAS-0002</p>
                            <p>Cashier 2</p>
                            <div className="flex gap-5 justify-end">
                                <button className="text-white rounded-md bg-red-500 hover:bg-red-400 min-w-20 mt-3">Call</button>
                                <button className="text-white rounded-md bg-teal-500 hover:bg-teal-400 min-w-20 mt-3">Skip</button>
                            </div>
                        </div>
                    </div>

                    {/* Queue Table */}
                    <table className="mt-10 w-full">
                        <thead className="bg-red-500 text-white">
                            <tr>
                                <th className="p-1 text-left">Student ID</th>
                                <th className="p-1 text-left">Ticket Code</th>
                                <th className="p-1 text-left">Assigned Cashier</th>
                                <th className="p-1 text-left">Status</th>
                                <th className="p-1 text-left">Queue Date</th>
                            </tr>
                        </thead>
                        <tbody className="shadow-md">
                            {response.data && response.data.map(item => (
                                <tr key={item.id}>
                                    <td className="p-1">{item.student_id}</td>
                                    <td className="p-1">{item.ticket_code}</td>
                                    <td className="p-1">{formatCashier(item.assigned_person)}</td>
                                    <td className="p-1">{formatStatus(item.status)}</td>
                                    <td className="p-1">{formatDateTime(item.created_at)}</td>
                                </tr>
                            ))}
                            {/* <tr>
                                <td colSpan="5" className="text-center text-gray-300 py-5">No available data</td>
                            </tr> */}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="mt-3 flex justify-between items-center">
                        <button className="hover:underline">Refresh</button>
                        <div className="flex items-center gap-5">
                            <p>Showing 1 ~ 5 of 100 items</p>
                            <FontAwesomeIcon icon={faChevronLeft} className="text-gray-300 cursor-pointer" />
                            <FontAwesomeIcon icon={faChevronRight} className="text-gray-300 cursor-pointer" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Queue