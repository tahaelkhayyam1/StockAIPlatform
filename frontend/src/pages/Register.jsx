import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await axios.post("http://localhost:8080/api/auth/register", {
                username,
                email,
                password
            });
            alert("Registration successful! Please wait for admin approval.");
            navigate("/login");
        } catch (err) {
            console.error(err);
            setError("Registration failed. Email or username might be taken.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Left Column: Image */}
            <div className="relative hidden w-0 flex-1 lg:block">
                <img
                    className="absolute inset-0 h-full w-full object-cover"
                    src="/login-bg.png"
                    alt="Abstract Background"
                />
                <div className="absolute inset-0 bg-indigo-900/30 mix-blend-multiply" />
            </div>

            {/* Right Column: Form */}
            <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 w-full lg:w-1/2 relative z-10">
                <div className="mx-auto w-full max-w-sm lg:w-96 glass-panel p-8 sm:p-10">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                            Create an account
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Join StockAI Platform today
                        </p>
                    </div>

                    <div className="mt-8">
                        <form onSubmit={handleRegister} className="space-y-6">
                            {error && (
                                <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm font-medium border border-red-200">
                                    {error}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium leading-6 text-gray-900">
                                    Username
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        required
                                        className="modern-input"
                                        placeholder="johndoe"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium leading-6 text-gray-900">
                                    Email address
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="email"
                                        required
                                        className="modern-input"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium leading-6 text-gray-900">
                                    Password
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="password"
                                        required
                                        className="modern-input"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="modern-btn mt-2"
                                >
                                    {loading ? "Registering..." : "Sign up"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}