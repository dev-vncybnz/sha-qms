import React, { useEffect, useRef, useState } from 'react'
import shaLoonLogo from '../assets/images/sha-loon-logo.png';

const QueueMonitor = () => {

    const [videoUrl, setVideoUrl] = useState(null);
    const videoRef = useRef(null);
    const [currentDateTime, setCurrentDateTime] = useState({
        date: null,
        time: null
    });
    const [latestTickets, setLatestTickets] = useState({
        cashier_1: null,
        cashier_2: null,
        registrar: null,
    });

    // Get Video
    useEffect(() => {
        const controller = new AbortController();

        try {
            const fetchVideo = async () => {

                const baseUrl = import.meta.env.VITE_API_URL;
                const apiKey = import.meta.env.VITE_API_KEY;
                const url = `${baseUrl}/api/videos`;
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
                const { filename } = responseJSON;
                const videoUrl = `${baseUrl}/storage/videos/${filename}`;

                setVideoUrl(videoUrl);
            };

            fetchVideo();
        } catch (error) {
            console.log(`API error ${error}`);
        }

        return () => {
            controller.abort();
        }
    }, []);

    // Set Current Date & Time
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

    // Get Latest Tickets
    useEffect(() => {
        const controller = new AbortController();
        const intervalId = setInterval(async () => {
            const apiKey = import.meta.env.VITE_API_KEY;
            const url = `${import.meta.env.VITE_API_URL}/api/latest-tickets`;
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
                const { cashier_1, cashier_2, registrar } = responseJSON;

                setLatestTickets({ cashier_1, cashier_2, registrar });
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
            <div className="h-full w-3/4 mx-auto">
                <div className="flex w-full h-full items-center">
                    <div className="w-1/2 border-blue-500 flex flex-col gap-10 mb-20 xl:mb-32 xl:gap-32">
                        <div className="text-center">
                            <p className="text-3xl xl:text-8xl">Cashier 1</p>
                            <p className="text-5xl font-bold text-red-500 mt-3 xl:text-9xl xl:mt-5">{latestTickets.cashier_1 ?? '----'}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl xl:text-8xl">Cashier 2</p>
                            <p className="text-5xl font-bold text-blue-500 mt-3 xl:text-9xl xl:mt-5">{latestTickets.cashier_2 ?? '----'}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl xl:text-8xl">Registrar</p>
                            <p className="text-5xl font-bold text-green-500 mt-3 xl:text-9xl xl:mt-5">{latestTickets.registrar ?? '----'}</p>
                        </div>
                    </div>
                    <div className="w-1/2 xl:w-3/4 xl:ml-32 flex flex-col gap-10">
                        <video ref={videoRef} className="shadow-xl rounded-2xl border border-2 border-black offset-5 bg-white block w-full h-full object-cover overflow-hidden" src={videoUrl} autoPlay muted loop controls={false}>
                            Your browser does not support the video tag.
                        </video>
                        <div className="flex gap-10 justify-center items-center xl:gap-32 xl:mt-10">
                            <img src={shaLoonLogo} alt="SHA Loon Logo" className="w-1/6 h-full xl:w-1/3" />

                            <div className="text-center xl:flex xl:flex-col xl:gap-10">
                                <p className="text-3xl xl:text-8xl">{currentDateTime.time}</p>
                                <p className="xl:text-7xl">{currentDateTime.date}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default QueueMonitor