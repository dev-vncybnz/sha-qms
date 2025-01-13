import React, { useEffect, useRef, useState } from 'react'
import Swal from 'sweetalert2'
import Ticket from './Ticket';
import { useReactToPrint } from 'react-to-print';

const GenerateTicket = () => {

    const [ticket, setTicket] = useState({});
    const componentRef = useRef();

    useEffect(() => {
        if (ticket.code && ticket.destination) {
            printFn();
        }
    }, [ticket.code, ticket.destination]);

    const handleAfterPrint = React.useCallback(() => {
        setTicket({});
        console.log("`onAfterPrint` called");
    }, []);

    const handleBeforePrint = React.useCallback(() => {
        console.log("`onBeforePrint` called");
        return Promise.resolve();
    }, []);

    const printFn = useReactToPrint({
        contentRef: componentRef,
        documentTitle: ticket.code,
        onAfterPrint: handleAfterPrint,
        onBeforePrint: handleBeforePrint,
    });

    const onClickButton = async (person) => {
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
            const url = `${import.meta.env.VITE_API_URL}/api/queues`;
            const requestOptions = {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-API-KEY": apiKey,
                },
                body: JSON.stringify({
                    person
                })
            };

            const response = await fetch(url, requestOptions);
            const responseJSON = await response.json();
            const { code } = responseJSON;
            const destination = person == 0 ? 'Cashier' : 'Registrar';
            setTicket({ code, destination });
        }
    }

    return (
        <div id="generate-ticket">
            <div className="container h-screen flex flex-col justify-center p-10">
                <h1 className="text-5xl text-center mb-12 text-center uppercase">Generate Ticket Number</h1>

                <div className="flex flex-col gap-8">
                    <button type="button" onClick={() => onClickButton(0)} className="text-2xl bg-blue-500 px-16 py-8 text-white rounded-full text-lg text-center uppercase hover:bg-blue-400">Cashier</button>
                    <button type="button" onClick={() => onClickButton(1)} className="text-2xl bg-red-500 px-16 py-8 text-white rounded-full text-lg text-center uppercase hover:bg-red-400">Registrar</button>
                </div>
            </div>

            <div className="absolute -top-full">
                <Ticket ref={componentRef} code={ticket.code} destination={ticket.destination} />
            </div>
        </div>
    )
};

export default GenerateTicket