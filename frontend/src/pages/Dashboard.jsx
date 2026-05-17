import { useEffect, useState } from "react";
import { getKpis, getAdvancedKpis } from "../api/dashboard";
import StockTable from "../components/StockTable";
import Sidebar from "../components/Sidebar";
export default function Dashboard() {

  const [kpis, setKpis] = useState(null);
  const [advanced, setAdvanced] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const basic = await getKpis();
    const adv = await getAdvancedKpis();

    setKpis(basic);
    setAdvanced(adv);
  };

  if (!kpis || !advanced) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="flex">
 
    <div className="min-h-screen bg-gray-100 p-8">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">
          StockAI Dashboard
        </h1>

        <p className="text-gray-500 mt-2">
          Inventory intelligence & analytics platform
        </p>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500 text-sm">Total Pieces</h2>
          <p className="text-4xl font-bold mt-2">
            {kpis.totalPieces}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500 text-sm">Low Stock Alerts</h2>
          <p className="text-4xl font-bold mt-2 text-red-500">
            {kpis.lowStockCount}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500 text-sm">Stock Movements</h2>
          <p className="text-4xl font-bold mt-2">
            {kpis.totalStockMovements}
          </p>
        </div>

      </div>

      {/* ADVANCED SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* STOCK VALUE */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Total Stock Value
          </h2>

          <p className="text-5xl font-bold text-green-600">
            € {advanced.totalStockValue.toFixed(2)}
          </p>
        </div>

        {/* TOP CONSUMED */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Top Consumed Parts
          </h2>

          <ul className="space-y-2">
            {advanced.topConsumedPieces.map((p, i) => (
              <li
                key={i}
                className="bg-gray-100 rounded p-3"
              >
                {p}
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* CRITICAL PARTS */}
      <div className="bg-white rounded-xl shadow p-6 mt-6">

        <h2 className="text-xl font-semibold mb-4 text-red-500">
          Critical Parts
        </h2>

        {advanced.criticalPieces.length === 0 ? (
          <p>No critical parts detected</p>
        ) : (
          <ul className="space-y-2">
            {advanced.criticalPieces.map((p, i) => (
              <li
                key={i}
                className="bg-red-100 text-red-700 rounded p-3"
              >
                ⚠ {p}
              </li>
            ))}
          </ul>
        )}

      </div>
<StockTable />
    </div>
       </div>
  );
}