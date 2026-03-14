"use client";

import Link from 'next/link';
import { Brain, Calendar, Shield, Sparkles, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
        <div className="relative overflow-hidden min-h-screen bg-slate-950">
            {/* Simple skeleton or just the text to avoid shift */}
            <div className="container mx-auto px-6 pt-20 text-center">
                <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-white opacity-50">
                    LifePilot AI
                </h1>
            </div>
        </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 px-4 py-2 rounded-full text-indigo-400 mb-8 border border-indigo-500/20">
            <Sparkles size={16} />
            <span className="text-sm font-semibold">AI-Powered Life Management</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
            Take Control of Your Life with <br />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              LifePilot AI
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            The all-in-one assistant for your daily tasks, study plans, expenses, and goals. 
            Experience the harmony of artificial intelligence and personal organization.
          </p>
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <Link href="/register" className="btn-primary text-lg px-10 py-4 w-full md:w-auto text-center">
              Start Your Journey
            </Link>
            <Link href="/login" className="px-10 py-4 glass rounded-lg hover:bg-slate-800 transition-all w-full md:w-auto text-center">
              Login to Dashboard
            </Link>
          </div>
        </div>
        
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[1000px] h-[600px] bg-indigo-600/20 blur-[120px] rounded-full opacity-30"></div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-slate-900/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Everything you need to thrive</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Brain className="text-indigo-400" />}
              title="AI Daily Planner"
              desc="Just say 'Plan my day' and watch our AI create a perfectly balanced schedule including breaks and routines."
            />
            <FeatureCard 
              icon={<Zap className="text-yellow-400" />}
              title="Smart Task Manager"
              desc="AI-driven prioritization helps you focus on what truly matters. Never miss a deadline again."
            />
            <FeatureCard 
              icon={<Shield className="text-emerald-400" />}
              title="Expense Tracking"
              desc="Track your spending effortlessly. Get AI suggestions on how to optimize your budget."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="p-8 glass rounded-3xl hover:border-indigo-500/50 transition-all duration-300 transform hover:-translate-y-2">
      <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}
