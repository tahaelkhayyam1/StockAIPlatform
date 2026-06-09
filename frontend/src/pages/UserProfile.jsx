import React, { useState, useEffect } from "react";
import axios from "axios";
import { getToken, getAuth, saveAuth } from "../auth/auth";

export default function UserProfile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        phone: "",
        age: ""
    });
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [toast, setToast] = useState(null);

    const token = getToken();
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            // we can just load the current user info from the auth state, 
            // but fetching from backend gives the most up to date data.
            // Let's use the current user id from auth.
            const authData = getAuth();
            if (authData && authData.id) {
                // If there's no endpoint for `/api/users/me`, we can use the admin endpoint if they have access
                // Actually, let's create a `/api/users/me` endpoint later if needed, or just use the local state for now.
                // Assuming we will create a UserController endpoint `/api/users/me` or just use the auth info.
                
                // For now, let's fetch using the authData id if possible
                const res = await axios.get(`http://localhost:8080/api/users/${authData.id}`, { headers });
                setUser(res.data);
                setFormData({
                    username: res.data.username || "",
                    phone: res.data.phone || "",
                    age: res.data.age || ""
                });
                if (res.data.profilePicture) {
                    setPreviewUrl(`http://localhost:8080${res.data.profilePicture}`);
                }
            }
        } catch (e) {
            console.error("Failed to load profile", e);
            // fallback to auth data if fetch fails
            const authData = getAuth();
            if (authData) {
                setUser(authData);
                setFormData({
                    username: authData.username || "",
                    phone: authData.phone || "",
                    age: authData.age || ""
                });
                if (authData.profilePicture) {
                    setPreviewUrl(`http://localhost:8080${authData.profilePicture}`);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, isError = false) => {
        setToast({ message, isError });
        setTimeout(() => setToast(null), 4000);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePictureFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            let profilePictureUrl = user?.profilePicture;

            if (profilePictureFile) {
                const uploadData = new FormData();
                uploadData.append("file", profilePictureFile);
                const uploadRes = await axios.post("http://localhost:8080/api/images/upload", uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data', ...headers }
                });
                profilePictureUrl = uploadRes.data.url;
            }

            const payload = {
                ...formData,
                profilePicture: profilePictureUrl
            };

            const res = await axios.put(`http://localhost:8080/api/users/${user.id}`, payload, { headers });
            
            // update local auth state so top nav updates
            const authData = getAuth();
            saveAuth({ ...authData, ...res.data });
            
            setUser(res.data);
            showToast("Profile updated successfully!");
        } catch (err) {
            console.error(err);
            showToast("Failed to update profile.", true);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading profile...</div>;

    return (
        <div className="max-w-3xl mx-auto py-8">
            {toast && (
                <div className="fixed top-4 right-4 z-[60] animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className={`px-6 py-3 rounded-xl shadow-lg border flex items-center gap-3 ${toast.isError ? 'bg-red-50 border-red-100 text-red-800' : 'bg-green-50 border-green-100 text-green-800'}`}>
                        <span className="font-semibold text-sm">{toast.message}</span>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
                        <p className="text-sm text-gray-500 mt-1">Update your personal information and profile picture.</p>
                    </div>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 font-semibold rounded-full text-sm">
                        {user?.role}
                    </span>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Profile Picture Section */}
                    <div className="flex items-center gap-8">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Profile Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <svg className="w-16 h-16 text-gray-300" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white cursor-pointer hover:bg-blue-700 shadow-md transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </label>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{user?.email}</h3>
                            <p className="text-gray-500 text-sm">Update your avatar. Recommended size: 256x256px.</p>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Username / Full Name</label>
                            <input
                                type="text"
                                required
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                            <input
                                type="email"
                                disabled
                                value={user?.email || ""}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                            <input
                                type="number"
                                value={formData.age}
                                onChange={(e) => setFormData({...formData, age: e.target.value})}
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
