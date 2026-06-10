import { useState, useEffect } from "react";
import axios from "axios";
import { getToken, logout } from "../../auth/auth";
import { useNavigate } from "react-router-dom";
import useTablePagination from "../../hooks/useTablePagination";
import TableSearch from "../../components/ui/TableSearch";
import TablePagination from "../../components/ui/TablePagination";

const PIECES_API = "http://localhost:8080/api/pieces";
const REQUESTS_API = "http://localhost:8080/api/requests";

export default function WorkshopDashboard() {
  const navigate = useNavigate();
  const [pieces, setPieces] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [search, setSearch] = useState("");

  const {
      currentData: paginatedRequests,
      searchQuery: requestSearch,
      setSearchQuery: setRequestSearch,
      currentPage,
      setCurrentPage,
      totalPages,
      rowsPerPage,
      setRowsPerPage,
      totalElements
  } = useTablePagination(myRequests, ['piece.name', 'piece.reference', 'status'], 5);
  
  // Cart state: Array of { piece, quantity }
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detail Modal state
  const [selectedPiece, setSelectedPiece] = useState(null);

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

  // Cart Functions
  const addToCart = (piece, e) => {
      e.stopPropagation();
      setCart(prev => {
          const existing = prev.find(item => item.piece.id === piece.id);
          if (existing) {
              return prev.map(item => item.piece.id === piece.id ? { ...item, quantity: item.quantity + 1 } : item);
          }
          return [...prev, { piece, quantity: 1 }];
      });
  };

  const removeFromCart = (pieceId) => {
      setCart(prev => prev.filter(item => item.piece.id !== pieceId));
  };

  const updateCartQuantity = (pieceId, qty) => {
      if (qty < 1) return;
      setCart(prev => prev.map(item => item.piece.id === pieceId ? { ...item, quantity: qty } : item));
  };

  const submitCartRequests = async () => {
      if (cart.length === 0) return;
      setIsSubmitting(true);
      try {
          // Submit all requests in parallel
          await Promise.all(cart.map(item => 
              axios.post(REQUESTS_API, null, {
                  headers,
                  params: { pieceId: item.piece.id, quantity: item.quantity }
              })
          ));
          setCart([]);
          setIsCartOpen(false);
          loadData();
          // Ideally use a Toast here, but alert works for now
          alert("All parts requested successfully!");
      } catch(err) {
          alert("Failed to submit some requests. Please check your history.");
      } finally {
          setIsSubmitting(false);
      }
  };

  const filteredPieces = pieces.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.reference.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md text-gray-900 border-b border-gray-200 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <div className="bg-[#0055A5] text-white p-1.5 rounded-lg shadow-sm">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </div>
                  <h1 className="text-xl font-bold tracking-tight">Workshop Portal</h1>
              </div>
              <div className="flex items-center gap-6">
                  <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-gray-500 hover:text-[#0055A5] transition-colors group">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                      {cart.length > 0 && (
                          <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
                              {cart.length}
                          </span>
                      )}
                  </button>
                  <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 font-medium text-sm transition-colors">
                      Logout
                  </button>
              </div>
          </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-10">
          
          {/* Parts Catalog */}
          <section>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Parts Catalog</h2>
                    <p className="text-sm text-gray-500 mt-1">Browse and request parts for your service bay.</p>
                </div>
                <div className="relative w-full md:w-auto">
                    <input 
                        type="text" 
                        placeholder="Search by name, SKU, or category..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-11 pr-4 py-2.5 border-gray-300 bg-white rounded-xl shadow-sm focus:ring-2 focus:ring-[#0055A5] focus:border-[#0055A5] w-full md:w-80 text-sm transition-all"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-4 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredPieces.map(piece => (
                      <div 
                        key={piece.id} 
                        onClick={() => setSelectedPiece(piece)}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-xl hover:border-indigo-100 transition-all cursor-pointer group"
                      >
                          {/* Image Thumbnail */}
                          <div className="h-48 bg-gray-50 relative overflow-hidden flex items-center justify-center border-b border-gray-50">
                              {piece.imageUrl ? (
                                  <img src={piece.imageUrl} alt={piece.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              ) : (
                                  <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                              )}
                              <div className="absolute top-3 left-3">
                                  <span className="bg-white/90 backdrop-blur text-gray-800 text-xs font-bold px-2 py-1 rounded-md shadow-sm border border-black/5">
                                      {piece.category}
                                  </span>
                              </div>
                          </div>
                          
                          {/* Details */}
                          <div className="p-5 flex-1 flex flex-col justify-between">
                              <div>
                                  <div className="text-xs font-mono text-indigo-500 mb-1">{piece.reference}</div>
                                  <h3 className="font-bold text-gray-900 leading-tight mb-2 line-clamp-2">{piece.name}</h3>
                              </div>
                              <button 
                                  onClick={(e) => addToCart(piece, e)}
                                  className="w-full mt-4 bg-gray-50 hover:bg-[#0055A5] text-gray-700 hover:text-white font-semibold py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2 border border-gray-200 hover:border-[#0055A5] active:scale-95"
                              >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                  Add to Request
                              </button>
                          </div>
                      </div>
                  ))}
                  {filteredPieces.length === 0 && (
                      <div className="col-span-full py-20 text-center text-gray-500">
                          <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          No parts found matching your search.
                      </div>
                  )}
              </div>
          </section>

          {/* Active Requests Tracker */}
          <section className="pt-8 border-t border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">Request History</h2>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <TableSearch 
                      searchQuery={requestSearch} 
                      setSearchQuery={setRequestSearch} 
                      placeholder="Search history by part name, ref, or status..."
                      rowsPerPage={rowsPerPage}
                      setRowsPerPage={setRowsPerPage}
                  />
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Part</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">Quantity</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {paginatedRequests.map(req => (
                                <tr key={req.id} className="hover:bg-gray-50/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(req.requestDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{req.piece.name} <span className="text-gray-400 font-normal ml-1">({req.piece.reference})</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">{req.quantity}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${
                                            req.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                                            req.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                                            'bg-yellow-50 text-yellow-700 border-yellow-200'
                                        }`}>
                                            {req.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {paginatedRequests.length === 0 && (
                                <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500">No requests found.</td></tr>
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
          </section>

      </main>

      {/* Part Details Modal (Entity Viewer) */}
      {selectedPiece && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={() => setSelectedPiece(null)}>
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                  
                  {/* Left Side: Image */}
                  <div className="md:w-1/2 bg-gray-50 relative flex items-center justify-center min-h-[300px]">
                      {selectedPiece.imageUrl ? (
                          <img src={selectedPiece.imageUrl} alt={selectedPiece.name} className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                          <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      )}
                      <button onClick={() => setSelectedPiece(null)} className="absolute top-4 left-4 md:hidden bg-white/50 backdrop-blur p-2 rounded-full text-gray-800">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                  </div>

                  {/* Right Side: Details & QR */}
                  <div className="md:w-1/2 p-8 flex flex-col">
                      <div className="flex justify-between items-start mb-6">
                          <div>
                              <div className="text-sm font-mono text-[#0055A5] mb-1 font-semibold">{selectedPiece.reference}</div>
                              <h3 className="text-2xl font-bold text-gray-900 leading-tight">{selectedPiece.name}</h3>
                              <span className="inline-block mt-2 bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-1 rounded-md border border-gray-200">
                                  {selectedPiece.category}
                              </span>
                          </div>
                          <button onClick={() => setSelectedPiece(null)} className="hidden md:block text-gray-400 hover:text-gray-900 transition-colors">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                          </button>
                      </div>

                      <div className="prose prose-sm text-gray-600 mb-8 flex-1">
                          <p>{selectedPiece.description || "No description provided for this catalog item."}</p>
                      </div>

                      <div className="mt-auto border-t border-gray-100 pt-6 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                              <div className="w-20 h-20 bg-white p-1 border border-gray-200 rounded-lg shadow-sm">
                                  {selectedPiece.barcode ? (
                                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(selectedPiece.barcode)}`} alt="QR Code" className="w-full h-full object-contain" />
                                  ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-gray-50 text-[10px] text-center text-gray-400">No Barcode</div>
                                  )}
                              </div>
                              <div className="text-xs">
                                  <p className="text-gray-500 uppercase tracking-wider font-semibold mb-0.5">Scan Code</p>
                                  <p className="font-mono text-gray-900 font-bold">{selectedPiece.barcode || "N/A"}</p>
                              </div>
                          </div>

                          <button 
                              onClick={(e) => { addToCart(selectedPiece, e); setSelectedPiece(null); }}
                              className="bg-[#0055A5] hover:bg-[#004080] text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-sm shadow-indigo-600/20 active:scale-95 flex items-center gap-2"
                          >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                              Add
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Shopping Cart Slide-Over Panel */}
      {isCartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
              {/* Backdrop */}
              <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsCartOpen(false)}></div>
              
              {/* Panel */}
              <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-gray-200">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                          <svg className="w-6 h-6 text-[#0055A5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                          Request Cart
                      </h2>
                      <button onClick={() => setIsCartOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      {cart.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
                              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                                  <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                              </div>
                              <p className="text-lg font-medium">Your cart is empty</p>
                              <p className="text-sm">Browse the catalog to add parts.</p>
                              <button onClick={() => setIsCartOpen(false)} className="mt-4 px-6 py-2.5 bg-indigo-50 text-[#0055A5] font-medium rounded-xl hover:bg-indigo-100 transition-colors">Start Browsing</button>
                          </div>
                      ) : (
                          cart.map((item) => (
                              <div key={item.piece.id} className="flex gap-4 p-4 rounded-2xl border border-gray-100 bg-white shadow-sm hover:border-indigo-100 transition-colors">
                                  <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                                      {item.piece.imageUrl ? (
                                          <img src={item.piece.imageUrl} alt={item.piece.name} className="w-full h-full object-cover" />
                                      ) : (
                                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                          </div>
                                      )}
                                  </div>
                                  <div className="flex-1 flex flex-col justify-between">
                                      <div>
                                          <h4 className="font-bold text-gray-900 leading-tight mb-1">{item.piece.name}</h4>
                                          <p className="text-xs font-mono text-gray-500">{item.piece.reference}</p>
                                      </div>
                                      <div className="flex items-center justify-between mt-3">
                                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-8">
                                              <button onClick={() => updateCartQuantity(item.piece.id, item.quantity - 1)} className="px-2.5 h-full bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors border-r border-gray-200">-</button>
                                              <span className="px-3 text-sm font-bold w-10 text-center">{item.quantity}</span>
                                              <button onClick={() => updateCartQuantity(item.piece.id, item.quantity + 1)} className="px-2.5 h-full bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors border-l border-gray-200">+</button>
                                          </div>
                                          <button onClick={() => removeFromCart(item.piece.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors" title="Remove">
                                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>

                  {cart.length > 0 && (
                      <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                          <div className="flex justify-between items-center mb-4 text-sm">
                              <span className="text-gray-500 font-medium">Total Items</span>
                              <span className="font-bold text-gray-900">{cart.reduce((acc, item) => acc + item.quantity, 0)}</span>
                          </div>
                          <button 
                              onClick={submitCartRequests} 
                              disabled={isSubmitting}
                              className={`w-full py-3.5 rounded-xl font-bold text-white shadow-sm transition-all flex justify-center items-center gap-2 ${isSubmitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-[#0055A5] hover:bg-[#004080] shadow-indigo-600/20 active:scale-95'}`}
                          >
                              {isSubmitting ? (
                                  <>
                                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                      Submitting...
                                  </>
                              ) : (
                                  <>Submit All Requests</>
                              )}
                          </button>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
}