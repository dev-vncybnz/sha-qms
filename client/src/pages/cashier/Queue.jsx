import React from 'react'
import shaLoonLogo from '../../assets/images/sha-loon-logo.png'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Queue = () => {
    return (
        <>
            <div className="flex h-screen">
                {/* Sidebar */}
                <div className="w-1/5 shadow-xl flex flex-col gap-3 p-5">
                    <img src={shaLoonLogo} alt="SHA Loon Logo" />
                    <button className="rounded-md py-2 hover:text-white hover:bg-red-500">Dashboard</button>
                    <button className="text-white rounded-md py-2 bg-red-500 hover:bg-red-400">Queue</button>
                    <button className="rounded-md py-2 hover:text-white hover:bg-red-500">Reports</button>
                    <button className="rounded-md py-2 hover:text-white hover:bg-red-500">Videos</button>
                    <button className="rounded-md py-2 hover:text-white hover:bg-red-500">Logout</button>
                </div>
                {/* Content */}
                <div className="w-full px-5 py-3">
                    <div className="flex justify-between">
                        <div className="w-1/4 text-left">
                            <p className="text-4xl">CAS-0001</p>
                            <p>Cashier 1</p>
                            <button className="text-white rounded-md bg-red-500 hover:bg-red-400 min-w-20 mt-3">Call</button>
                        </div>

                        <button className="text-white rounded-md py-2 bg-blue-500 hover:bg-blue-400 self-center min-w-36">Next</button>

                        <div className="w-1/4 text-right">
                            <p className="text-4xl">CAS-0002</p>
                            <p>Cashier 2</p>
                            <button className="text-white rounded-md bg-red-500 hover:bg-red-400 min-w-20 mt-3">Call</button>
                        </div>
                    </div>

                    {/* Queue Table */}
                    <table className="mt-10 w-full">
                        <thead className="bg-red-500 text-white">
                            <tr>
                                <th className="p-1 text-left">Student ID</th>
                                <th className="p-1 text-left">Ticket Code</th>
                                <th className="p-1 text-left">Status</th>
                                <th className="p-1 text-left">Queue Date</th>
                            </tr>
                        </thead>
                        <tbody className="shadow-md">
                            <tr>
                                <td className="p-1">Student ID</td>
                                <td className="p-1">Ticket Code</td>
                                <td className="p-1">Status</td>
                                <td className="p-1">Queue Date</td>
                            </tr>
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