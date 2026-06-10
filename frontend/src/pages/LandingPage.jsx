import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Navbar */}
      <nav className="absolute top-0 w-full z-50 px-6 lg:px-12 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0055A5] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">StockAI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
            Sign In
          </Link>
          <Link to="/login" className="text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-xl active:scale-95">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center relative overflow-hidden pt-20">
        
        {/* Background Decor */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-300/30 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-300/30 rounded-full blur-[120px] pointer-events-none" />

        <div className={`relative z-10 max-w-5xl mx-auto px-6 text-center transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-[#0055A5] text-sm font-semibold mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            StockAI v4.0 is live
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-8">
            Enterprise parts inventory, <br className="hidden lg:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              automated with AI.
            </span>
          </h1>
          
          <p className="text-lg lg:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            A unified ecosystem for workshop mechanics and administrative inventory managers. Predict shortages, request parts instantly, and eliminate downtime.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-[#0055A5] hover:bg-[#004080] text-white rounded-2xl font-semibold text-lg transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 active:scale-95">
              Enter Platform
            </Link>
            <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-2xl font-semibold text-lg transition-all shadow-sm active:scale-95">
              Explore Features
            </a>
          </div>
        </div>

        {/* Dashboard Mockup Preview */}
        <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3 w-[80%] max-w-5xl aspect-video bg-white rounded-t-3xl shadow-2xl shadow-indigo-900/10 border border-gray-200 p-2 transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-y-1/3 opacity-100' : 'translate-y-full opacity-0'}`}>
            <div className="w-full h-full bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
                <div className="h-12 border-b border-gray-200 flex items-center px-4 gap-2 bg-white">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 p-8 grid grid-cols-3 gap-6 opacity-50 blur-[2px]">
                    <div className="col-span-2 space-y-6">
                        <div className="h-32 bg-indigo-100/50 rounded-xl"></div>
                        <div className="h-64 bg-white border border-gray-200 rounded-xl"></div>
                    </div>
                    <div className="space-y-6">
                        <div className="h-48 bg-white border border-gray-200 rounded-xl"></div>
                        <div className="h-48 bg-purple-50 rounded-xl"></div>
                    </div>
                </div>
            </div>
        </div>
      </main>

    </div>
  );
}
