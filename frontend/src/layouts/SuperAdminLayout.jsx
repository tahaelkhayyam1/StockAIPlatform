import { Link, useLocation } from "react-router-dom";
import SharedLayout from "./SharedLayout";

export default function SuperAdminLayout() {
  const location = useLocation();

  const navItems = [
    { 
        name: "Dashboard", 
        path: "/superadmin",
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
    },
    { 
        name: "Users", 
        path: "/superadmin/users",
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
    },
    { 
        name: "Audit Logs", 
        path: "/superadmin/audit",
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
    },
    { 
        name: "Support Requests", 
        path: "/superadmin/support",
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
    }
  ];

  return (
    <SharedLayout 
        portalName="Super Admin Portal"
        sidebarContent={
            <>
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== '/superadmin' && location.pathname.startsWith(item.path));
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center px-4 py-3 rounded-lg transition-all border-l-4 ${
                                isActive
                                    ? "bg-[#0055A5] text-white border-white shadow-lg shadow-[#0055A5]/30"
                                    : "border-transparent text-gray-300 hover:bg-[#00264D] hover:text-white"
                            }`}
                        >
                            <span className="mr-3">{item.icon}</span>
                            <span className="font-medium text-sm">{item.name}</span>
                        </Link>
                    );
                })}
            </>
        }
    />
  );
}