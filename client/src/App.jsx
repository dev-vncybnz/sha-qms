import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
// import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import GenerateTicket from './pages/GenerateTicket';
import QueueMonitor from './pages/QueueMonitor';
import ManageQueue from './pages/ManageQueue';
import PrintTicket from './pages/Ticket';
import Login from './pages/Login';
import { AuthContextProvider } from './contexts/AuthContext';
import SecureRoutes from './SecureRoutes';
import NotFound from './pages/NotFound';

function App() {
  return (
    <>
      <BrowserRouter>
        <AuthContextProvider>
          <Routes>
            <Route path="/generate-ticket" element={<GenerateTicket />} />
            <Route path="/print-ticket" element={<PrintTicket />} />
            <Route path="/queue" element={<QueueMonitor />} />
            <Route path="/admin">
              <Route element={<SecureRoutes />}>
                <Route path="manage-queue" element={<ManageQueue />} />
              </Route>
              <Route path="login" element={<Login />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthContextProvider>
      </BrowserRouter>
    </>
  );
}

export default App
