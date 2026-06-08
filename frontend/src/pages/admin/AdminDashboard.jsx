import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { getToken } from "../../auth/auth";
import { Link } from "react-router-dom";

const API = "http://localhost:8080/api";

export default function AdminDashboard() {
  const [overview, setOverview] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [advancedKpis, setAdvancedKpis] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };
      
      const [overviewRes, kpiRes, advKpiRes] = await Promise.all([
          axios.get(`${API}/stock/overview`, { headers }),
          axios.get(`${API}/dashboard/kpis`, { headers }),
          axios.get(`${API}/dashboard/advanced-kpis`, { headers })
      ]);
      
      setOverview(overviewRes.data);
      setKpis(kpiRes.data);
      setAdvancedKpis(advKpiRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Real-time overview of your stock and supplier health.</p>
        </div>
        <div className="flex gap-3">
            <Link 
                to="/admin/recommendations" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
                View AI Recommendations
            </Link>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Total Pieces" value={overview.length} color="blue" />
        <Card title="Total Stock Value" value={`$${advancedKpis ? advancedKpis.totalStockValue.toLocaleString() : '0'}`} color="emerald" />
        <Card title="Low Stock Alerts" value={advancedKpis?.criticalPieces || 0} color="red" />
        <Card title="Stock Movements" value={kpis?.totalStockMovements || 0} color="indigo" />
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        
        {/* BAR CHART */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Top Consumed Pieces</h2>
          <div className="flex-1 w-full min-h-[300px]">
            {advancedKpis && advancedKpis.topConsumedPieces.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={advancedKpis.topConsumedPieces} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                    <XAxis type="number" />
                    <YAxis dataKey="pieceName" type="category" width={100} tick={{fontSize: 12, fill: '#6b7280'}} />
                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="totalQuantity" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-400">No consumption data available</div>
            )}
          </div>
        </div>

        {/* PIE CHART OR LOW STOCK SUMMARY */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Inventory Health</h2>
            <div className="flex-1 w-full min-h-[300px] flex items-center justify-center">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={[
                                { name: 'Healthy Stock', value: overview.filter(p => !p.lowStock).length },
                                { name: 'Low Stock', value: overview.filter(p => p.lowStock).length }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                        >
                            <Cell fill="#10b981" />
                            <Cell fill="#ef4444" />
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>

      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col mt-8">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">Current Stock Overview</h2>
          <Link to="/admin/pieces" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Manage pieces &rarr;</Link>
        </div>
        <div className="overflow-x-auto flex-1">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ref</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {overview.slice(0, 5).map((item) => (
                <tr key={item.pieceId} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.reference}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-bold">{item.currentStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${item.lowStock ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {item.lowStock ? "CRITICAL" : "HEALTHY"}
                    </span>
                  </td>
                </tr>
              ))}
              {overview.length === 0 && (
                  <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No inventory found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, color = "indigo" }) {
    const colorClasses = {
        blue: "text-blue-600",
        emerald: "text-emerald-600",
        red: "text-red-600",
        indigo: "text-indigo-600",
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center transition-all hover:shadow-md hover:-translate-y-1 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-2 h-full bg-${color}-500 opacity-0 group-hover:opacity-100 transition-opacity`} />
            <h4 className="text-sm font-medium text-gray-500 mb-2">{title}</h4>
            <div className="flex items-baseline space-x-2">
                <h2 className={`text-3xl font-bold tracking-tight ${colorClasses[color]}`}>{value}</h2>
            </div>
        </div>
    );
}