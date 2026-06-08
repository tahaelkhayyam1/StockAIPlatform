import { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../../auth/auth";

const PIECES_API = "http://localhost:8080/api/pieces";
const STOCK_API = "http://localhost:8080/api/stock";

export default function StockEntry() {
  const [pieces, setPieces] = useState([]);
  const [form, setForm] = useState({
    pieceId: "",
    quantity: 1,
    reason: "Supplier Delivery"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const headers = { Authorization: `Bearer ${getToken()}` };

  useEffect(() => {
    loadPieces();
  }, []);

  const loadPieces = async () => {
    try {
      const res = await axios.get(PIECES_API, { headers });
      setPieces(res.data);
      if(res.data.length > 0) {
          setForm(f => ({ ...f, pieceId: res.data[0].id }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!form.pieceId || form.quantity <= 0) return;
    setIsSubmitting(true);
    
    try {
      await axios.post(`${STOCK_API}/entry`, null, {
          headers,
          params: {
              pieceId: form.pieceId,
              quantity: form.quantity,
              reason: form.reason
          }
      });
      alert("Stock added successfully!");
      setForm({ ...form, quantity: 1, reason: "Supplier Delivery" });
    } catch (e) {
      alert("Failed to add stock.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Receive Stock</h1>
        <p className="text-gray-500 text-sm mt-1">Record physical inventory deliveries from suppliers.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Component</label>
                <select 
                    required 
                    value={form.pieceId} 
                    onChange={e => setForm({...form, pieceId: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                >
                    {pieces.map(p => (
                        <option key={p.id} value={p.id}>[{p.reference}] {p.name}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity Received</label>
                    <input 
                        required 
                        type="number" 
                        min="1" 
                        value={form.quantity} 
                        onChange={e => setForm({...form, quantity: parseInt(e.target.value) || 1})}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reason / Ref</label>
                    <input 
                        required 
                        type="text" 
                        value={form.reason} 
                        onChange={e => setForm({...form, reason: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button 
                    type="submit" 
                    disabled={isSubmitting || pieces.length === 0}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                    )}
                    Register Entry
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}
