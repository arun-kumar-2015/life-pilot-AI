"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '@/config';
import { Plus, Trash2, Wallet, TrendingUp, PieChart as PieChartIcon, Sparkles, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

export default function ExpensesPage() {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState<any[]>([]);
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Food');
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    const categories = ['Food', 'Travel', 'Education', 'Entertainment', 'Subscription', 'Other'];
    const config = { headers: { Authorization: `Bearer ${user?.token}` } };

    useEffect(() => {
        setMounted(true);
        const fetchExpenses = async () => {
            try {
                const res = await axios.get(`${API_URL}/expenses`, config);
                setExpenses(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchExpenses();
    }, [user]);

    const addExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/expenses`, { amount: Number(amount), category }, config);
            setExpenses([res.data, ...expenses]);
            setAmount('');
        } catch (err) {
            console.error(err);
        }
    };

    const deleteExpense = async (id: string) => {
        try {
            await axios.delete(`http://localhost:5000/api/expenses/${id}`, config);
            setExpenses(expenses.filter((e: any) => e._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const analyzeSpending = async () => {
        setAiLoading(true);
        try {
            const expenseSummary = expenses.slice(0, 5).map((e: any) => `${e.category}: $${e.amount}`).join(', ');
            const res = await axios.post(`${API_URL}/ai/chat`, { 
                prompt: `Analyze these recent expenses for me: ${expenseSummary}. Provide one budget recommendation.`
            }, config);
            alert(res.data.response);
        } catch (err) {
            console.error(err);
        } finally {
            setAiLoading(false);
        }
    };

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Expenses</h1>
                    <button 
                        onClick={analyzeSpending}
                        disabled={expenses.length === 0 || aiLoading}
                        className="bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-indigo-600/20 transition-all disabled:opacity-50"
                    >
                        {aiLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                        <span>AI Analysis</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    {/* Add Expense Form */}
                    <div className="glass p-8 rounded-3xl h-fit">
                        <h2 className="text-xl font-bold mb-6">Add Expense</h2>
                        <form onSubmit={addExpense} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Amount ($)</label>
                                <input 
                                    type="number"
                                    required
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-xl font-bold"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Category</label>
                                <select 
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <button type="submit" className="w-full btn-primary py-4 flex items-center justify-center space-x-2">
                                <Plus size={20} />
                                <span>Save Expense</span>
                            </button>
                        </form>
                    </div>

                    {/* Chart Section */}
                    <div className="lg:col-span-2 glass p-8 rounded-3xl">
                        <h2 className="text-xl font-bold mb-6">Distribution</h2>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={expenses.slice(0, 10)}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="category" stroke="#64748b" />
                                    <YAxis stroke="#64748b" />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }}
                                    />
                                    <Bar dataKey="amount" fill="#6366f1">
                                        {expenses.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Recent History */}
                <div className="glass rounded-3xl overflow-hidden">
                    <div className="p-6 border-b border-slate-700">
                        <h2 className="text-xl font-bold">Transaction History</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-slate-400 text-sm">
                                    <th className="px-6 py-4 font-semibold uppercase">Category</th>
                                    <th className="px-6 py-4 font-semibold uppercase">Date</th>
                                    <th className="px-6 py-4 font-semibold uppercase">Amount</th>
                                    <th className="px-6 py-4 font-semibold uppercase text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {expenses.map((e: any) => (
                                    <tr key={e._id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 font-medium">{e.category}</td>
                                        <td className="px-6 py-4 text-slate-400">
                                            {mounted ? new Date(e.date).toLocaleDateString() : ''}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-indigo-400">${e.amount}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => deleteExpense(e._id)} className="text-slate-500 hover:text-red-500 transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
