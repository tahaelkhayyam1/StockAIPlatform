import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        role: "WORKSHOP"
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        
        try {
            let profilePictureUrl = null;
            if (formData.profilePictureFile) {
                const uploadData = new FormData();
                uploadData.append("file", formData.profilePictureFile);
                const uploadRes = await axios.post("http://localhost:8080/api/images/upload", uploadData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                profilePictureUrl = uploadRes.data.url;
            }

            const payload = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                profilePicture: profilePictureUrl
            };

            await axios.post("http://localhost:8080/api/auth/register", payload);
            setSuccess(true);
            setTimeout(() => navigate("/login"), 3000);
        } catch (err) {
            console.error(err);
            setError("L'inscription a échoué. Veuillez réessayer.");
        } finally {
            setLoading(false);
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
                    <Link to="/">CDG</Link>
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
                                Rejoignez <br />l'Excellence
                            </h1>
                            <p className="text-xl lg:text-2xl font-semibold drop-shadow-md">
                                Créez votre compte collaborateur
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Register Form */}
                <div className="w-full lg:w-[45%] flex items-center justify-center p-6 lg:p-12 relative z-10">
                    
                    <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] w-full max-w-md p-8 lg:p-10">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Inscription</h2>
                            <p className="text-sm text-gray-500 mt-2">Votre compte devra être validé par un administrateur.</p>
                        </div>

                        {success ? (
                            <div className="p-4 rounded-md bg-green-50 text-green-700 text-center border border-green-200">
                                <p className="font-bold mb-2">Inscription Réussie !</p>
                                <p className="text-sm">Votre compte est en attente d'approbation. Vous allez être redirigé...</p>
                            </div>
                        ) : (
                            <form onSubmit={handleRegister} className="space-y-4">
                                {error && (
                                    <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm font-medium border border-red-200 text-center">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                                        Nom complet
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0055A5] focus:border-[#0055A5] outline-none transition-all text-sm"
                                        placeholder="Jean Dupont"
                                        value={formData.username}
                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                                        Email (Matricule)
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0055A5] focus:border-[#0055A5] outline-none transition-all text-sm"
                                        placeholder="jean.dupont@dxc.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                                        Photo de profil
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md outline-none transition-all text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#0055A5] file:text-white hover:file:bg-[#004080]"
                                        onChange={(e) => setFormData({...formData, profilePictureFile: e.target.files[0]})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                                        Rôle souhaité
                                    </label>
                                    <select 
                                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0055A5] focus:border-[#0055A5] outline-none transition-all text-sm appearance-none cursor-pointer"
                                        value={formData.role}
                                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    >
                                        <option value="WORKSHOP">Technicien / Atelier</option>
                                        <option value="ADMIN">Manager Stock</option>
                                    </select>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-[#0055A5] hover:bg-[#004080] text-white font-bold py-3 px-4 rounded-md transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {loading ? "Création en cours..." : "Créer le compte"}
                                    </button>
                                </div>

                                <div className="text-center pt-2">
                                    <Link to="/login" className="text-xs font-medium text-[#0055A5] hover:underline">
                                        Vous avez déjà un compte ? Connectez-vous
                                    </Link>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
}