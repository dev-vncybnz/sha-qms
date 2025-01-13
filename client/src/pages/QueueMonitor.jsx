import React, { useEffect, useState } from 'react'
import shaLoonLogo from '../assets/images/sha-loon-logo.png';

const QueueMonitor = () => {

    const [currentDateTime, setCurrentDateTime] = useState({
        date: null,
        time: null
    });
    const [latestQueueNumbers, setLatestQueueNumbers] = useState({
        cashier: null,
        registrar: null,
    });

    useEffect(() => {
        const intervalId = setInterval(() => {
            const date = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
            const time = new Date().toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
            });

            setCurrentDateTime({
                date,
                time
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        const intervalId = setInterval(async () => {
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

                setLatestQueueNumbers({ cashier: cashierWIPCode, registrar: registrarWIPCode });
            } catch (error) {
                console.log(error);
            }
        }, 2000);

        return () => {
            clearInterval(intervalId);
            controller.abort();
        };
    }, []);

    return (
        <div id="queue-monitor" className="h-screen">
            <div className="container h-full">
                <div className=" w-11/12 flex h-full items-center">
                    <div className="w-1/2 border-blue-500 flex flex-col gap-10 mb-32">
                        <p className="text-3xl text-center">Now Serving</p>

                        <div className="text-center">
                            <p className="text-3xl">Cashier</p>
                            <p className="text-5xl font-bold">{latestQueueNumbers.cashier ?? '----'}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl">Registrar</p>
                            <p className="text-5xl font-bold">{latestQueueNumbers.registrar ?? '----'}</p>
                        </div>
                    </div>
                    <div className="w-1/2 flex flex-col gap-10">
                        <div id="video" className="h-auto border-2 border-black">
                            <video className="w-full h-full" src="/videos/demo.mp4" autoPlay muted loop>
                                <source src="movie.mp4" type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                        <div className="flex gap-10 justify-center items-center">
                            <img src={shaLoonLogo} alt="SHA Loon Logo" className="w-1/6 h-full" />

                            <div className="text-center">
                                <p className="text-3xl w-40">{currentDateTime.time}</p>
                                <p className="w-40">{currentDateTime.date}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default QueueMonitor