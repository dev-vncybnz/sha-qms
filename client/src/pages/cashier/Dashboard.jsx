import React, { useEffect, useState } from 'react'
import Sidebar from '../../components/Sidebar'
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {

  const [totals, setTotals] = useState({});
  const authContext = useAuth();

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      const baseUrl = import.meta.env.VITE_API_URL;
      const apiKey = import.meta.env.VITE_API_KEY;
      const token = authContext.token;
      const url = `${baseUrl}/api/admin/ticket-summary`;
      const requestOptions = {
        signal: controller.signal,
        method: 'GET',
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
        const { incomplete, completed } = responseJSON;

        setTotals({ incomplete, completed });
      } catch (error) {
        console.log(`API Error: ${error}`);
      }
    }

    fetchData();
  }, []);

  return (
    <>
      <div className="flex h-screen">
        <Sidebar className="w-1/5" />

        {/* Content */}
        <div className="w-full min-h-full p-5">
          <div className="flex gap-5">
            <div className="shadow-md w-1/4 p-5 rounded-md">
              <p className="text-4xl">{totals.incomplete ?? '0'}</p>
              <p className="text-md text-gray-500">Waiting List</p>
            </div>
            <div className="shadow-md w-1/4 p-5 rounded-md">
              <p className="text-4xl">{totals.completed ?? '0'}</p>
              <p className="text-md text-gray-500">Completed</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Dashboard