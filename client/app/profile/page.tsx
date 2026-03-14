"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Shield, Bell, Settings, LogOut, Camera } from 'lucide-react';

export default function ProfilePage() {
    const { user, logout } = useAuth();

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

                {/* Profile Header Card */}
                <div className="glass p-8 rounded-3xl mb-8 flex flex-col md:flex-row items-center gap-8 border-b-4 border-indigo-500">
                    <div className="relative group">
                        <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center border-4 border-slate-700 overflow-hidden">
                            <User size={64} className="text-slate-500" />
                        </div>
                        <button className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full text-white shadow-lg hover:bg-indigo-700 transition-all">
                            <Camera size={18} />
                        </button>
                    </div>
                    <div className="text-center md:text-left space-y-2">
                        <h2 className="text-3xl font-bold">{user?.name}</h2>
                        <p className="text-slate-400 flex items-center justify-center md:justify-start gap-2">
                            <Mail size={16} />
                            {user?.email}
                        </p>
                        <div className="flex gap-2 mt-4 flex-wrap justify-center md:justify-start">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-bold rounded-full uppercase tracking-wider">Premium Member</span>
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full uppercase tracking-wider">AI Pilot Active</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Account Settings */}
                    <div className="glass p-8 rounded-3xl space-y-6">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Settings size={20} className="text-indigo-400" />
                            Account Settings
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl">
                                <div>
                                    <p className="font-medium">Push Notifications</p>
                                    <p className="text-xs text-slate-500">Stay updated on tasks</p>
                                </div>
                                <div className="w-12 h-6 bg-indigo-600 rounded-full p-1 cursor-pointer">
                                    <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl">
                                <div>
                                    <p className="font-medium">Daily AI Digest</p>
                                    <p className="text-xs text-slate-500">Morning summary via email</p>
                                </div>
                                <div className="w-12 h-6 bg-slate-700 rounded-full p-1 cursor-pointer">
                                    <div className="w-4 h-4 bg-white rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security & Danger Zone */}
                    <div className="glass p-8 rounded-3xl space-y-6">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Shield size={20} className="text-indigo-400" />
                            Privacy & Access
                        </h3>
                        <div className="space-y-4">
                            <button className="w-full text-left p-4 bg-slate-800/50 rounded-2xl hover:bg-slate-700 transition-colors">
                                <p className="font-medium">Change Password</p>
                                <p className="text-xs text-slate-500">Last changed 3 months ago</p>
                            </button>
                            <button 
                                onClick={logout}
                                className="w-full text-left p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500/20 transition-colors flex items-center justify-between"
                            >
                                <div>
                                    <p className="font-semibold">Logout</p>
                                    <p className="text-xs opacity-70">End your current session</p>
                                </div>
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
