import { useState, useEffect } from "react";
import axios from "axios";
import { getToken, logout } from "../../auth/auth";
import { useNavigate } from "react-router-dom";

const PIECES_API = "http://localhost:8080/api/pieces";
const REQUESTS_API = "http://localhost:8080/api/requests";

export default function WorkshopDashboard() {
  const navigate = useNavigate();
  const [pieces, setPieces] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [search, setSearch] = useState("");
  
  const [requestModal, setRequestModal] = useState({ open: false, piece: null, quantity: 1 });

  const headers = { Authorization: `Bearer ${getToken()}` };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [piecesRes, requestsRes] = await Promise.all([
        axios.get(PIECES_API, { headers }),
        axios.get(`${REQUESTS_API}/my`, { headers })
      ]);
      setPieces(piecesRes.data);
      setMyRequests(requestsRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
      logout();
      navigate("/login");
  };

  const submitRequest = async (e) => {
      e.preventDefault();
      try {
          await axios.post(REQUESTS_API, null, {
              headers,
              params: {
                  pieceId: requestModal.piece.id,
                  quantity: requestModal.quantity
              }
          });
          alert("Request submitted successfully!");
          setRequestModal({ open: false, piece: null, quantity: 1 });
          loadData();
      } catch(err) {
          alert("Failed to submit request");
      }
  };

  const filteredPieces = pieces.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.reference.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <h1 className="text-xl font-bold tracking-wider text-indigo-400">StockAI Workshop</h1>
              <button onClick={handleLogout} className="text-slate-300 hover:text-white font-medium text-sm transition-colors">
                  Logout
              </button>
          </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
          
          {/* Active Requests Tracker */}
          <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">My Recent Requests</h2>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                          <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Part</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                          {myRequests.slice().reverse().map(req => (
                              <tr key={req.id}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(req.requestDate).toLocaleDateString()}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.piece.name} <span className="text-gray-400 text-xs ml-1">({req.piece.reference})</span></td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">{req.quantity}</td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                          req.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                          req.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                          'bg-yellow-100 text-yellow-800'
                                      }`}>
                                          {req.status}
                                      </span>
                                  </td>
                              </tr>
                          ))}
                          {myRequests.length === 0 && (
                              <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">You haven't made any requests yet.</td></tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </section>

          {/* Parts Catalog */}
          <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Parts Catalog</h2>
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Search parts..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 w-64 text-sm"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPieces.map(piece => (
                      <div key={piece.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                          <div>
                              <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-bold text-gray-900 leading-tight">{piece.name}</h3>
                                  <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">{piece.reference}</span>
                              </div>
                              <p className="text-sm text-gray-500 mb-4">{piece.category}</p>
                          </div>
                          <button 
                              onClick={() => setRequestModal({ open: true, piece, quantity: 1 })}
                              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                          >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                              Request Part
                          </button>
                      </div>
                  ))}
                  {filteredPieces.length === 0 && (
                      <div className="col-span-full py-12 text-center text-gray-500">No parts found matching your search.</div>
                  )}
              </div>
          </section>

      </main>

      {/* Request Modal */}
      {requestModal.open && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                  <div className="bg-indigo-600 px-6 py-4">
                      <h3 className="text-lg font-bold text-white">Request Part</h3>
                  </div>
                  <form onSubmit={submitRequest} className="p-6">
                      <div className="mb-6">
                          <p className="text-sm text-gray-500 mb-1">Part Name</p>
                          <p className="font-semibold text-gray-900">{requestModal.piece.name} ({requestModal.piece.reference})</p>
                      </div>
                      <div className="mb-8">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Quantity Needed</label>
                          <input 
                              type="number" 
                              min="1" 
                              required 
                              value={requestModal.quantity}
                              onChange={e => setRequestModal({...requestModal, quantity: parseInt(e.target.value) || 1})}
                              className="w-full border border-gray-300 rounded-lg p-3 text-lg focus:ring-indigo-500 focus:border-indigo-500"
                          />
                      </div>
                      <div className="flex justify-end gap-3">
                          <button type="button" onClick={() => setRequestModal({open:false, piece:null, quantity:1})} className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                          <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm">Submit Request</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}