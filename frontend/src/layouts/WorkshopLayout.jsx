import { Link, useLocation } from "react-router-dom";
import SharedLayout from "./SharedLayout";

export default function WorkshopLayout() {
  const location = useLocation();

  const navItems = [
    { name: "Workshop Dashboard", path: "/workshop" },
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
                            className={`flex items-center px-3 py-2.5 rounded-lg transition-all ${
                                isActive
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/20"
                                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            }`}
                        >
                            <span className="font-medium text-sm">{item.name}</span>
                        </Link>
                    );
                })}
            </>
        }
    />
  );
}
