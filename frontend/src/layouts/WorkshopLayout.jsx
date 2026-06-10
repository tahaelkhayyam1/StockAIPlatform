import { Link, useLocation } from "react-router-dom";
import SharedLayout from "./SharedLayout";

export default function WorkshopLayout() {
  const location = useLocation();

  const navItems = [
    { 
        name: "Workshop Dashboard", 
        path: "/workshop",
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
    },
  ];

  return (
    <SharedLayout 
        portalName="Workshop Portal"
        sidebarContent={
            <>
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== '/workshop' && location.pathname.startsWith(item.path));
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
