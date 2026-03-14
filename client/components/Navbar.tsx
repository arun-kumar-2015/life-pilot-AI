"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, CheckSquare, Wallet, GraduationCap, Target, MessageSquare, User, LogOut, Menu, Moon, Sun, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return (
        <nav className="glass sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                LifePilot AI
            </span>
        </nav>
    );

    const navLinks = user ? [
        { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
        { name: 'Tasks', href: '/tasks', icon: <CheckSquare size={18} /> },
        { name: 'Expenses', href: '/expenses', icon: <Wallet size={18} /> },
        { name: 'Goals', href: '/goals', icon: <Target size={18} /> },
        { name: 'Study Planner', href: '/study', icon: <GraduationCap size={18} /> },
        { name: 'AI Chat', href: '/ai-chat', icon: <MessageSquare size={18} /> },
    ] : [
        { name: 'Login', href: '/login', icon: <User size={18} /> },
        { name: 'Register', href: '/register', icon: <Plus size={18} /> },
    ];

    return (
        <>
            <nav className="glass sticky top-0 z-50 px-6 py-4 flex justify-between items-center border-b border-white/5">
                <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                    LifePilot AI
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center space-x-8">
                    {user ? (
                        <>
                            {navLinks.map(link => (
                                <Link key={link.href} href={link.href} className="text-sm font-medium hover:text-indigo-400 transition-colors">
                                    {link.name}
                                </Link>
                            ))}
                            <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-white/10">
                                <span className="text-sm font-semibold text-slate-300">{user.name.split(' ')[0]}</span>
                                <button onClick={logout} className="p-2 hover:bg-red-500/20 rounded-full transition-colors group">
                                    <LogOut size={18} className="text-slate-400 group-hover:text-red-400" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm font-medium hover:text-indigo-400 transition-colors">Login</Link>
                            <Link href="/register" className="btn-primary px-6 py-2.5">Get Started</Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button 
                    className="md:hidden p-2 text-slate-300 hover:text-white" 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                     {isMenuOpen ? <LogOut size={24} className="rotate-90" /> : <Menu size={24} />}
                </button>
            </nav>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-40 bg-slate-950/95 md:hidden pt-24 px-8 space-y-8 animate-in fade-in slide-in-from-right-10 duration-300">
                    <div className="flex flex-col space-y-6">
                        {navLinks.map(link => (
                            <Link 
                                key={link.href} 
                                href={link.href} 
                                onClick={() => setIsMenuOpen(false)}
                                className="text-2xl font-bold flex items-center space-x-4 text-slate-200"
                            >
                                <span className="p-2 bg-slate-800 rounded-xl text-indigo-400">{link.icon}</span>
                                <span>{link.name}</span>
                            </Link>
                        ))}
                        {user && (
                            <button 
                                onClick={() => { logout(); setIsMenuOpen(false); }}
                                className="text-2xl font-bold flex items-center space-x-4 text-red-400 pt-8"
                            >
                                <span className="p-2 bg-red-500/10 rounded-xl"><LogOut size={24} /></span>
                                <span>Logout</span>
                            </button>
                        )}
                        {!user && (
                            <Link 
                                href="/register" 
                                onClick={() => setIsMenuOpen(false)}
                                className="btn-primary py-4 text-center text-xl font-bold"
                            >
                                Get Started
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
