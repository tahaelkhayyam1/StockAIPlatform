import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { logout, getToken } from "../auth/auth";
import SharedLayout from "./SharedLayout";
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
    { 
        name: "Dashboard", 
        path: "/admin",
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
    },
    { 
        name: "Pieces", 
        path: "/admin/pieces",
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
    },
    { 
        name: "Low Stock", 
        path: "/admin/low-stock",
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
    },
    { 
        name: "Suppliers", 
        path: "/admin/suppliers",
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
    },
    { 
        name: "Supplier Orders", 
        path: "/admin/orders",
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
    },
    { 
        name: "Workshop Requests", 
        path: "/admin/requests",
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
    },
    { 
        name: "Stock Ledger", 
        path: "/admin/ledger",
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
    },
    { 
        name: "AI Recommendations", 
        path: "/admin/recommendations",
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
    }
  ];

  const salesItems = [
    { 
        name: "Clients", 
        path: "/admin/clients",
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
    },
    { 
        name: "Quotes (Devis)", 
        path: "/admin/client-devis",
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
    },
    { 
        name: "Client Orders", 
        path: "/admin/client-orders",
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
    }
  ];

  const renderNavItems = (items) => {
      return items.map((item) => {
        const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
        return (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all border-l-4 ${
              isActive
                ? "bg-[#0055A5] text-white border-white shadow-lg shadow-[#0055A5]/30"
                : "border-transparent text-gray-300 hover:bg-[#00264D] hover:text-white"
            }`}
          >
            <div className="flex items-center">
                <span className="mr-3">{item.icon}</span>
                <span className="font-medium text-sm">{item.name}</span>
            </div>
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
    <SharedLayout 
        portalName="Admin Portal"
        sidebarContent={
            <>
              <div className="space-y-1 mb-6">
                <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Inventory</p>
                {renderNavItems(inventoryItems)}
              </div>

              <div className="space-y-1">
                <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sales & Clients</p>
                {renderNavItems(salesItems)}
              </div>
              <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
              `}</style>
            </>
        }
    />
  );
}