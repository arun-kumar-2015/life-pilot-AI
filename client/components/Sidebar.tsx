"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CheckSquare, Wallet, GraduationCap, Target, MessageSquare, User, StickyNote } from 'lucide-react';

const Sidebar = () => {
    const pathname = usePathname();

    const menuItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
        { name: 'Tasks', icon: <CheckSquare size={20} />, path: '/tasks' },
        { name: 'Expenses', icon: <Wallet size={20} />, path: '/expenses' },
        { name: 'Study Planner', icon: <GraduationCap size={20} />, path: '/study' },
        { name: 'Goal Tracker', icon: <Target size={20} />, path: '/goals' },
        { name: 'Inner Voice', icon: <StickyNote size={20} />, path: '/notes' },
        { name: 'AI Assistant', icon: <MessageSquare size={20} />, path: '/ai-chat' },
        { name: 'Profile', icon: <User size={20} />, path: '/profile' },
    ];

    return (
        <aside className="w-64 glass h-[calc(100vh-80px)] hidden md:block rounded-r-3xl my-4 mx-2">
            <ul className="mt-8 space-y-2 px-4">
                {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <li key={item.name}>
                            <Link 
                                href={item.path}
                                className={`flex items-center space-x-4 p-3 rounded-xl transition-all ${
                                    isActive 
                                    ? 'bg-indigo-600/20 text-indigo-400 border-r-4 border-indigo-400' 
                                    : 'hover:bg-slate-800 text-slate-400'
                                }`}
                            >
                                {item.icon}
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </aside>
    );
};

export default Sidebar;
