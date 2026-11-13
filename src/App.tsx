import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard/Dashboard';

function ModulePlaceholder() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center rounded-2xl border border-[#EBE7E0] bg-white p-8 shadow-2xs">
      <p className="text-sm font-medium text-[#778089]">Módulo en integración</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="login" element={<ModulePlaceholder />} />
          <Route path="movimientos" element={<ModulePlaceholder />} />
          <Route path="movimientos/nuevo" element={<ModulePlaceholder />} />
          <Route path="movimientos/nueva-operacion" element={<ModulePlaceholder />} />
          <Route path="apartados" element={<ModulePlaceholder />} />
          <Route path="tarjetas" element={<ModulePlaceholder />} />
          <Route path="calendario" element={<ModulePlaceholder />} />
          <Route path="historial" element={<ModulePlaceholder />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
