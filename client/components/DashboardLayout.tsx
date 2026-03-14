"use client";

import Sidebar from './Sidebar';
import ProtectedRoute from './ProtectedRoute';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <ProtectedRoute>
            <div className="flex min-h-[calc(100vh-80px)] bg-slate-950">
                <Sidebar />
                <main className="flex-1 p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
};

export default DashboardLayout;
