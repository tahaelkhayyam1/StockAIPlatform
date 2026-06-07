import { Outlet, useNavigate } from "react-router-dom";

export default function Layout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <div className="w-64 bg-gray-900 text-white p-4 flex flex-col">

        <h2 className="text-xl font-bold mb-6">StockAI</h2>

        <nav className="space-y-3 flex-1">
          <button
            onClick={() => navigate("/dashboard")}
            className="hover:bg-gray-700 w-full text-left px-2 py-1 rounded"
          >
            Dashboard
          </button>
        </nav>

        <button
          onClick={logout}
          className="bg-red-500 px-3 py-1 rounded"
        >
          Logout
        </button>

      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8">
        <Outlet />
      </div>

    </div>
  );
}