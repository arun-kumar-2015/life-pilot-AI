"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '@/config';
import { Plus, Target, CheckCircle2, Circle, Sparkles, Loader2, Trash2 } from 'lucide-react';

export default function GoalsPage() {
    const { user } = useAuth();
    const [goals, setGoals] = useState<any[]>([]);
    const [goalTitle, setGoalTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);

    const config = { headers: { Authorization: `Bearer ${user?.token}` } };

    useEffect(() => {
        const fetchGoals = async () => {
            try {
                const res = await axios.get(`${API_URL}/goals`, config);
                setGoals(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchGoals();
    }, [user]);

    const addGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/goals`, { goalTitle, subTasks: [] }, config);
            setGoals([res.data, ...goals]);
            setGoalTitle('');
        } catch (err) {
            console.error(err);
        }
    };

    const breakGoal = async (goal: any) => {
        setAiLoading(true);
        try {
            const res = await axios.post(`${API_URL}/ai/chat`, { 
                prompt: `Break down this goal into 5 small actionable sub-tasks: "${goal.goalTitle}". Return a JSON object with a 'subtasks' key containing an array of strings.`
            }, config);
            
            let subTasks = [];
            try {
                const parsed = JSON.parse(res.data.response);
                const items = parsed.subtasks || parsed.tasks || Object.values(parsed)[0];
                subTasks = Array.isArray(items) 
                    ? items.map((s: string) => ({ title: s, completed: false }))
                    : [];
            } catch (pErr) {
                console.error("Parse error", pErr);
                // Fallback to newline split if JSON fails
                subTasks = res.data.response.split('\n')
                    .filter((s: string) => s.trim() !== '' && !s.includes('{'))
                    .map((s: string) => ({ title: s.replace(/^\d+\.\s*/, ''), completed: false }));
            }
            
            if (subTasks.length === 0) {
                throw new Error("Could not generate valid sub-tasks");
            }

            const updatedGoal = await axios.put(`${API_URL}/goals/${goal._id}`, { subTasks }, config);
            setGoals(goals.map((g: any) => g._id === goal._id ? updatedGoal.data : g));
        } catch (err) {
            console.error(err);
        } finally {
            setAiLoading(false);
        }
    };

    const deleteGoal = async (id: string) => {
        try {
            await axios.delete(`http://localhost:5000/api/goals/${id}`, config);
            setGoals(goals.filter((g: any) => g._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Goal Tracker</h1>

                {/* Add Goal Form */}
                <form onSubmit={addGoal} className="glass p-8 rounded-3xl mb-10 flex gap-4 items-end">
                    <div className="flex-1 space-y-2">
                        <label className="text-sm text-slate-400">What is your big goal?</label>
                        <input 
                            type="text"
                            required
                            value={goalTitle}
                            onChange={(e) => setGoalTitle(e.target.value)}
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-4 px-6 text-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="e.g. Master React in 30 days"
                        />
                    </div>
                    <button type="submit" className="btn-primary py-4 px-8 h-fit flex items-center space-x-2">
                        <Plus size={20} />
                        <span>Add Goal</span>
                    </button>
                </form>

                {/* Goals List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {loading ? (
                        <div className="col-span-full flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>
                    ) : goals.map((goal: any) => (
                        <div key={goal._id} className="glass p-8 rounded-3xl flex flex-col h-full ring-1 ring-slate-800 hover:ring-indigo-500/50 transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-indigo-500/10 rounded-2xl">
                                    <Target className="text-indigo-400" size={24} />
                                </div>
                                <button onClick={() => deleteGoal(goal._id)} className="text-slate-600 hover:text-red-500 transition-colors">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                            <h3 className="text-xl font-bold mb-4">{goal.goalTitle}</h3>
                            
                            <div className="flex-1 space-y-3 mb-8">
                                {goal.subTasks?.length > 0 ? goal.subTasks.map((st: any, i: number) => (
                                    <div key={i} className="flex items-center space-x-3 text-slate-400 text-sm">
                                        <Circle size={14} className="text-indigo-500" />
                                        <span>{st.title}</span>
                                    </div>
                                )) : (
                                    <p className="text-slate-500 text-sm italic">No sub-tasks yet. Let AI help you break it down.</p>
                                )}
                            </div>

                            <button 
                                onClick={() => breakGoal(goal)}
                                disabled={aiLoading}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-xl flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
                            >
                                {aiLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} className="text-indigo-400" />}
                                <span>AI Decompose Goal</span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
