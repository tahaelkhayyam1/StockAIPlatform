import { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../../auth/auth";

const API = "http://localhost:8080/api/stock-movements";

export default function StockLedger() {
  const [movements, setMovements] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadMovements();
  }, [page]);

  const loadMovements = async () => {
    try {
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${getToken()}` },
        params: { page, size: 15 }
      });
      setMovements(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
  };

  const handleExportCSV = () => {
    if (movements.length === 0) return;
    const headers = ["Date & Time", "Type", "Piece Name", "Piece Ref", "Quantity"];
    const rows = movements.map(m => [
        formatDate(m.timestamp).replace(/,/g, ''),
        m.type,
        m.piece ? m.piece.name.replace(/,/g, '') : 'Unknown',
        m.piece ? m.piece.reference : 'N/A',
        m.quantity
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n"
        + rows.map(e => e.join(",")).join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `stock_ledger_page_${page + 1}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Stock Ledger</h1>
            <p className="text-gray-500 text-sm mt-1">Real-time chronological log of all stock entering and leaving the platform.</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={movements.length === 0}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow-sm font-medium transition-colors disabled:opacity-50"
        >
          Export Ledger (CSV)
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Piece</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {movements.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(m.timestamp)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${m.type === 'ENTRY' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                      {m.type}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{m.piece ? m.piece.name : 'Unknown Piece'} <span className="text-gray-400 font-normal ml-2">{m.piece ? m.piece.reference : ''}</span></td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${m.type === 'ENTRY' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {m.type === 'ENTRY' ? '+' : '-'}{m.quantity}
                </td>
              </tr>
            ))}
            {movements.length === 0 && (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No stock movements found.</td></tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-white">
          <span className="text-sm text-gray-700">
            Page <span className="font-medium">{page + 1}</span> of <span className="font-medium">{totalPages || 1}</span>
          </span>
          <div className="flex gap-2">
            <button 
              disabled={page === 0} 
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <button 
              disabled={page >= totalPages - 1} 
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
