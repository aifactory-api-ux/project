import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPrincipalPage from './pages/DashboardPrincipalPage';

function NotFoundPage() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>404 - Página no encontrada</h1>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/dashboardprincipal" element={<DashboardPrincipalPage />} />
      <Route path="/" element={<Navigate to="/dashboardprincipal" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;