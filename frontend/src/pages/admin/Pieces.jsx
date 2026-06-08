import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../../auth/auth";

const API = "http://localhost:8080/api/pieces";

export default function Pieces() {
  const [pieces, setPieces] = useState([]);
  const [editId, setEditId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [form, setForm] = useState({
    reference: "",
    name: "",
    category: "",
    criticality: "LOW",
    minimumStock: 0,
  });

  const headers = { Authorization: `Bearer ${getToken()}` };

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await axios.get(API, { headers });
      setPieces(res.data);
    } catch (e) {
        console.error("Failed to load pieces", e);
    }
  };

  const create = async (e) => {
    e.preventDefault();
    await axios.post(API, form, { headers });
    resetForm();
    load();
  };

  const remove = async (id) => {
    if(window.confirm("Delete this piece? This action cannot be undone.")) {
        await axios.delete(`${API}/${id}`, { headers });
        load();
    }
  };

  const startEdit = (p) => {
    setEditId(p.id);
    setForm({
      reference: p.reference,
      name: p.name,
      category: p.category,
      criticality: p.criticality,
      minimumStock: p.minimumStock,
    });
    setIsFormOpen(true);
  };

  const update = async (e) => {
    e.preventDefault();
    await axios.put(`${API}/${editId}`, form, { headers });
    resetForm();
    load();
  };

  const resetForm = () => {
    setEditId(null);
    setForm({
      reference: "",
      name: "",
      category: "",
      criticality: "LOW",
      minimumStock: 0,
    });
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Directory</h1>
            <p className="text-gray-500 text-sm mt-1">Manage physical components, minimum thresholds, and criticality.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsFormOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow-sm font-medium transition-colors"
        >
          + Add Component
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reference</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Min Stock</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Criticality</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pieces.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{p.reference}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="font-medium text-gray-900">{p.name}</div>
                    <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">{p.minimumStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        p.criticality === 'HIGH' ? 'bg-red-100 text-red-800' : 
                        p.criticality === 'MEDIUM' ? 'bg-orange-100 text-orange-800' : 
                        'bg-blue-100 text-blue-800'
                    }`}>
                      {p.criticality}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button onClick={() => startEdit(p)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                    <button onClick={() => remove(p.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
              {pieces.length === 0 && (
                <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        No inventory pieces found.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{editId ? "Edit Component" : "Add Component"}</h2>
            <form onSubmit={editId ? update : create} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Reference / SKU</label>
                <input required type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={form.reference} onChange={e => setForm({...form, reference: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input required type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input required type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Min Stock</label>
                    <input required type="number" min="0" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={form.minimumStock} onChange={e => setForm({...form, minimumStock: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Criticality</label>
                    <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={form.criticality} onChange={e => setForm({...form, criticality: e.target.value})}>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                    </select>
                  </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={resetForm} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm">{editId ? "Update" : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}