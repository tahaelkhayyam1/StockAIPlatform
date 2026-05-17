import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ProtectedRoute from "./auth/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* PROTECTED DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* DEFAULT ROUTE */}
        <Route path="*" element={<Login />} />

      </Routes>
    </BrowserRouter>
  );
}