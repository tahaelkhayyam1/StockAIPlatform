import { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { logout, getAuth } from "../auth/auth";

export default function SharedLayout({ sidebarContent, portalName }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const authData = getAuth();
    if (authData) {
        setUser(authData);
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-20 shrink-0">
        <div className="h-16 flex items-center px-6 bg-slate-950/50 border-b border-white/5 shrink-0">
          <h1 className="text-xl font-bold tracking-wider text-indigo-400">
            StockAI
          </h1>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {sidebarContent}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 border-b border-slate-200 z-10 shrink-0">
            <h2 className="text-lg font-medium text-slate-800">{portalName}</h2>
            
            {/* User Profile Area */}
            <div className="relative">
                <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-3 focus:outline-none"
                >
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-gray-700 leading-tight">{user?.email || "User"}</p>
                        <p className="text-xs text-gray-500">{user?.role || "Role"}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full border-2 border-indigo-200 overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                        {user?.profilePicture ? (
                            <img src={`http://localhost:8080${user.profilePicture}`} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                            <svg className="h-6 w-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        )}
                    </div>
                    <svg className={`w-4 h-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                    <>
                        <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)}></div>
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-40 border border-gray-200 ring-1 ring-black ring-opacity-5 animate-in fade-in slide-in-from-top-2 duration-100">
                            <Link 
                                to="/profile" 
                                onClick={() => setDropdownOpen(false)}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                My Profile
                            </Link>
                            <button 
                                onClick={() => {
                                    setDropdownOpen(false);
                                    handleLogout();
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </>
                )}
            </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
