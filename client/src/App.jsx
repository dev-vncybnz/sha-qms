import { BrowserRouter, Route, Routes } from 'react-router-dom';
import GenerateTicket from './pages/GenerateTicket';
import QueueMonitor from './pages/QueueMonitor';
import Login from './pages/Login';
import { AuthContextProvider } from './contexts/AuthContext';
import SecureRoutes from './SecureRoutes';
import NotFound from './pages/NotFound';
import CashierQueue from './pages/cashier/Queue';
import CashierDashboard from './pages/cashier/Dashboard';
import RegistrarDashboard from './pages/registrar/Dashboard';

function App() {
  return (
    <>
      <BrowserRouter>
        <AuthContextProvider>
          <Routes>
            <Route path="/generate-ticket" element={<GenerateTicket />} />
            <Route path="/queue-monitor" element={<QueueMonitor />} />
            <Route path="/login" element={<Login />} />

            <Route path="/cashier">
              <Route path="" element={<CashierDashboard />} />
              <Route path="queue" element={<CashierQueue />} />
              <Route element={<SecureRoutes />}>

              </Route>
            </Route>
            
            <Route path="/registrar">
              <Route path="" element={<RegistrarDashboard />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthContextProvider>
      </BrowserRouter>
    </>
  );
}

export default App
