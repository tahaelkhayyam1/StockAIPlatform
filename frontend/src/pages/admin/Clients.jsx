import { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../../auth/auth";

const API = "http://localhost:8080/api/clients";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", company: "", address: "" });
  
  const headers = { Authorization: `Bearer ${getToken()}` };

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(API, { headers });
      setClients(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API}/${editingId}`, formData, { headers });
      } else {
        await axios.post(API, formData, { headers });
      }
      setShowModal(false);
      setFormData({ name: "", email: "", phone: "", company: "", address: "" });
      setEditingId(null);
      loadClients();
    } catch (err) {
      alert("Failed to save client");
    }
  };

  const openEdit = (client) => {
    setFormData(client);
    setEditingId(client.id);
    setShowModal(true);
  };

  const deleteClient = async (id) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
        try {
            await axios.delete(`${API}/${id}`, { headers });
            loadClients();
        } catch (err) {
            alert("Failed to delete client. They might have existing orders.");
        }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-500 text-sm mt-1">Manage external clients and companies.</p>
        </div>
        <button 
            onClick={() => { setShowModal(true); setEditingId(null); setFormData({ name: "", email: "", phone: "", company: "", address: "" }); }} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-sm"
        >
            + Add Client
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-600 font-medium">
                <th className="p-4">Name</th>
                <th className="p-4">Company</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">{c.name}</td>
                      <td className="p-4 text-gray-600">{c.company || "-"}</td>
                      <td className="p-4 text-gray-600">{c.email || "-"}</td>
                      <td className="p-4 text-gray-600">{c.phone || "-"}</td>
                      <td className="p-4 text-right space-x-3">
                          <button onClick={() => openEdit(c)} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">Edit</button>
                          <button onClick={() => deleteClient(c.id)} className="text-red-600 hover:text-red-800 font-medium text-sm">Delete</button>
                      </td>
                  </tr>
              ))}
              {clients.length === 0 && !isLoading && (
                  <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500">No clients found.</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{editingId ? 'Edit Client' : 'Add New Client'}</h3>
                  <form onSubmit={handleSave} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                          <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                          <input type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                          <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" rows="2"></textarea>
                      </div>
                      
                      <div className="flex justify-end gap-3 pt-4">
                          <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
                          <button type="submit" className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Save Client</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}
