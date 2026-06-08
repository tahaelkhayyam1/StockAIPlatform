import { useState } from "react";
import { login } from "../api/auth";
import { saveAuth } from "../auth/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const data = await login(email, password);
            saveAuth(data);

            if (data.role === "SUPER_ADMIN") {
                navigate("/superadmin");
            } else if (data.role === "ADMIN") {
                navigate("/admin");
            } else if (data.role === "WORKSHOP") {
                navigate("/workshop");
            }
        } catch (err) {
            console.error(err);
            setError("Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Left Column: Form */}
            <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 w-full lg:w-1/2 relative z-10">
                <div className="mx-auto w-full max-w-sm lg:w-96 glass-panel p-8 sm:p-10">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                            Welcome back
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Sign in to your account
                        </p>
                    </div>

                    <div className="mt-8">
                        <form onSubmit={handleLogin} className="space-y-6">
                            {error && (
                                <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm font-medium border border-red-200">
                                    {error}
                                </div>
                            )}
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
                                    {loading ? "Signing in..." : "Sign in"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Right Column: Image */}
            <div className="relative hidden w-0 flex-1 lg:block">
                <img
                    className="absolute inset-0 h-full w-full object-cover"
                    src="/login-bg.png"
                    alt="Abstract Background"
                />
                <div className="absolute inset-0 bg-indigo-900/30 mix-blend-multiply" />
            </div>
        </div>
    );
}