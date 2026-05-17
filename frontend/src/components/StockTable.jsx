import { useEffect, useState } from "react";
import { getStockOverview } from "../api/stock";

export default function StockTable() {
  const [stocks, setStocks] = useState([]);
  const [search, setSearch] = useState("");
const [onlyLowStock, setOnlyLowStock] = useState(false);
  useEffect(() => {
    loadStock();
  }, []);

  const loadStock = async () => {
    const data = await getStockOverview();
    setStocks(data);
  };

  const filteredStocks = stocks
  .filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.reference.toLowerCase().includes(search.toLowerCase())
  )
  .filter(item =>
    onlyLowStock ? item.lowStock : true
  );

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Stock Overview</h2>
      </div>

      <div className="overflow-x-auto">
        <input
          type="text"
          placeholder="Search piece..."
          className="border p-2 rounded w-full mb-4"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="p-3">Reference</th>
              <th className="p-3">Piece</th>
              <th className="p-3">Current Stock</th>
              <th className="p-3">Minimum Stock</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
<label className="flex items-center gap-2 mb-4">
  <input
    type="checkbox"
    checked={onlyLowStock}
    onChange={(e) => setOnlyLowStock(e.target.checked)}
  />
  Show only low stock
</label>
          <tbody>
            {filteredStocks.map((item) => (
              <tr key={item.pieceId} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{item.reference}</td>
                <td className="p-3">{item.name}</td>
                <td className="p-3">{item.currentStock}</td>
                <td className="p-3">{item.minimumStock}</td>
                <td className="p-3">
                  {item.lowStock ? (
                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">
                      Low Stock
                    </span>
                  ) : (
                    <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">
                      Healthy
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}