"use client";

import React, { useState } from 'react';
import StudentPortal from '@/components/StudentPortal';
import AdminDashboard from '@/components/AdminDashboard';
import AdminLogin from '@/components/AdminLogin';

export default function Home() {
    const [view, setView] = useState<'student' | 'admin'>('student');
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Global Navigation */}
            <nav className="bg-blue-900 text-white shadow-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-white p-1.5 rounded-lg">
                            <svg className="w-6 h-6 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.642.288a6 6 0 01-3.86.517l-2.387-.477a2 2 0 00-1.022.547l-1.293 1.293a2 2 0 00-.586 1.414V21h12v-2.879a2 2 0 00-.586-1.414l-1.293-1.293zM11.35 15.15V9h2.3l-1.15-2.3L11.35 9h2.3" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <span className="font-bold text-lg tracking-tight hidden sm:inline-block">MedEval System</span>
                    </div>

                    <div className="flex bg-blue-800/50 rounded-lg p-1">
                        <button
                            onClick={() => setView('student')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'student' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-100 hover:text-white'}`}
                        >
                            Student Portal
                        </button>
                        <button
                            onClick={() => setView('admin')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'admin' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-100 hover:text-white'}`}
                        >
                            Admin Dashboard
                        </button>
                    </div>
                </div>
            </nav>

            <main>
                {view === 'student' ? (
                    <StudentPortal />
                ) : (
                    isAdminAuthenticated ? (
                        <AdminDashboard onLogout={() => setIsAdminAuthenticated(false)} />
                    ) : (
                        <AdminLogin onLogin={() => setIsAdminAuthenticated(true)} />
                    )
                )}
            </main>

            <footer className="bg-white border-t border-slate-200 mt-20 py-8">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-slate-500 text-sm">Medical College Phase-Wise and Teacher Evaluation System</p>
                    <p className="text-slate-400 text-xs mt-1">© 2025 Academic Quality Assurance Department</p>
                </div>
            </footer>
        </div>
    );
}
