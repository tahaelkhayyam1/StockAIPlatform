import { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../../auth/auth";
import useTablePagination from "../../hooks/useTablePagination";
import TableSearch from "../../components/ui/TableSearch";
import TablePagination from "../../components/ui/TablePagination";

const API = "http://localhost:8080/api/requests";

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Custom Modal States
  const [confirmModal, setConfirmModal] = useState(null); // { id: number, action: string, message: string, title: string, isDestructive: boolean }
  const [toast, setToast] = useState(null);

  const headers = { Authorization: `Bearer ${getToken()}` };

  const {
      currentData: paginatedRequests,
      searchQuery,
      setSearchQuery,
      currentPage,
      setCurrentPage,
      totalPages,
      rowsPerPage,
      setRowsPerPage,
      totalElements
  } = useTablePagination(requests, ['id', 'piece.name', 'piece.reference', 'requestedBy.email'], 12);

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

  const showToast = (message, isError = false) => {
      setToast({ message, isError });
      setTimeout(() => setToast(null), 3000);
  };

  const requestAction = (id, action) => {
      if (action === 'approve') {
          setConfirmModal({
              id, action,
              title: "Approve Request?",
              message: "This will permanently deduct the requested quantity from your available stock.",
              isDestructive: false
          });
      } else {
          setConfirmModal({
              id, action,
              title: "Reject Request?",
              message: "Are you sure you want to reject this request? The mechanic will be notified.",
              isDestructive: true
          });
      }
  };

  const confirmAction = async () => {
    if (!confirmModal) return;
    const { id, action } = confirmModal;
    setConfirmModal(null);
    
    try {
      await axios.post(`${API}/${id}/${action}`, {}, { headers });
      showToast(`Request successfully ${action}d!`);
      loadRequests();
    } catch (e) {
      showToast(`Failed to ${action} request`, true);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Toast Notification */}
      {toast && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-200">
              <div className={`px-6 py-3 rounded-xl shadow-lg border flex items-center gap-3 ${toast.isError ? 'bg-red-50 border-red-100 text-red-800' : 'bg-green-50 border-green-100 text-green-800'}`}>
                  {toast.isError ? (
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  ) : (
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  )}
                  <span className="font-semibold text-sm">{toast.message}</span>
              </div>
          </div>
      )}

      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Workshop Requests</h1>
            <p className="text-gray-500 text-sm mt-1">Pending part requests from workshop mechanics.</p>
        </div>
        <button onClick={loadRequests} className="text-[#0055A5] hover:text-indigo-800 font-medium text-sm flex items-center bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
            <svg className={`w-4 h-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
        <TableSearch 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            placeholder="Search requests by piece, reference, or mechanic..."
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {paginatedRequests.map(req => (
            <div key={req.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 shadow-sm">
                      PENDING
                    </span>
                    <span className="text-xs font-medium text-gray-500">{new Date(req.requestDate).toLocaleDateString()}</span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-1">{req.piece.name}</h3>
                <div className="text-sm text-gray-500 mb-4 flex justify-between">
                    <span className="font-mono bg-gray-50 px-1.5 rounded border border-gray-100">{req.piece.reference}</span>
                    <span className="font-bold text-[#0055A5] text-lg">Qty: {req.quantity}</span>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-6">
                    <p className="text-xs text-gray-500 mb-1">Requested by Mechanic:</p>
                    <p className="text-sm font-bold text-gray-900">{req.requestedBy.email}</p>
                </div>

                <div className="flex gap-3">
                    <button onClick={() => requestAction(req.id, 'reject')} className="flex-1 px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all font-semibold text-sm">
                        Reject
                    </button>
                    <button onClick={() => requestAction(req.id, 'approve')} className="flex-1 px-4 py-2 bg-[#0055A5] text-white rounded-xl hover:bg-[#004080] transition-all font-semibold text-sm shadow-sm shadow-indigo-600/20 active:scale-95">
                        Approve
                    </button>
                </div>
            </div>
        ))}
        {paginatedRequests.length === 0 && (
            <div className="col-span-full bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                    <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">No Pending Requests</h3>
                <p className="text-gray-500 text-sm">No requests found matching your search.</p>
            </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
          <TablePagination 
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              totalElements={totalElements}
          />
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-200">
              <div className={`mx-auto flex items-center justify-center h-14 w-14 rounded-full mb-4 ${confirmModal.isDestructive ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-[#0055A5]'}`}>
                  {confirmModal.isDestructive ? (
                      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  ) : (
                      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{confirmModal.title}</h3>
              <p className="text-sm text-gray-500 mb-8">{confirmModal.message}</p>
              <div className="flex justify-center gap-3">
                <button onClick={() => setConfirmModal(null)} className="flex-1 px-4 py-2.5 font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
                <button onClick={confirmAction} className={`flex-1 px-4 py-2.5 font-semibold text-white rounded-xl transition-colors shadow-sm ${confirmModal.isDestructive ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' : 'bg-[#0055A5] hover:bg-[#004080] shadow-indigo-600/20'}`}>
                    Yes, {confirmModal.action === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
      )}

    </div>
  );
}
