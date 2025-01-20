import { BrowserRouter, Route, Routes } from 'react-router-dom'
import GenerateTicket from './pages/GenerateTicket'
import QueueMonitor from './pages/QueueMonitor'
import Login from './pages/Login'
import { AuthContextProvider } from './contexts/AuthContext'
import SecureRoutes from './SecureRoutes'
import NotFound from './pages/NotFound'
import CashierQueue from './pages/cashier/Queue'
import RegistrarQueue from './pages/registrar/Queue'
import RegistrarReports from './pages/registrar/Reports'
import Videos from './pages/cashier/Videos'
import Template from './pages/Template'
import Forbidden from './pages/Forbidden'
import CashierReports from './pages/cashier/Reports'
import RegistrarDashboard from './pages/registrar/Dashboard'
import CashierDashboard from './pages/registrar/Dashboard'

function App() {
  return (
    <>
      <BrowserRouter>
        <AuthContextProvider>
          <Routes>
            <Route path="/template" element={<Template />} />
            <Route path="/login" element={<Login />} />
            <Route path="/generate-ticket" element={<GenerateTicket />} />
            <Route path="/queue-monitor" element={<QueueMonitor />} />

            <Route element={<SecureRoutes />}>
              <Route path="/cashier">
                <Route path="" element={<CashierDashboard />} />
                <Route path="queue" element={<CashierQueue />} />
                <Route path="reports" element={<CashierReports />} />
                <Route path="videos" element={<Videos />} />
              </Route>

              <Route path="/registrar">
                <Route path="" element={<RegistrarDashboard />} />
                <Route path="queue" element={<RegistrarQueue />} />
                <Route path="reports" element={<RegistrarReports />} />
              </Route>
            </Route>

            <Route path="/forbidden" element={<Forbidden />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthContextProvider>
      </BrowserRouter>
    </>
  );
}

export default App
