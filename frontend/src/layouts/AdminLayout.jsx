import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { logout, getToken } from "../auth/auth";
import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
      fetchPending();
      const interval = setInterval(fetchPending, 30000); // Check every 30s
      return () => clearInterval(interval);
  }, []);

  const fetchPending = async () => {
      try {
          const res = await axios.get("http://localhost:8080/api/requests/pending", {
              headers: { Authorization: `Bearer ${getToken()}` }
          });
          setPendingCount(res.data.length);
      } catch (e) {
          console.error("Failed to fetch requests", e);
      }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const inventoryItems = [
    { name: "Dashboard", path: "/admin" },
    { name: "Pieces", path: "/admin/pieces" },
    { name: "Receive Stock", path: "/admin/entry" },
    { name: "Low Stock", path: "/admin/low-stock" },
    { name: "Suppliers", path: "/admin/suppliers" },
    { name: "Supplier Orders", path: "/admin/orders" },
    { name: "Workshop Requests", path: "/admin/requests" },
    { name: "Stock Ledger", path: "/admin/ledger" },
    { name: "AI Recommendations", path: "/admin/recommendations" }
  ];

  const salesItems = [
    { name: "Clients", path: "/admin/clients" },
    { name: "Quotes (Devis)", path: "/admin/client-devis" },
    { name: "Client Orders", path: "/admin/client-orders" }
  ];

  const renderNavItems = (items) => {
      return items.map((item) => {
        const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
        return (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
              isActive
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/20"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <span className="font-medium text-sm">{item.name}</span>
            {item.name === "Workshop Requests" && pendingCount > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full animate-pulse shadow-sm">
                    {pendingCount}
                </span>
            )}
          </Link>
        );
      });
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-20">
        <div className="h-16 flex items-center px-6 bg-slate-950/50 border-b border-white/5">
          <h1 className="text-xl font-bold tracking-wider text-indigo-400">
            StockAI
          </h1>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-6 overflow-y-auto">
          
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Inventory</p>
            {renderNavItems(inventoryItems)}
          </div>

          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sales & Clients</p>
            {renderNavItems(salesItems)}
          </div>

        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-300 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white shadow-sm flex items-center px-8 border-b border-slate-200 z-10">
            <h2 className="text-lg font-medium text-slate-800">Admin Portal</h2>
        </header>

        {/* Main scrollable area */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}