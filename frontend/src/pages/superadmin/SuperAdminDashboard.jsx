import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { getToken } from "../../auth/auth";
import {
  PieChart, Pie, Cell, Tooltip as PieTooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as BarTooltip
} from "recharts";

const API = "http://localhost:8080/api";

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWorkshops: 0,
    totalSuppliers: 0,
    totalStockMovements: 0,
    totalStockValue: 0,
    criticalPiecesCount: 0,
  });
  
  const [roleData, setRoleData] = useState([]);
  const [topConsumedData, setTopConsumedData] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };
      
      // 1. Fetch Users
      const usersRes = await axios.get(`${API}/admin/users`, { headers });
      const users = usersRes.data;
      
      const recent = [...users].sort((a, b) => b.id - a.id).slice(0, 5);
      
      const rolesCount = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});
      
      const roleChartData = Object.keys(rolesCount).map(role => ({
        name: role,
        value: rolesCount[role]
      }));

      setRoleData(roleChartData);
      setRecentUsers(recent);

      // 2. Fetch Suppliers (Entities)
      let supplierCount = 0;
      try {
          const supRes = await axios.get(`${API}/suppliers`, { headers });
          supplierCount = supRes.data.length;
      } catch (e) {
          console.warn("Could not fetch suppliers", e);
      }

      // 3. Fetch Standard KPIs
      let movements = 0;
      try {
          const kpiRes = await axios.get(`${API}/dashboard/kpis`, { headers });
          movements = kpiRes.data.totalMovements;
      } catch (e) {
          console.warn("Could not fetch standard KPIs", e);
      }

      // 4. Fetch Advanced KPIs
      let stockValue = 0;
      let criticalCount = 0;
      let topConsumedChart = [];
      try {
          const advKpiRes = await axios.get(`${API}/dashboard/advanced-kpis`, { headers });
          stockValue = advKpiRes.data.totalStockValue;
          criticalCount = advKpiRes.data.criticalPieces ? advKpiRes.data.criticalPieces.length : 0;
          
          if (advKpiRes.data.topConsumed) {
              // The API returns List<String> of piece names, we will simulate the chart data for display
              topConsumedChart = advKpiRes.data.topConsumed.map((name, index) => ({
                  name: name.length > 10 ? name.substring(0, 10) + '...' : name,
                  fullName: name,
                  usageRank: 5 - index // Simple dummy value since API only returns names
              }));
          }
      } catch (e) {
          console.warn("Could not fetch advanced KPIs", e);
      }

      setTopConsumedData(topConsumedChart);

      setStats({
        totalUsers: users.length,
        totalWorkshops: rolesCount['WORKSHOP'] || 0, // Using user roles as a proxy for workshop entities
        totalSuppliers: supplierCount,
        totalStockMovements: movements,
        totalStockValue: stockValue,
        criticalPiecesCount: criticalCount,
      });

    } catch (err) {
      console.error("Failed to load dashboard data", err);
    }
  };

  const PIE_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Platform Health Overview</h1>
      </div>

      {/* PLATFORM HEALTH CARDS */}
      <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Core Entities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card title="Total Users" value={stats.totalUsers} icon="users" color="indigo" link="/superadmin/users" />
            <Card title="Workshops (Users)" value={stats.totalWorkshops} icon="briefcase" color="yellow" link="/superadmin/users" />
            <Card title="Suppliers (Entities)" value={stats.totalSuppliers} icon="truck" color="blue" link="/superadmin/users" />
            <Card title="Stock Movements" value={stats.totalStockMovements} icon="arrow" color="emerald" link="/admin/pieces" />
          </div>
      </div>

      {/* STOCK INTELLIGENCE CARDS */}
      <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Stock Intelligence</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-center transition-all hover:shadow-md hover:-translate-y-1">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Total Stock Value</h4>
              <h2 className="text-4xl font-bold tracking-tight text-green-600">
                  ${stats.totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="bg-red-50 rounded-xl shadow-sm border border-red-200 p-6 flex flex-col justify-center transition-all hover:shadow-md hover:-translate-y-1">
              <h4 className="text-sm font-medium text-red-800 mb-1">Critical Pieces (Low Stock + High Usage)</h4>
              <h2 className="text-4xl font-bold tracking-tight text-red-600">
                  {stats.criticalPiecesCount}
              </h2>
            </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PIE CHART */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-1 flex flex-col">
          <h2 className="text-lg font-medium text-gray-900 mb-6">User Roles Distribution</h2>
          <div className="flex-1 min-h-[250px] w-full flex items-center justify-center">
            {roleData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={roleData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {roleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <PieTooltip 
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
            ) : (
                <p className="text-gray-400">No user data available</p>
            )}
          </div>
        </div>

        {/* BAR CHART: TOP CONSUMED */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2 flex flex-col">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Top Consumed Pieces (Ranked)</h2>
          <div className="flex-1 min-h-[250px] w-full flex items-center justify-center">
            {topConsumedData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={topConsumedData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} width={100} />
                    <BarTooltip 
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                      formatter={(value, name, props) => [props.payload.fullName, "Piece"]}
                    />
                    <Bar dataKey="usageRank" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
            ) : (
                <p className="text-gray-400">Not enough consumption data available</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function Card({ title, value, color = "indigo", link }) {
  const colorClasses = {
      indigo: "text-[#0055A5] bg-indigo-50 border-indigo-100",
      yellow: "text-yellow-600 bg-yellow-50 border-yellow-100",
      blue: "text-[#0055A5] bg-blue-50 border-blue-100",
      red: "text-red-600 bg-red-50 border-red-100",
      emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
  };
  const activeColor = colorClasses[color] || colorClasses.indigo;

  return (
    <Link to={link} className={`rounded-xl shadow-sm border p-6 flex flex-col justify-center transition-all hover:shadow-md hover:-translate-y-1 block ${activeColor}`}>
      <h4 className="text-sm font-medium opacity-80 mb-1">{title}</h4>
      <div className="flex items-baseline space-x-2">
         <h2 className="text-4xl font-bold tracking-tight">{value}</h2>
      </div>
    </Link>
  );
}