import { useState } from "react";
import { login, verify2FA } from "../api/auth";
import { saveAuth, getDeviceId } from "../auth/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const deviceId = getDeviceId();
            const data = await login(email, password, deviceId);
            if (data.requires2FA) {
                setStep(2);
            } else {
                handleSuccess(data);
            }
        } catch (err) {
            console.error(err);
            setError("Matricule ou mot de passe invalide");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const data = await verify2FA(email, otpCode);
            handleSuccess(data);
        } catch(err) {
            console.error(err);
            setError("Code invalide ou expiré");
        } finally {
            setLoading(false);
        }
    };

    const handleSuccess = (data) => {
        saveAuth(data);
        if (data.role === "SUPER_ADMIN") {
            navigate("/superadmin");
        } else if (data.role === "ADMIN") {
            navigate("/admin");
        } else if (data.role === "WORKSHOP") {
            navigate("/workshop");
        }
    };

    return (
        <div className="min-h-screen bg-[#F4F6F8] flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white shadow-sm h-16 flex items-center px-6 md:px-12 z-20">
                <div className="flex items-center gap-4 border-r border-gray-300 pr-4">
                    <div className="flex items-center font-bold text-2xl tracking-tighter">
                        <span className="text-black">DXC</span>
                        <span className="text-[#5b2b82] text-[10px] uppercase font-bold tracking-widest ml-1 self-end mb-1">.technology</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 pl-4 font-bold text-xl tracking-tight text-gray-800">
                    <span>CDG</span>
                </div>
                
                <nav className="ml-12 hidden md:flex space-x-8 text-sm font-semibold text-gray-700">
                    <a href="#" className="hover:text-blue-600 transition-colors">Accueil</a>
                    <a href="#" className="hover:text-blue-600 transition-colors">À Propos</a>
                    <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
                </nav>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col lg:flex-row relative">
                
                {/* Left Side: Image Banner */}
                <div className="w-full lg:w-[55%] flex items-center justify-center p-6 lg:p-12 relative z-10">
                    <div className="relative w-full aspect-[16/9] lg:aspect-auto lg:h-[80%] rounded-sm overflow-hidden shadow-2xl">
                        <img 
                            src="/dxc_login_hero.png" 
                            alt="DXC Team" 
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-[#0055A5]/60 mix-blend-multiply"></div>
                        
                        <div className="absolute inset-0 flex flex-col justify-center p-12 lg:p-16 text-white">
                            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4 drop-shadow-md">
                                Découvrez les<br />Possibilités
                            </h1>
                            <p className="text-xl lg:text-2xl font-semibold drop-shadow-md">
                                Libérez Votre Potentiel
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="w-full lg:w-[45%] flex items-center justify-center p-6 lg:p-12 relative z-10">
                    
                    <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] w-full max-w-md p-8 lg:p-10">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                                {step === 1 ? "Connexion" : "Vérification 2FA"}
                            </h2>
                            {step === 2 && (
                                <p className="text-sm text-gray-500 mt-2">
                                    Un code à 6 chiffres a été envoyé à {email}
                                </p>
                            )}
                        </div>

                        {step === 1 ? (
                            <form onSubmit={handleLogin} className="space-y-5">
                                {error && (
                                    <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm font-medium border border-red-200 text-center">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                                        Matricule
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0055A5] focus:border-[#0055A5] outline-none transition-all text-sm"
                                        placeholder="Segten"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                                        Mot de passe
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0055A5] focus:border-[#0055A5] outline-none transition-all text-sm"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                                        Langue
                                    </label>
                                    <select className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0055A5] focus:border-[#0055A5] outline-none transition-all text-sm appearance-none cursor-pointer">
                                        <option value="fr">Français</option>
                                        <option value="en">English</option>
                                    </select>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-[#0055A5] hover:bg-[#004080] text-white font-bold py-3 px-4 rounded-md transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {loading ? "Connexion en cours..." : "Connexion..."}
                                    </button>
                                </div>

                                <div className="text-center pt-2 space-y-2">
                                    <Link to="/forgot-password" className="block text-xs font-medium text-[#0055A5] hover:underline">
                                        Mot de passe oublié ?
                                    </Link>
                                    <div className="border-t border-gray-200 mt-4 pt-4">
                                        <Link to="/register" className="text-xs font-medium text-gray-600 hover:text-[#0055A5] hover:underline">
                                            Pas encore de compte ? Créer un compte
                                        </Link>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOtp} className="space-y-5">
                                {error && (
                                    <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm font-medium border border-red-200 text-center">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide text-center">
                                        Code OTP
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0055A5] focus:border-[#0055A5] outline-none transition-all text-2xl font-mono text-center tracking-widest"
                                        placeholder="000000"
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                    />
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading || otpCode.length !== 6}
                                        className="w-full bg-[#0055A5] hover:bg-[#004080] text-white font-bold py-3 px-4 rounded-md transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {loading ? "Vérification..." : "Vérifier et se connecter"}
                                    </button>
                                </div>

                                <div className="text-center pt-2">
                                    <button 
                                        type="button"
                                        onClick={() => setStep(1)} 
                                        className="text-xs font-medium text-gray-500 hover:underline"
                                    >
                                        ← Retour à la connexion
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
}