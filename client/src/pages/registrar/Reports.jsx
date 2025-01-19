import React, { useEffect, useRef, useState } from 'react'
import Sidebar from '../../components/Sidebar'
import shaLoonLogo from '../../assets/images/sha-loon-logo.png'
import { useAuth } from '../../contexts/AuthContext';
import { useReactToPrint } from 'react-to-print';

const Reports = () => {

    const [data, setData] = useState([]);
    const authContext = useAuth();
    const componentRef = useRef();

    useEffect(() => {
        const controller = new AbortController();

        const fetchData = async () => {
            const baseUrl = import.meta.env.VITE_API_URL;
            const apiKey = import.meta.env.VITE_API_KEY;
            const token = authContext.token;
            const url = `${baseUrl}/api/admin/generate-report`;
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

                setData(responseJSON);
            } catch (error) {
                console.log(`API Error: ${error}`);
            }
        };

        fetchData();

        return () => {
            controller.abort();
        }
    }, []);

    const capitalize = text => text.charAt(0).toUpperCase() + text.substring(1);

    const textStatus = status => ["Pending", "In Progress", "Completed"][status];

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

    const getFileName = () => {
        let filename = `REG-${formatDateTime(new Date())}`;
        filename = filename.split(" ")[0];

        return filename;
    }

    const printFn = useReactToPrint({
        contentRef: componentRef,
        documentTitle: getFileName(),
    });

    const onClickPrint = () => printFn();

    return (
        <>
            <div className="flex h-screen">
                <Sidebar className="w-1/5" />

                {/* Content */}
                <div className="w-full min-h-full px-5 py-3 flex flex-col justify-between items-center">

                    {/* Reports Content */}
                    <div ref={componentRef} className="grow self-stretch my-2 overflow-y-auto flex flex-col gap-5 px-2">
                        <div className="flex gap-5 items-center justify-center border-b-2 border-gray-500 pb-5 self-stretch">
                            <img src={shaLoonLogo} alt="SHA Loon Logo" className="w-20" />
                            <div className="text-center">
                                <h1 className="text-2xl">Sacred Heart Academy</h1>
                                <p>Lintuan, Loon, Bohol</p>
                            </div>
                        </div>

                        <table className="mt-3 w-full">
                            <thead className="bg-red-100">
                                <tr>
                                    <th className="p-1 py-2 pl-5 text-left font-normal text-center">No.</th>
                                    <th className="p-1 py-2 pl-5 text-left font-normal">Ticket Code</th>
                                    <th className="p-1 py-2 text-left font-normal">Assigned Person</th>
                                    <th className="p-1 py-2 text-left font-normal">Status</th>
                                    <th className="p-1 py-2 text-left font-normal">Date Completed</th>
                                </tr>
                            </thead>
                            <tbody className="shadow-md">
                                {data && data.length > 0 && data.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="p-1 pl-5 text-center">{++index}</td>
                                        <td className="p-1 pl-5">{item.ticket_code}</td>
                                        <td className="p-1">{capitalize(item.assigned_person)}</td>
                                        <td className="p-1">{textStatus(item.status)}</td>
                                        <td className="p-1">{formatDateTime(item.updated_at)}</td>
                                    </tr>
                                ))}
                                {data && data.length == 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center text-gray-300 py-5">No available data</td>
                                    </tr>
                                )}
                            </tbody>
                            {data && data.length > 0 && (
                                <tfoot className="bg-gray-200">
                                    <tr>
                                        <td colSpan={5} className="text-center py-2">Total number of completed tickets: <strong>{data.length ?? "0"}</strong></td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>

                        <div className="flex justify-between items-center">
                            <p>SHA Queue Management System</p>
                            <p>Date Issued: <em>{formatDateTime(new Date())}</em></p>
                        </div>
                    </div>

                    {data && data.length > 0 && (
                        <button onClick={onClickPrint} className="bg-red-500 text-white hover:bg-red-400 w-32 rounded-md p-2">Print</button>
                    )}
                </div>
            </div>
        </>
    )
}

export default Reports