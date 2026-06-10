import { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../../auth/auth";
import useTablePagination from "../../hooks/useTablePagination";
import TableSearch from "../../components/ui/TableSearch";
import TablePagination from "../../components/ui/TablePagination";

const API = "http://localhost:8080/api/suppliers";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contactEmail: "",
    phone: "",
    reliabilityScore: 100,
    averageLeadTimeDays: 7
  });

  const {
      currentData: paginatedSuppliers,
      searchQuery,
      setSearchQuery,
      currentPage,
      setCurrentPage,
      totalPages,
      rowsPerPage,
      setRowsPerPage,
      totalElements
  } = useTablePagination(suppliers, ['name', 'contactEmail', 'phone'], 10);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setSuppliers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API, formData, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setIsModalOpen(false);
      setFormData({ name: "", contactEmail: "", phone: "", reliabilityScore: 100, averageLeadTimeDays: 7 });
      loadSuppliers();
    } catch (err) {
      alert("Failed to create supplier");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Suppliers Hub</h1>
            <p className="text-gray-500 text-sm mt-1">Manage vendor relationships and supply chains.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#0055A5] hover:bg-[#004080] text-white px-4 py-2 rounded-md shadow-sm font-medium transition-colors"
        >
          + Add Supplier
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <TableSearch 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            placeholder="Search suppliers by name, email, or phone..."
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
        />
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Lead Time</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reliability</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedSuppliers.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{s.contactEmail}</div>
                    <div className="text-xs text-gray-400">{s.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        s.averageLeadTimeDays <= 3 ? 'bg-green-100 text-green-800' :
                        s.averageLeadTimeDays <= 7 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                        {s.averageLeadTimeDays} days
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
                        <div className={`h-2.5 rounded-full ${s.reliabilityScore >= 90 ? 'bg-green-500' : s.reliabilityScore >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${s.reliabilityScore}%` }}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{s.reliabilityScore}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <button className="text-[#0055A5] hover:text-indigo-900">Edit</button>
                </td>
              </tr>
            ))}
            {paginatedSuppliers.length === 0 && (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No suppliers found matching your search.</td></tr>
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Supplier</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input required type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-[#0055A5] focus:border-[#0055A5] sm:text-sm" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input required type="email" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-[#0055A5] focus:border-[#0055A5] sm:text-sm" value={formData.contactEmail} onChange={(e) => setFormData({...formData, contactEmail: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-[#0055A5] focus:border-[#0055A5] sm:text-sm" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Avg Lead Time (Days)</label>
                    <input required type="number" min="1" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-[#0055A5] focus:border-[#0055A5] sm:text-sm" value={formData.averageLeadTimeDays} onChange={(e) => setFormData({...formData, averageLeadTimeDays: parseInt(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Reliability (%)</label>
                    <input required type="number" min="0" max="100" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-[#0055A5] focus:border-[#0055A5] sm:text-sm" value={formData.reliabilityScore} onChange={(e) => setFormData({...formData, reliabilityScore: parseFloat(e.target.value)})} />
                  </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#0055A5] text-white rounded-md hover:bg-[#004080] transition-colors shadow-sm">Save Supplier</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
