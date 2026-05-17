import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-white shadow p-4">

      <h1 className="text-xl font-bold mb-6">
        StockAI
      </h1>

      <nav className="flex flex-col gap-3">

        <Link to="/" className="hover:bg-gray-100 p-2 rounded">
          Dashboard
        </Link>

        <Link to="/stock" className="hover:bg-gray-100 p-2 rounded">
          Stock
        </Link>

        <Link to="/reorder" className="hover:bg-gray-100 p-2 rounded">
          Reorder
        </Link>

      </nav>

    </div>
  );
}