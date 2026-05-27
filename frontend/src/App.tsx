import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import DashboardPrincipalPage from './pages/DashboardPrincipalPage';
import ListaNoticiasPage from './pages/ListaNoticiasPage';
import DetalleNoticiaPage from './pages/DetalleNoticiaPage';
import ReportesDinamicosPage from './pages/ReportesDinamicosPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboardprincipal"
        element={
          <RequireAuth>
            <DashboardPrincipalPage />
          </RequireAuth>
        }
      />
      <Route
        path="/listadenoticias"
        element={
          <RequireAuth>
            <ListaNoticiasPage />
          </RequireAuth>
        }
      />
      <Route
        path="/detalledenoticia/:id"
        element={
          <RequireAuth>
            <DetalleNoticiaPage />
          </RequireAuth>
        }
      />
      <Route
        path="/reportesdinamicos"
        element={
          <RequireAuth>
            <ReportesDinamicosPage />
          </RequireAuth>
        }
      />
      <Route path="/" element={<Navigate to="/dashboardprincipal" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;