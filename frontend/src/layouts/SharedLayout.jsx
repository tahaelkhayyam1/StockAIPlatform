import { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { logout, getAuth } from "../auth/auth";
import { getMyNotifications, markAsRead } from "../api/notifications";

export default function SharedLayout({ sidebarContent, portalName }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const authData = getAuth();
    if (authData) {
        setUser(authData);
        loadNotifications();
    }
  }, []);

  const loadNotifications = async () => {
    try {
        const notifs = await getMyNotifications();
        // filter out read ones if we only want to show unread, but the backend currently returns what it returns.
        // Wait, the backend finds by role or user, but does it filter by read=false?
        // Let's just filter it on the frontend just in case, or show all and let them click.
        // The plan said "unread count", so let's only keep unread ones.
        setNotifications(notifs.filter(n => !n.read));
    } catch (e) {
        console.error("Failed to load notifications", e);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
        await markAsRead(id);
        setNotifications(notifications.filter(n => n.id !== id));
    } catch (e) {
        console.error("Failed to mark notification as read", e);
    }
  };

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
            
            {/* Top Navbar Actions Area */}
            <div className="flex items-center gap-6">

                {/* Notifications Bell */}
                <div className="relative">
                    <button
                        onClick={() => {
                            setNotifOpen(!notifOpen);
                            setDropdownOpen(false);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none relative transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                        {notifications.length > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                    </button>

                    {/* Notifications Dropdown */}
                    {notifOpen && (
                        <>
                            <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)}></div>
                            <div className="absolute right-0 mt-3 w-80 bg-white rounded-lg shadow-xl py-2 z-40 border border-gray-100 ring-1 ring-black ring-opacity-5 max-h-96 flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                                    <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{notifications.length} Unread</span>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="px-4 py-8 text-center text-sm text-gray-500">
                                            No new notifications
                                        </div>
                                    ) : (
                                        notifications.map(n => (
                                            <div 
                                                key={n.id} 
                                                onClick={() => handleMarkAsRead(n.id)}
                                                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors group"
                                            >
                                                <p className="text-sm text-gray-800 group-hover:text-indigo-600 transition-colors">{n.message}</p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Vertical Divider */}
                <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

                {/* User Profile Area */}
                <div className="relative">
                    <button 
                        onClick={() => {
                            setDropdownOpen(!dropdownOpen);
                            setNotifOpen(false);
                        }}
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
                            <div className="absolute right-0 mt-3 w-48 bg-white rounded-md shadow-lg py-1 z-40 border border-gray-200 ring-1 ring-black ring-opacity-5 animate-in fade-in slide-in-from-top-2 duration-100">
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
