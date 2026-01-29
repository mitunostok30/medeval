import React, { useState } from 'react';

interface AdminLoginProps {
    onLogin: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // For now, using a simple password. 
        // In a real app, this should be a proper backend-verified session.
        if (password === "admin123") {
            onLogin();
        } else {
            setError("Incorrect password. Please try again.");
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 scale-in-center overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Administrator Access</h2>
                    <p className="text-slate-500 text-sm mt-2">Enter your password to access the dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900"
                            placeholder="••••••••"
                            required
                            autoFocus
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm font-medium animate-shake text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-[0.98]"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
