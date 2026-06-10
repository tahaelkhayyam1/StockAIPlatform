import { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../../auth/auth";

const API = "http://localhost:8080/api/superadmin/reset-requests";

export default function SuperAdminSupport() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const headers = { Authorization: `Bearer ${getToken()}` };

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(API, { headers });
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const resolveRequest = async (id) => {
      if(window.confirm("Generate a new temporary password and email it to the user?")) {
          try {
              await axios.post(`${API}/${id}/resolve`, {}, { headers });
              alert("Password reset successfully. Email sent.");
              loadRequests();
          } catch(e) {
              alert("Failed to resolve request.");
          }
      }
  }

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const resolvedRequests = requests.filter(r => r.status === 'RESOLVED');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Support Requests</h1>
        <p className="text-gray-500 text-sm mt-1">Manage password reset requests from users.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Pending Requests ({pendingRequests.length})</h2>
            <button onClick={loadRequests} className="text-sm text-[#0055A5] hover:text-indigo-800">Refresh</button>
        </div>
        <div className="divide-y divide-gray-100">
          {pendingRequests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No pending requests.</div>
          ) : (
            pendingRequests.map(req => (
              <div key={req.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mb-2">
                        PENDING
                    </span>
                    <p className="text-sm font-medium text-gray-900">{req.email}</p>
                    <p className="text-xs text-gray-500 mt-1">Requested: {new Date(req.requestDate).toLocaleString()}</p>
                </div>
                <div>
                    <button 
                        onClick={() => resolveRequest(req.id)}
                        className="bg-[#0055A5] hover:bg-[#004080] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        Resolve & Reset Password
                    </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden opacity-75">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-800">Recently Resolved</h2>
        </div>
        <div className="divide-y divide-gray-100">
            {resolvedRequests.slice(0, 10).map(req => (
                <div key={req.id} className="p-4 px-6 flex items-center justify-between">
                    <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-1">
                            RESOLVED
                        </span>
                        <p className="text-sm text-gray-600">{req.email}</p>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(req.requestDate).toLocaleDateString()}</span>
                </div>
            ))}
        </div>
      </div>

    </div>
  );
}
