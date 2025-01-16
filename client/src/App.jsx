import { BrowserRouter, Route, Routes } from 'react-router-dom';
import GenerateTicket from './pages/GenerateTicket';
import QueueMonitor from './pages/QueueMonitor';
import Login from './pages/Login';
import { AuthContextProvider } from './contexts/AuthContext';
import SecureRoutes from './SecureRoutes';
import NotFound from './pages/NotFound';
import CashierQueue from './pages/cashier/Queue';
import RegistrarQueue from './pages/registrar/Queue';
import ManageVideos from './pages/ManageVideos';
import Template from './pages/Template';
import Forbidden from './pages/Forbidden';

function App() {
  return (
    <>
      <BrowserRouter>
        <AuthContextProvider>
          <Routes>
            <Route path="/template" element={<Template />} />
            <Route path="/generate-ticket" element={<GenerateTicket />} />
            <Route path="/queue-monitor" element={<QueueMonitor />} />
            <Route path="/login" element={<Login />} />

            <Route element={<SecureRoutes />}>
              <Route path="/cashier">
                <Route path="queue" element={<CashierQueue />} />
                <Route path="videos" element={<ManageVideos />} />
              </Route>
              
              <Route path="/registrar">
                <Route path="queue" element={<RegistrarQueue />} />
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
