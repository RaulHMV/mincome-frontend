import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Apartados from './pages/Apartados/Apartados';
import Calendario from './pages/Calendario/Calendario';
import Dashboard from './pages/Dashboard/Dashboard';
import Historial from './pages/Historial/Historial';
import Login from './pages/Login/Login';
import Movimientos from './pages/Movimientos/Movimientos';
import NuevaOperacion from './pages/Movimientos/NuevaOperacion';
import Register from './pages/Register/Register';
import Tarjetas from './pages/Tarjetas/Tarjetas';
import { useAppSelector } from './store/hooks';
import { selectIsAuthenticated } from './store/slices/authSlice';

function ProtectedRoute() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  return isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />;
}

function PublicAuthRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicAuthRoute>
              <Login />
            </PublicAuthRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicAuthRoute>
              <Register />
            </PublicAuthRoute>
          }
        />
        <Route element={<ProtectedRoute />}>
          <Route index element={<Dashboard />} />
          <Route path="movimientos" element={<Movimientos />} />
          <Route path="movimientos/nuevo" element={<NuevaOperacion />} />
          <Route path="movimientos/nueva-operacion" element={<NuevaOperacion />} />
          <Route path="apartados" element={<Apartados />} />
          <Route path="tarjetas" element={<Tarjetas />} />
          <Route path="calendario" element={<Calendario />} />
          <Route path="historial" element={<Historial />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
