import { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../../auth/auth";

const API = "http://localhost:8080/api/client-devis";

export default function ClientDevis() {
  const [devis, setDevis] = useState([]);
  const [clients, setClients] = useState([]);
  const [pieces, setPieces] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ clientId: "", pieceId: "", quantity: 1, estimatedPrice: "" });
  
  const headers = { Authorization: `Bearer ${getToken()}` };

  useEffect(() => {
    loadDevis();
    loadLookups();
  }, []);

  const loadDevis = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(API, { headers });
      setDevis(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLookups = async () => {
      try {
          const [clientRes, pieceRes] = await Promise.all([
              axios.get("http://localhost:8080/api/clients", { headers }),
              axios.get("http://localhost:8080/api/pieces", { headers })
          ]);
          setClients(clientRes.data);
          setPieces(pieceRes.data);
      } catch(e) {
          console.error("Failed to load lookups", e);
      }
  };

  const handleCreate = async (e) => {
      e.preventDefault();
      try {
          await axios.post(API, formData, { headers });
          setShowModal(false);
          setFormData({ clientId: "", pieceId: "", quantity: 1, estimatedPrice: "" });
          loadDevis();
      } catch(e) {
          alert("Failed to create quote.");
      }
  };

  const handleAction = async (id, action) => {
    if (window.confirm(`Are you sure you want to ${action} this quote?`)) {
        try {
            await axios.post(`${API}/${id}/${action}`, {}, { headers });
            loadDevis();
        } catch (e) {
            alert(`Failed to ${action} quote.`);
        }
    }
  };

  const deleteDevis = async (id) => {
      if (window.confirm("Delete this quote completely?")) {
          try {
              await axios.delete(`${API}/${id}`, { headers });
              loadDevis();
          } catch(e) {
              alert("Failed to delete quote.");
          }
      }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Quotes (Devis)</h1>
            <p className="text-gray-500 text-sm mt-1">Manage price estimates for external clients.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-sm">
            + Create Quote
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {devis.map(d => (
              <div key={d.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          d.status === 'ACCEPTED' ? 'bg-green-50 text-green-700 border-green-200' :
                          d.status === 'SENT' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          d.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-gray-100 text-gray-700 border-gray-200'
                      }`}>
                          {d.status}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">#{d.id}</span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-1">{d.piece.name}</h3>
                  <div className="flex justify-between items-end mb-4">
                      <div>
                          <p className="text-xs text-gray-500">Client</p>
                          <p className="text-sm font-semibold text-gray-800">{d.client.name}</p>
                      </div>
                      <div className="text-right">
                          <p className="text-xs text-gray-500">Est. Price</p>
                          <p className="font-bold text-indigo-600 text-lg">${d.estimatedPrice}</p>
                      </div>
                  </div>

                  <div className="flex gap-2 flex-wrap mt-4 pt-4 border-t border-gray-100">
                      {d.status === 'DRAFT' && (
                          <button onClick={() => handleAction(d.id, 'send')} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">Mark Sent</button>
                      )}
                      {d.status === 'SENT' && (
                          <>
                              <button onClick={() => handleAction(d.id, 'accept')} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">Accepted</button>
                              <button onClick={() => handleAction(d.id, 'reject')} className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">Rejected</button>
                          </>
                      )}
                      {(d.status === 'REJECTED' || d.status === 'DRAFT') && (
                          <button onClick={() => deleteDevis(d.id)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors mt-2">Delete</button>
                      )}
                  </div>
              </div>
          ))}
          {devis.length === 0 && !isLoading && (
              <div className="col-span-full bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">No Quotes</h3>
                  <p className="text-gray-500 text-sm">No price estimates have been created.</p>
              </div>
          )}
      </div>

      {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Create Quote (Devis)</h3>
                  <form onSubmit={handleCreate} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
                          <select required value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                              <option value="">Select a client...</option>
                              {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.company})</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Piece (Catalog Item) *</label>
                          <select required value={formData.pieceId} onChange={e => setFormData({...formData, pieceId: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                              <option value="">Select a piece...</option>
                              {pieces.map(p => <option key={p.id} value={p.id}>{p.name} (Ref: {p.reference})</option>)}
                          </select>
                      </div>
                      <div className="flex gap-4">
                          <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                              <input required type="number" min="1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
                          </div>
                          <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Est. Price ($)</label>
                              <input type="number" step="0.01" value={formData.estimatedPrice} onChange={e => setFormData({...formData, estimatedPrice: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
                          </div>
                      </div>
                      
                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                          <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
                          <button type="submit" className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Create Quote</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

    </div>
  );
}
