import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../../auth/auth";
import useTablePagination from "../../hooks/useTablePagination";
import TableSearch from "../../components/ui/TableSearch";
import TablePagination from "../../components/ui/TablePagination";

const API = "http://localhost:8080/api/pieces";

export default function Pieces() {
  const [pieces, setPieces] = useState([]);
  const [editId, setEditId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [viewPiece, setViewPiece] = useState(null);
  
  const [selectedFile, setSelectedFile] = useState(null);

  const [form, setForm] = useState({
    reference: "",
    name: "",
    category: "",
    criticality: "LOW",
    minimumStock: 0,
    description: "",
    imageUrl: "",
    barcode: ""
  });

  const {
      currentData: paginatedPieces,
      searchQuery,
      setSearchQuery,
      currentPage,
      setCurrentPage,
      totalPages,
      rowsPerPage,
      setRowsPerPage,
      totalElements
  } = useTablePagination(pieces, ['name', 'reference', 'category', 'barcode'], 10);

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

  const handleImageUpload = async (pieceId) => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("file", selectedFile);
    await axios.post(`${API}/${pieceId}/image`, formData, { 
      headers: { ...headers, "Content-Type": "multipart/form-data" }
    });
  };

  const create = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(API, form, { headers });
      if (selectedFile) await handleImageUpload(res.data.id);
      resetForm();
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const confirmDelete = async () => {
    if(!deleteConfirmId) return;
    try {
      await axios.delete(`${API}/${deleteConfirmId}`, { headers });
      setDeleteConfirmId(null);
      load();
    } catch(e) {
      console.error(e);
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
      description: p.description || "",
      imageUrl: p.imageUrl || "",
      barcode: p.barcode || ""
    });
    setSelectedFile(null);
    setIsFormOpen(true);
  };

  const update = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/${editId}`, form, { headers });
      if (selectedFile) await handleImageUpload(editId);
      resetForm();
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const resetForm = () => {
    setEditId(null);
    setForm({
      reference: "",
      name: "",
      category: "",
      criticality: "LOW",
      minimumStock: 0,
      description: "",
      imageUrl: "",
      barcode: ""
    });
    setSelectedFile(null);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Inventory Catalog</h1>
            <p className="text-gray-500 text-sm mt-1">Manage physical components, minimum thresholds, and catalog data.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsFormOpen(true); }}
          className="bg-[#0055A5] hover:bg-[#004080] text-white px-5 py-2.5 rounded-lg shadow-sm font-medium transition-all hover:shadow-md"
        >
          + Add Component
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <TableSearch 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            placeholder="Search pieces by name, ref, category..."
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
        />
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Barcode</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Min Stock</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Criticality</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paginatedPieces.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm flex items-center justify-center">
                            {p.imageUrl ? (
                                <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                            ) : (
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            )}
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900">{p.name}</div>
                            <div className="text-sm text-gray-500 font-mono">{p.reference}</div>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-black/5">
                        {p.category}
                      </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {p.barcode || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex flex-col items-end gap-1">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                              p.currentStock <= p.minimumStock 
                                ? 'bg-red-100 text-red-800 border border-red-200' 
                                : 'bg-green-100 text-green-800 border border-green-200'
                          }`}>
                              {p.currentStock || 0}
                          </span>
                          {p.currentStock <= p.minimumStock && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 shadow-sm animate-pulse">
                                  Reorder
                              </span>
                          )}
                      </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">{p.minimumStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border shadow-sm ${
                        p.criticality === 'HIGH' ? 'bg-red-50 text-red-700 border-red-200' : 
                        p.criticality === 'MEDIUM' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                        'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {p.criticality}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button onClick={() => setViewPiece(p)} className="text-gray-500 hover:text-gray-900 transition-colors">View</button>
                    <button onClick={() => startEdit(p)} className="text-[#0055A5] hover:text-indigo-900 transition-colors">Edit</button>
                    <button onClick={() => setDeleteConfirmId(p.id)} className="text-red-500 hover:text-red-900 transition-colors opacity-0 group-hover:opacity-100">Delete</button>
                  </td>
                </tr>
              ))}
              {paginatedPieces.length === 0 && (
                <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        No inventory pieces found matching your search.
                    </td>
                </tr>
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-200">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Piece?</h3>
              <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this piece? This action cannot be undone and will permanently remove it from the catalog.</p>
              <div className="flex justify-center gap-3">
                <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                <button onClick={confirmDelete} className="px-4 py-2 font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">Yes, Delete</button>
              </div>
            </div>
          </div>
      )}

      {/* Create / Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">{editId ? "Edit Component" : "Add Component"}</h2>
            </div>
            <form onSubmit={editId ? update : create} className="p-6 space-y-5">
              
              <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                    <input required type="text" className="block w-full border-gray-300 bg-gray-50 rounded-xl shadow-sm py-2.5 px-3 focus:ring-[#0055A5] focus:border-[#0055A5] sm:text-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Reference / SKU</label>
                    <input required type="text" className="block w-full border-gray-300 bg-gray-50 rounded-xl shadow-sm py-2.5 px-3 focus:ring-[#0055A5] focus:border-[#0055A5] sm:text-sm font-mono" value={form.reference} onChange={e => setForm({...form, reference: e.target.value})} />
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                    <input required type="text" className="block w-full border-gray-300 bg-gray-50 rounded-xl shadow-sm py-2.5 px-3 focus:ring-[#0055A5] focus:border-[#0055A5] sm:text-sm" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Barcode (Optional)</label>
                    <input type="text" className="block w-full border-gray-300 bg-gray-50 rounded-xl shadow-sm py-2.5 px-3 focus:ring-[#0055A5] focus:border-[#0055A5] sm:text-sm font-mono" placeholder="e.g. BAR-12345" value={form.barcode} onChange={e => setForm({...form, barcode: e.target.value})} />
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Min Stock Threshold</label>
                    <input required type="number" min="0" className="block w-full border-gray-300 bg-gray-50 rounded-xl shadow-sm py-2.5 px-3 focus:ring-[#0055A5] focus:border-[#0055A5] sm:text-sm" value={form.minimumStock} onChange={e => setForm({...form, minimumStock: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Criticality</label>
                    <select className="block w-full border-gray-300 bg-gray-50 rounded-xl shadow-sm py-2.5 px-3 focus:ring-[#0055A5] focus:border-[#0055A5] sm:text-sm" value={form.criticality} onChange={e => setForm({...form, criticality: e.target.value})}>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                    </select>
                  </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Image URL</label>
                  <input type="url" placeholder="https://..." className="block w-full border-gray-300 bg-white rounded-xl shadow-sm py-2 px-3 focus:ring-[#0055A5] focus:border-[#0055A5] sm:text-sm" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} />
                  <p className="text-xs text-gray-400 mt-1">Paste an external link to an image.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Or Upload Image</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => setSelectedFile(e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer bg-white rounded-xl shadow-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">Select a local file to upload and save.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description (Optional)</label>
                <textarea rows="3" className="block w-full border-gray-300 bg-gray-50 rounded-xl shadow-sm py-2 px-3 focus:ring-[#0055A5] focus:border-[#0055A5] sm:text-sm" value={form.description} onChange={e => setForm({...form, description: e.target.value})}></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-[#0055A5] text-white rounded-xl font-medium hover:bg-[#004080] transition-all shadow-sm shadow-indigo-600/20 active:scale-95">{editId ? "Update Component" : "Save Component"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewPiece && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">Component Details</h2>
                  <button onClick={() => setViewPiece(null)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
              </div>
              <div className="p-6">
                <div className="flex flex-col sm:flex-row gap-6 mb-6">
                  {/* Image */}
                  <div className="shrink-0">
                    <div className="h-32 w-32 sm:h-40 sm:w-40 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 shadow-sm flex items-center justify-center">
                        {viewPiece.imageUrl ? (
                            <img src={viewPiece.imageUrl} alt={viewPiece.name} className="h-full w-full object-cover" />
                        ) : (
                            <svg className="h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        )}
                    </div>
                  </div>
                  {/* Core Details */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{viewPiece.name}</h3>
                      <p className="text-sm text-gray-500 font-mono mt-1">Ref: {viewPiece.reference}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-black/5">
                          {viewPiece.category}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border shadow-sm ${
                            viewPiece.criticality === 'HIGH' ? 'bg-red-50 text-red-700 border-red-200' : 
                            viewPiece.criticality === 'MEDIUM' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                            'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {viewPiece.criticality}
                        </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 bg-gray-50 p-5 rounded-xl border border-gray-100 mb-6">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Current Stock</p>
                        <p className={`text-xl font-bold ${viewPiece.currentStock <= viewPiece.minimumStock ? 'text-red-600' : 'text-green-600'}`}>
                            {viewPiece.currentStock || 0}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Min Threshold</p>
                        <p className="text-xl font-bold text-gray-900">{viewPiece.minimumStock}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Barcode</p>
                        <p className="text-sm font-mono text-gray-800 mt-1">{viewPiece.barcode || 'N/A'}</p>
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-2">Description</h4>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap min-h-[4rem]">
                        {viewPiece.description || <span className="text-gray-400 italic">No description provided.</span>}
                    </div>
                </div>

              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-100">
                <button onClick={() => setViewPiece(null)} className="px-5 py-2.5 rounded-xl font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm">Close</button>
              </div>
            </div>
          </div>
      )}

    </div>
  );
}