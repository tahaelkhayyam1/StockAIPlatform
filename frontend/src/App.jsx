import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";

import ProtectedRoute from "./auth/ProtectedRoute";

import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import LowStock from "./pages/admin/LowStock";
import Pieces from "./pages/admin/Pieces";
import Suppliers from "./pages/admin/Suppliers";
import StockLedger from "./pages/admin/StockLedger";
import SupplierOrders from "./pages/admin/SupplierOrders";
import AIRecommendations from "./pages/admin/AIRecommendations";
import StockEntry from "./pages/admin/StockEntry";
import AdminRequests from "./pages/admin/AdminRequests";

import WorkshopDashboard from "./pages/workshop/WorkshopDashboard";
import SuperAdminLayout from "./layouts/SuperAdminLayout";
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import SuperAdminUsers from "./pages/superadmin/SuperAdminUsers";
import AuditLogs from "./pages/superadmin/AuditLogs";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* ADMIN (LAYOUT WRAPPED ROUTES) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="low-stock" element={<LowStock />} />
          <Route path="pieces" element={<Pieces />} />
          <Route path="entry" element={<StockEntry />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="requests" element={<AdminRequests />} />
          <Route path="orders" element={<SupplierOrders />} />
          <Route path="ledger" element={<StockLedger />} />
          <Route path="recommendations" element={<AIRecommendations />} />
        </Route>

        {/* SUPER ADMIN */}
        <Route
          path="/superadmin"
          element={
            <ProtectedRoute role="SUPER_ADMIN">
              <SuperAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<SuperAdminDashboard />} />
          <Route path="users" element={<SuperAdminUsers />} />
          <Route path="audit" element={<AuditLogs />} />
        </Route>

        {/* WORKSHOP */}
        <Route
          path="/workshop"
          element={
            <ProtectedRoute role="WORKSHOP">
              <WorkshopDashboard />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}