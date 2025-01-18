import React, { useEffect, useState } from 'react'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Sidebar from '../../components/Sidebar'
import Swal from 'sweetalert2'
import shaLoonLogo from '../../assets/images/sha-loon-logo.png'

const Reports = () => {

    return (
        <>
            <div className="flex h-screen">
                <Sidebar className="w-1/5" />

                {/* Content */}
                <div className="w-full min-h-full px-5 py-3 flex flex-col justify-between items-center">

                    {/* Reports Content */}
                    <div className="grow self-stretch my-2 overflow-y-auto flex flex-col gap-5 px-2">
                        <div className="flex gap-5 items-center justify-center border-b-2 border-gray-500 pb-5 self-stretch">
                            <img src={shaLoonLogo} alt="SHA Loon Logo" className="w-20" />
                            <div className="text-center">
                                <h1 className="text-2xl">Sacred Heart Academy</h1>
                                <p>Lintuan, Loon, Bohol</p>
                            </div>
                        </div>

                        <h2 className="font-bold">Number of Transactions</h2>
                        <table className="text-center">
                            <thead>
                                <tr>
                                    <th rowSpan={2} className="bg-blue-100 w-1/6">Week</th>
                                    <th colSpan={5} className="bg-red-100 w-2/3">Day</th>
                                    <th rowSpan={2} className="bg-yellow-100 w-3/12">Transactions per Week</th>
                                </tr>
                                <tr>
                                    <th className="border-b">1</th>
                                    <th className="border-b">2</th>
                                    <th className="border-b">3</th>
                                    <th className="border-b">4</th>
                                    <th className="border-b">5</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1</td>
                                    <td>100</td>
                                    <td>100</td>
                                    <td>100</td>
                                    <td>100</td>
                                    <td>100</td>
                                    <td>400</td>
                                </tr>
                                <tr>
                                    <td>1</td>
                                    <td>100</td>
                                    <td>100</td>
                                    <td>100</td>
                                    <td>100</td>
                                    <td>100</td>
                                    <td>400</td>
                                </tr>
                                <tr>
                                    <td>1</td>
                                    <td>100</td>
                                    <td>100</td>
                                    <td>100</td>
                                    <td>100</td>
                                    <td>100</td>
                                    <td>400</td>
                                </tr>
                                <tr>
                                    <td>1</td>
                                    <td>100</td>
                                    <td>100</td>
                                    <td>100</td>
                                    <td>100</td>
                                    <td>100</td>
                                    <td>400</td>
                                </tr>
                            </tbody>
                            <tfoot className="bg-gray-200">
                                <tr>
                                    <td colSpan={6}>Total No. of Transactions for the month of January</td>
                                    <td>750</td>
                                </tr>
                            </tfoot>
                        </table>

                        <h2 className="font-bold">Processing Time</h2>
                    </div>

                    <button className="bg-red-500 text-white hover:bg-red-400 w-32 rounded-md p-2">Print</button>
                </div>
            </div>
        </>
    )
}

export default Reports