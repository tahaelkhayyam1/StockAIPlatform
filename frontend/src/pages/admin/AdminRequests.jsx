import { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../../auth/auth";

const API = "http://localhost:8080/api/requests";

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const headers = { Authorization: `Bearer ${getToken()}` };

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API}/pending`, { headers });
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    if (action === 'approve' && !window.confirm("Approve this request? This will deduct stock!")) return;
    
    try {
      await axios.post(`${API}/${id}/${action}`, {}, { headers });
      loadRequests();
    } catch (e) {
      alert(`Failed to ${action} request`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Workshop Requests</h1>
            <p className="text-gray-500 text-sm mt-1">Pending part requests from workshop mechanics.</p>
        </div>
        <button onClick={loadRequests} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center">
            <svg className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            Refresh
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {requests.map(req => (
            <div key={req.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      PENDING
                    </span>
                    <span className="text-xs text-gray-500">{new Date(req.requestDate).toLocaleDateString()}</span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-1">{req.piece.name}</h3>
                <div className="text-sm text-gray-500 mb-4 flex justify-between">
                    <span>Ref: {req.piece.reference}</span>
                    <span className="font-semibold text-indigo-600 text-lg">Qty: {req.quantity}</span>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-6">
                    <p className="text-xs text-gray-500 mb-1">Requested by Mechanic:</p>
                    <p className="text-sm font-medium text-gray-900">{req.requestedBy.email}</p>
                </div>

                <div className="flex gap-3">
                    <button onClick={() => handleAction(req.id, 'reject')} className="flex-1 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm">
                        Reject
                    </button>
                    <button onClick={() => handleAction(req.id, 'approve')} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm shadow-sm">
                        Approve
                    </button>
                </div>
            </div>
        ))}
        {requests.length === 0 && (
            <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No Pending Requests</h3>
                <p className="text-gray-500">All workshop requests have been processed.</p>
            </div>
        )}
      </div>
    </div>
  );
}
