import { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../../auth/auth";
import useTablePagination from "../../hooks/useTablePagination";
import TableSearch from "../../components/ui/TableSearch";
import TablePagination from "../../components/ui/TablePagination";

const API = "http://localhost:8080/api/audit";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const {
      currentData: paginatedLogs,
      searchQuery,
      setSearchQuery,
      currentPage,
      setCurrentPage,
      totalPages,
      rowsPerPage,
      setRowsPerPage,
      totalElements
  } = useTablePagination(logs, ['actorEmail', 'actorRole', 'action', 'details'], 15);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${getToken()}` },
        params: { size: 10000 }
      });
      setLogs(res.data.content);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">System Audit Logs</h1>
            <p className="text-gray-500 text-sm mt-1">Immutable record of all critical system actions.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <TableSearch 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            placeholder="Search logs by actor, role, action, or details..."
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
        />
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actor</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(log.timestamp)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.actorEmail}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                      {log.actorRole}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#0055A5]">{log.action}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{log.details}</td>
              </tr>
            ))}
            {paginatedLogs.length === 0 && (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No audit logs found matching your search.</td></tr>
            )}
          </tbody>
        </table>
        </div>

        <TablePagination 
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            totalElements={totalElements}
        />
      </div>
    </div>
  );
}
