import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
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
import Clients from "./pages/admin/Clients";
import ClientOrders from "./pages/admin/ClientOrders";
import ClientDevis from "./pages/admin/ClientDevis";

import WorkshopDashboard from "./pages/workshop/WorkshopDashboard";
import SuperAdminLayout from "./layouts/SuperAdminLayout";
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import SuperAdminUsers from "./pages/superadmin/SuperAdminUsers";
import AuditLogs from "./pages/superadmin/AuditLogs";
import SuperAdminSupport from "./pages/superadmin/SuperAdminSupport";

import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

import WorkshopLayout from "./layouts/WorkshopLayout";
import UserProfile from "./pages/UserProfile";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<LandingPage />} />

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* SHARED AUTHENTICATED ROUTES */}
        <Route
            path="/profile"
            element={
                <ProtectedRoute role={["SUPER_ADMIN", "ADMIN", "WORKSHOP", "MANAGER", "SUPPLIER"]}>
                    <UserProfile />
                </ProtectedRoute>
            }
        />

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
          <Route path="clients" element={<Clients />} />
          <Route path="client-orders" element={<ClientOrders />} />
          <Route path="client-devis" element={<ClientDevis />} />
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
          <Route path="support" element={<SuperAdminSupport />} />
        </Route>

        {/* WORKSHOP */}
        <Route
          path="/workshop"
          element={
            <ProtectedRoute role="WORKSHOP">
              <WorkshopLayout />
            </ProtectedRoute>
          }
        >
            <Route index element={<WorkshopDashboard />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}