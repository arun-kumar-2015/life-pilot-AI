"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '@/config';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { CheckCircle2, Clock, Wallet, Target, Sparkles, Plus, TrendingUp, Zap, Circle, Loader2, Edit2, Trash2, Save, X } from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<any[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [goals, setGoals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [dailyPlan, setDailyPlan] = useState<any[]>([]);
    const [planLoading, setPlanLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editPlan, setEditPlan] = useState<any[]>([]);

    const config = { headers: { Authorization: `Bearer ${user?.token}` } };

    useEffect(() => {
        setMounted(true);
        const fetchData = async () => {
            try {
                const [tasksRes, expensesRes, goalsRes, planRes] = await Promise.all([
                    axios.get(`${API_URL}/tasks`, config),
                    axios.get(`${API_URL}/expenses`, config),
                    axios.get(`${API_URL}/goals`, config),
                    axios.get(`${API_URL}/daily-plan`, config)
                ]);
                setTasks(tasksRes.data);
                setExpenses(expensesRes.data);
                setGoals(goalsRes.data);
                if (planRes.data && planRes.data.items) {
                    setDailyPlan(planRes.data.items);
                }
            } catch (err) {
                console.error('Error fetching dashboard data', err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchData();
    }, [user]);

    const generateDailyPlan = async () => {
        setPlanLoading(true);
        try {
            const res = await axios.post(`${API_URL}/ai/chat`, { 
                prompt: "Identify my profile and current state. Based on 24 hours, create a detailed morning-to-night routine for today. Return ONLY a valid JSON array of objects with 'time', 'activity', and 'icon' properties (icons should be emoji). CRITICAL: All property values MUST be enclosed in double quotes. Do not include any text before or after the JSON array. Example: [{\"time\": \"08:00 AM\", \"activity\": \"Breakfast\", \"icon\": \"🍳\"}]"
            }, config);
            
            let responseText = res.data.response.trim();
            
            // Robust extraction: find the outermost [ ] or { } (if it's wrapped)
            const firstBracket = responseText.indexOf('[');
            const lastBracket = responseText.lastIndexOf(']');
            
            if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
                responseText = responseText.substring(firstBracket, lastBracket + 1);
            } else {
                // Check if it's a JSON object that contains the items
                const firstBrace = responseText.indexOf('{');
                const lastBrace = responseText.lastIndexOf('}');
                if (firstBrace !== -1 && lastBrace !== -1) {
                    const obj = JSON.parse(responseText.substring(firstBrace, lastBrace + 1));
                    if (obj.items) responseText = JSON.stringify(obj.items);
                    else if (Array.isArray(obj)) responseText = JSON.stringify(obj);
                }
            }
            
            const parseAndSave = async (jsonStr: string) => {
                const planItems = JSON.parse(jsonStr);
                const validatedItems = Array.isArray(planItems) ? planItems : planItems.items || [];
                setDailyPlan(validatedItems);
                await axios.post(`${API_URL}/daily-plan`, { items: validatedItems }, config);
            };

            try {
                await parseAndSave(responseText);
            } catch (parseErr) {
                console.error("Initial JSON Parse Error:", parseErr, "Content:", responseText);
                
                // Attempt to repair common issues: missing commas between objects, unquoted keys
                let repaired = responseText
                    .replace(/\}\s*\{/g, '},{') // Add missing commas between objects
                    .replace(/:\s*([^"\[\{\s][^,}\]]*?)\s*([,}\]])/g, (match: string, value: string, suffix: string) => {
                        // Quote unquoted string values
                        const trimmed = value.trim();
                        if (trimmed === 'true' || trimmed === 'false' || trimmed === 'null' || !isNaN(Number(trimmed))) {
                            return match;
                        }
                        return `: "${trimmed}"${suffix}`;
                    })
                    .replace(/,\s*([\]\}])/g, '$1'); // Remove trailing commas
                
                try {
                    await parseAndSave(repaired);
                } catch (secondErr) {
                    console.error("Repair failed, using fallback:", secondErr);
                    const fallback = [
                        { time: "07:00 AM", activity: "Morning Routine", icon: "☀️" },
                        { time: "09:00 AM", activity: "Project Deep Work", icon: "💻" },
                        { time: "01:00 PM", activity: "Healthy Lunch & Break", icon: "🥗" },
                        { time: "02:00 PM", activity: "Meetings / Planning", icon: "🗓️" },
                        { time: "05:00 PM", activity: "Exercise / Walk", icon: "🏃" },
                        { time: "08:00 PM", activity: "Dinner & Relaxation", icon: "🕯️" },
                    ];
                    setDailyPlan(fallback);
                    await axios.post(`${API_URL}/daily-plan`, { items: fallback }, config);
                }
            }
        } catch (err) {
            console.error("Daily Plan generation failed:", err);
        } finally {
            setPlanLoading(false);
        }
    };

    const handleEditToggle = () => {
        if (!isEditing) {
            setEditPlan([...dailyPlan]);
        }
        setIsEditing(!isEditing);
    };

    const handleUpdateItem = (index: number, field: string, value: string) => {
        const newPlan = [...editPlan];
        newPlan[index] = { ...newPlan[index], [field]: value };
        setEditPlan(newPlan);
    };

    const handleRemoveItem = (index: number) => {
        setEditPlan(editPlan.filter((_, i) => i !== index));
    };

    const handleAddItem = () => {
        setEditPlan([...editPlan, { time: "12:00 PM", activity: "New Activity", icon: "✨" }]);
    };

    const saveDailyPlan = async () => {
        setPlanLoading(true);
        try {
            await axios.post(`${API_URL}/daily-plan`, { items: editPlan }, config);
            setDailyPlan(editPlan);
            setIsEditing(false);
        } catch (err) {
            console.error(err);
        } finally {
            setPlanLoading(false);
        }
    };

    const chartData = expenses.slice(-7).map(e => ({
        name: new Date(e.date).toLocaleDateString(undefined, { weekday: 'short' }),
        amount: e.amount
    }));

    if (loading) return (
        <DashboardLayout>
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="animate-spin text-indigo-500" size={48} />
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="space-y-10 pb-20">
                {/* Hero / AI Action */}
                <header className="glass p-10 rounded-[3rem] relative overflow-hidden border border-white/10">
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white capitalize">
                                Welcome back, <br />
                                <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">{user?.name}</span>
                            </h1>
                            <p className="text-slate-400 text-lg max-w-md">Your personalized cockpit for peak productivity and life harmony.</p>
                        </div>
                        <button 
                            onClick={generateDailyPlan}
                            disabled={planLoading}
                            className="btn-primary flex items-center space-x-3 px-10 py-5 rounded-3xl text-xl shadow-2xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"
                        >
                            {planLoading ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} />}
                            <span>{dailyPlan.length > 0 ? 'Re-Plan My Day' : 'Plan My Day'}</span>
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Stats & Daily Timeline */}
                    <div className="lg:col-span-2 space-y-8">
                        {(dailyPlan.length > 0 || isEditing) && (
                            <section className="glass p-8 rounded-[2.5rem] animate-in slide-in-from-bottom-5 duration-500">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-2xl font-bold flex items-center space-x-3 text-white">
                                        <Clock className="text-indigo-400" />
                                        <span>Daily Timeline</span>
                                    </h3>
                                    <div className="flex space-x-3">
                                        {!isEditing ? (
                                            <button 
                                                onClick={handleEditToggle}
                                                className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-colors"
                                            >
                                                <Edit2 size={20} />
                                            </button>
                                        ) : (
                                            <>
                                                <button 
                                                    onClick={handleAddItem}
                                                    className="p-3 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-2xl text-indigo-400 transition-colors"
                                                >
                                                    <Plus size={20} />
                                                </button>
                                                <button 
                                                    onClick={saveDailyPlan}
                                                    className="p-3 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-2xl text-emerald-400 transition-colors"
                                                >
                                                    <Save size={20} />
                                                </button>
                                                <button 
                                                    onClick={() => setIsEditing(false)}
                                                    className="p-3 bg-red-500/20 hover:bg-red-500/30 rounded-2xl text-red-400 transition-colors"
                                                >
                                                    <X size={20} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {(isEditing ? editPlan : dailyPlan).map((item: any, i: number) => (
                                        <div key={i} className="flex items-start space-x-6 relative group">
                                            {i !== (isEditing ? editPlan : dailyPlan).length - 1 && (
                                                <div className="absolute left-6 top-12 bottom-[-24px] w-0.5 bg-gradient-to-b from-indigo-500/50 to-transparent"></div>
                                            )}
                                            
                                            {isEditing ? (
                                                <input 
                                                    type="text" 
                                                    value={item.icon} 
                                                    onChange={(e) => handleUpdateItem(i, 'icon', e.target.value)}
                                                    className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl shadow-inner ring-1 ring-white/5 text-center"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-inner ring-1 ring-white/5">
                                                    {item.icon}
                                                </div>
                                            )}

                                            <div className="flex-1 pt-1 space-y-1">
                                                {isEditing ? (
                                                    <div className="space-y-2">
                                                        <input 
                                                            type="text" 
                                                            value={item.time} 
                                                            onChange={(e) => handleUpdateItem(i, 'time', e.target.value)}
                                                            className="bg-transparent border-b border-indigo-500/30 text-xs font-bold text-indigo-400 uppercase tracking-widest focus:outline-none focus:border-indigo-500 w-full"
                                                        />
                                                        <input 
                                                            type="text" 
                                                            value={item.activity} 
                                                            onChange={(e) => handleUpdateItem(i, 'activity', e.target.value)}
                                                            className="bg-transparent border-b border-white/10 text-white text-lg font-medium focus:outline-none focus:border-white/30 w-full"
                                                        />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{item.time}</span>
                                                        <p className="text-white text-lg font-medium mt-0.5">{item.activity}</p>
                                                    </>
                                                )}
                                            </div>

                                            {isEditing && (
                                                <button 
                                                    onClick={() => handleRemoveItem(i)}
                                                    className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard icon={<CheckSquare size={24} />} label="Tasks" value={tasks.length} color="indigo" />
                            <StatCard icon={<Wallet size={24} />} label="Expenses" value={`$${expenses.reduce((acc: any, curr: any) => acc + curr.amount, 0)}`} color="emerald" />
                            <StatCard icon={<Target size={24} />} label="Goals" value={goals.length} color="purple" />
                            <StatCard icon={<TrendingUp size={24} />} label="Progress" value={`${Math.round(goals.reduce((acc: any, curr: any) => acc + (curr.progress || 0), 0) / (goals.length || 1))}%`} color="pink" />
                        </section>

                        <section className="glass p-8 rounded-[2.5rem] border border-white/5 shadow-inner">
                            <h3 className="text-xl font-bold mb-8 flex items-center space-x-3 text-white">
                                <Zap className="text-yellow-400" />
                                <span>Recent Performance</span>
                            </h3>
                            <div className="h-[300px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: '#0f172a', 
                                                border: '1px solid #1e293b', 
                                                borderRadius: '16px',
                                                padding: '12px' 
                                            }}
                                            itemStyle={{ color: '#818cf8' }}
                                        />
                                        <Area type="monotone" dataKey="amount" stroke="#818cf8" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </section>
                    </div>

                    {/* Right Side: Quick View */}
                    <div className="space-y-8">
                        <section className="glass p-8 rounded-[2.5rem]">
                            <h3 className="text-xl font-bold mb-6 flex items-center space-x-3 text-white">
                                <Circle size={18} className="text-indigo-500 fill-indigo-500" />
                                <span>Pending Tasks</span>
                            </h3>
                            <div className="space-y-4">
                                {tasks.slice(0, 5).map((task: any) => (
                                    <div key={task._id} className="p-4 bg-slate-800/30 rounded-2xl flex items-center space-x-4 border border-white/5 hover:bg-slate-800/50 transition-colors">
                                        <div className={`p-2 rounded-lg bg-${task.priority === 'High' ? 'red' : task.priority === 'Medium' ? 'yellow' : 'blue'}-500/10`}>
                                            <CheckCircle2 size={16} className={`text-${task.priority === 'High' ? 'red' : task.priority === 'Medium' ? 'yellow' : 'blue'}-400`} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-white truncate">{task.title}</p>
                                            <p className="text-xs text-slate-500 capitalize">{task.priority} Priority</p>
                                        </div>
                                    </div>
                                ))}
                                {tasks.length === 0 && <p className="text-center text-slate-500 italic py-4">No tasks yet.</p>}
                            </div>
                        </section>

                        <section className="glass p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="p-4 bg-indigo-500/20 rounded-3xl">
                                    <Sparkles size={32} className="text-indigo-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Need Focus?</h3>
                                <p className="text-slate-400 text-sm">Our AI can analyze your workload and suggest a focus session plan.</p>
                                <button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-2xl transition-all shadow-lg shadow-indigo-500/40">
                                    Analyze Workload
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function StatCard({ icon, label, value, color }: { icon: any, label: string, value: any, color: string }) {
    const colorClasses: any = {
        indigo: 'border-indigo-500/20 text-indigo-400 bg-indigo-500/10',
        emerald: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/10',
        purple: 'border-purple-500/20 text-purple-400 bg-purple-500/10',
        pink: 'border-pink-500/20 text-pink-400 bg-pink-500/10',
    };

    return (
        <div className={`p-6 glass rounded-3xl border ${colorClasses[color].split(' ')[0]} flex items-center space-x-4`}>
            <div className={`p-4 rounded-2xl ${colorClasses[color].split(' ').slice(1).join(' ')}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-slate-400">{label}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
    );
}

function CheckSquare({ size = 24 }: { size?: number }) {
    return <Clock size={size} />; // Reusing Clock as icon for Tasks quick display if needed, or use the real one
}
