import { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../../auth/auth";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8080/api/recommendations/reorder";

export default function AIRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setRecommendations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center bg-gradient-to-r from-indigo-900 to-indigo-700 p-8 rounded-2xl shadow-lg text-white">
        <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
               <svg className="w-8 h-8 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
               AI Reorder Intelligence
            </h1>
            <p className="text-indigo-100 text-sm mt-2 max-w-2xl leading-relaxed">
               Our AI analyzes your consumption history, current stock, and supplier lead times to proactively predict stockouts and recommend optimal reorder quantities.
            </p>
        </div>
        <div>
            <button onClick={loadRecommendations} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                Refresh Analysis
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {isLoading && (
              <div className="col-span-full py-12 flex justify-center items-center text-gray-500">
                  Running AI Analysis...
              </div>
          )}
          
          {!isLoading && recommendations.length === 0 && (
              <div className="col-span-full py-12 bg-white rounded-xl border border-gray-200 text-center shadow-sm">
                  <div className="text-emerald-500 mb-3 flex justify-center">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Your Inventory is Optimal</h3>
                  <p className="text-gray-500 mt-1 max-w-sm mx-auto">The AI did not detect any immediate threats of stockouts based on current trends.</p>
              </div>
          )}

          {!isLoading && recommendations.map((rec, index) => (
             <div key={`${rec.pieceId}-${index}`} className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md hover:-translate-y-1">
                 <div className="bg-red-50 p-4 border-b border-red-100 flex justify-between items-start">
                     <div>
                         <h3 className="font-bold text-gray-900 text-lg">{rec.name}</h3>
                         <p className="text-sm text-gray-500">Ref: {rec.reference}</p>
                     </div>
                     <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                         Action Required
                     </span>
                 </div>
                 
                 <div className="p-5 flex-1">
                     <p className="text-sm text-gray-700 italic border-l-4 border-indigo-500 pl-3 bg-indigo-50/50 py-2 rounded-r pr-2 mb-4">
                         "{rec.reason}"
                     </p>

                     <div className="grid grid-cols-2 gap-4 mt-4">
                         <div>
                             <p className="text-xs text-gray-500 uppercase font-semibold">Current Stock</p>
                             <p className="text-xl font-bold text-red-600">{rec.currentStock} <span className="text-sm font-normal text-gray-400">/ {rec.minimumStock} min</span></p>
                         </div>
                         <div>
                             <p className="text-xs text-gray-500 uppercase font-semibold">Best Supplier</p>
                             <p className="text-sm font-medium text-gray-900 mt-1">{rec.bestSupplierName || 'No Supplier Linked'}</p>
                         </div>
                     </div>
                 </div>

                 <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between items-center">
                     <div>
                         <p className="text-xs text-gray-500 uppercase font-semibold">Suggested Order</p>
                         <p className="text-2xl font-black text-indigo-600">+{rec.recommendedQuantity}</p>
                     </div>
                     <button 
                        onClick={() => {
                            navigate("/admin/orders", {
                                state: {
                                    draftOrder: {
                                        pieceId: rec.pieceId,
                                        quantity: rec.recommendedQuantity,
                                        supplierName: rec.bestSupplierName
                                    }
                                }
                            });
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium shadow-sm transition-colors"
                     >
                         Draft Order
                     </button>
                 </div>
             </div>
          ))}
      </div>
    </div>
  );
}
