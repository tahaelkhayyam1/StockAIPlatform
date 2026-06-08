import { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../../auth/auth";
import { useLocation } from "react-router-dom";
import ConfirmModal from "../../components/ui/ConfirmModal";
import ToastNotification from "../../components/ui/ToastNotification";

const API_ORDERS = "http://localhost:8080/api/orders";
const API_PIECES = "http://localhost:8080/api/pieces";
const API_SUPPLIERS = "http://localhost:8080/api/suppliers";

export default function SupplierOrders() {
  const [orders, setOrders] = useState([]);
  const [pieces, setPieces] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    pieceId: "",
    supplierId: "",
    quantity: 1,
    isDevis: true // toggle for Quote vs Direct Order
  });

  // UI States
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "success" });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, payload: null });

  const location = useLocation();

  useEffect(() => {
    loadOrders();
    loadPieces();
    loadSuppliers();

    if (location.state && location.state.draftOrder) {
        const { pieceId, quantity } = location.state.draftOrder;
        setFormData(prev => ({
            ...prev,
            pieceId: pieceId || "",
            quantity: quantity || 1,
            isDevis: true // AI Recommendations default to Devis
        }));
        setIsModalOpen(true);
    }
  }, [location.state]);

  useEffect(() => {
      if (location.state && location.state.draftOrder && suppliers.length > 0) {
          const { supplierName } = location.state.draftOrder;
          if (supplierName) {
              const matchedSupplier = suppliers.find(s => s.name === supplierName);
              if (matchedSupplier) {
                  setFormData(prev => ({ ...prev, supplierId: matchedSupplier.id }));
              }
          }
      }
  }, [suppliers, location.state]);

  const loadOrders = async () => {
    try {
      const res = await axios.get(API_ORDERS, { headers: { Authorization: `Bearer ${getToken()}` } });
      setOrders(res.data);
    } catch (err) { console.error(err); }
  };

  const loadPieces = async () => {
    try {
      const res = await axios.get(API_PIECES, { headers: { Authorization: `Bearer ${getToken()}` } });
      setPieces(res.data);
    } catch (err) { console.error(err); }
  };

  const loadSuppliers = async () => {
    try {
      const res = await axios.get(API_SUPPLIERS, { headers: { Authorization: `Bearer ${getToken()}` } });
      setSuppliers(res.data);
    } catch (err) { console.error(err); }
  };

  const showToast = (message, type = "success") => {
      setToast({ isOpen: true, message, type });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_ORDERS, {
          piece: { id: formData.pieceId },
          supplier: { id: formData.supplierId },
          quantity: formData.quantity,
          status: formData.isDevis ? 'DEVIS_REQUESTED' : 'ORDER_SENT'
      }, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setIsModalOpen(false);
      setFormData({ pieceId: "", supplierId: "", quantity: 1, isDevis: true });
      loadOrders();
      showToast(formData.isDevis ? "Quote (Devis) requested successfully!" : "Purchase Order sent successfully!", "success");
    } catch (err) {
      showToast("Failed to create request", "error");
    }
  };

  const executeStatusChange = async (id, status) => {
      try {
          await axios.put(`${API_ORDERS}/${id}/status?status=${status}`, {}, {
              headers: { Authorization: `Bearer ${getToken()}` }
          });
          loadOrders();
          showToast(`Status updated to ${status.replace('_', ' ')}`, "success");
      } catch (err) {
          showToast("Failed to update status", "error");
      }
  };

  const handleStatusChangeClick = (id, status) => {
      if (status === 'RECEIVED') {
          setConfirmModal({
              isOpen: true,
              payload: { id, status }
          });
      } else {
          executeStatusChange(id, status);
      }
  };

  const confirmReceive = () => {
      if (confirmModal.payload) {
          executeStatusChange(confirmModal.payload.id, confirmModal.payload.status);
      }
      setConfirmModal({ isOpen: false, payload: null });
  };

  const formatDate = (dateString) => {
      if (!dateString) return "-";
      return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status) => {
      const config = {
          'DEVIS_REQUESTED': { color: 'bg-orange-100 text-orange-800', label: 'Quote Requested' },
          'DEVIS_RECEIVED': { color: 'bg-teal-100 text-teal-800', label: 'Quote Received' },
          'ORDER_SENT': { color: 'bg-blue-100 text-blue-800', label: 'Order Sent' },
          'RECEIVED': { color: 'bg-green-100 text-green-800', label: 'Stock Received' },
          'CANCELLED': { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
      };
      const cfg = config[status] || { color: 'bg-gray-100 text-gray-800', label: status };
      return <span className={`px-2.5 py-1 text-xs font-bold rounded-full border border-black/5 shadow-sm ${cfg.color}`}>{cfg.label}</span>;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <ToastNotification 
          isOpen={toast.isOpen} 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(prev => ({...prev, isOpen: false}))} 
      />

      <ConfirmModal
          isOpen={confirmModal.isOpen}
          title="Receive Stock"
          message="Marking this order as RECEIVED will automatically inject the ordered quantity into your active inventory. Are you sure you want to proceed?"
          confirmText="Yes, Receive Stock"
          cancelText="Cancel"
          isDanger={true}
          onConfirm={confirmReceive}
          onCancel={() => setConfirmModal({ isOpen: false, payload: null })}
      />

      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quotes & Orders</h1>
            <p className="text-gray-500 text-sm mt-1">Manage supplier quotes (devis) and formal purchase orders.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-sm font-medium transition-all hover:shadow-md"
        >
          + New Request
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Supplier</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Item & Qty</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">REQ-{String(o.id).padStart(4, '0')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(o.orderDate)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{o.supplier?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <span className="font-bold text-gray-900">{o.quantity}x</span> {o.piece?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(o.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  {o.status === 'DEVIS_REQUESTED' && (
                      <button onClick={() => handleStatusChangeClick(o.id, 'DEVIS_RECEIVED')} className="text-teal-600 hover:text-teal-900 bg-teal-50 px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-all">Mark Quoted</button>
                  )}
                  {(o.status === 'DEVIS_REQUESTED' || o.status === 'DEVIS_RECEIVED') && (
                      <button onClick={() => handleStatusChangeClick(o.id, 'ORDER_SENT')} className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-all">Place Order</button>
                  )}
                  {o.status === 'ORDER_SENT' && (
                      <button onClick={() => handleStatusChangeClick(o.id, 'RECEIVED')} className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-all">Receive Stock</button>
                  )}
                  {o.status !== 'RECEIVED' && o.status !== 'CANCELLED' && (
                      <button onClick={() => handleStatusChangeClick(o.id, 'CANCELLED')} className="text-gray-400 hover:text-red-600 transition-colors">✕</button>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">No requests found. Create a Quote or Order to begin.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">New Supplier Request</h2>
            <form onSubmit={handleCreate} className="space-y-5">
              
              {/* Type Toggle */}
              <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button type="button" onClick={() => setFormData({...formData, isDevis: true})} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${formData.isDevis ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Request Quote (Devis)</button>
                  <button type="button" onClick={() => setFormData({...formData, isDevis: false})} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${!formData.isDevis ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Direct Order</button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Piece</label>
                <select required className="block w-full border-gray-300 bg-gray-50 rounded-xl shadow-sm py-2.5 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors" 
                        value={formData.pieceId} onChange={(e) => setFormData({...formData, pieceId: e.target.value})}>
                    <option value="">Select a Piece</option>
                    {pieces.map(p => <option key={p.id} value={p.id}>{p.name} ({p.reference})</option>)}
                </select>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Supplier</label>
                    <select required className="block w-full border-gray-300 bg-gray-50 rounded-xl shadow-sm py-2.5 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors" 
                            value={formData.supplierId} onChange={(e) => setFormData({...formData, supplierId: e.target.value})}>
                        <option value="">Select</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity</label>
                    <input required type="number" min="1" className="block w-full border-gray-300 bg-gray-50 rounded-xl shadow-sm py-2.5 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors" 
                           value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})} />
                  </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-600/20 active:scale-95">
                    {formData.isDevis ? 'Request Quote' : 'Place Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
