"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '@/config';
import { Plus, Trash2, CheckSquare, Square, AlertCircle, Sparkles, Loader2, Clock, Bell, BellOff } from 'lucide-react';

export default function TasksPage() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<any[]>([]);
    const [newTitle, setNewTitle] = useState('');
    const [priority, setPriority] = useState('medium');
    const [newTime, setNewTime] = useState('');
    const [reminder, setReminder] = useState(false);
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);

    const config = { headers: { Authorization: `Bearer ${user?.token}` } };

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await axios.get(`${API_URL}/tasks`, config);
                setTasks(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchTasks();
    }, [user]);

    // Reminder system
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
            
            tasks.forEach(task => {
                if (task.reminder && task.status === 'pending' && task.time === currentTime) {
                    if (!task.reminded) { // Local flag to prevent multiple alerts
                        alert(`Reminder: ${task.title} is scheduled for now!`);
                        task.reminded = true; 
                    }
                }
            });
        }, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
    }, [tasks]);

    const addTask = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Adding task with state:', { newTitle, priority, newTime, reminder });
        try {
            const res = await axios.post(`${API_URL}/tasks`, { 
                title: newTitle, 
                priority,
                time: newTime,
                reminder
            }, config);
            console.log('Server response:', res.data);
            setTasks([res.data, ...tasks]);
            setNewTitle('');
            setNewTime('');
            setReminder(false);
        } catch (err) {
            console.error('Add task error:', err);
        }
    };

    const toggleStatus = async (task: any) => {
        try {
            const newStatus = task.status === 'completed' ? 'pending' : 'completed';
            const res = await axios.put(`${API_URL}/tasks/${task._id}`, { status: newStatus }, config);
            setTasks(tasks.map((t: any) => t._id === task._id ? res.data : t));
        } catch (err) {
            console.error(err);
        }
    };

    const toggleReminder = async (task: any) => {
        try {
            const res = await axios.put(`${API_URL}/tasks/${task._id}`, { reminder: !task.reminder }, config);
            setTasks(tasks.map((t: any) => t._id === task._id ? res.data : t));
        } catch (err) {
            console.error(err);
        }
    };

    const deleteTask = async (id: string) => {
        try {
            await axios.delete(`${API_URL}/tasks/${id}`, config);
            setTasks(tasks.filter((t: any) => t._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const suggestPriority = async () => {
        setAiLoading(true);
        try {
            const res = await axios.post(`${API_URL}/ai/chat`, { 
                prompt: `Suggest a priority level (low, medium, or high) for this task: "${newTitle}". Explain why briefly.`
            }, config);
            const suggestion = res.data.response.toLowerCase();
            if (suggestion.includes('high')) setPriority('high');
            else if (suggestion.includes('low')) setPriority('low');
            else setPriority('medium');
            alert(res.data.response);
        } catch (err) {
            console.error(err);
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto pb-20">
                <h1 className="text-3xl font-bold mb-8">Tasks</h1>

                {/* Add Task Form */}
                <form onSubmit={addTask} className="glass p-6 rounded-3xl mb-10 space-y-4">
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[300px] space-y-2">
                            <label className="text-sm text-slate-400 ml-1">What needs to be done?</label>
                            <input 
                                type="text"
                                required
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Finish presentation..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-slate-400 ml-1">Priority</label>
                            <select 
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 outline-none w-[130px]"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center justify-between pt-2">
                        <div className="flex items-center space-x-6">
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400 ml-1 flex items-center gap-2">
                                    <Clock size={14} /> Time
                                </label>
                                <input 
                                    type="time"
                                    value={newTime}
                                    onChange={(e) => setNewTime(e.target.value)}
                                    className="bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            <div className="flex items-center space-x-3 mt-6 bg-slate-800/30 p-2.5 rounded-xl border border-slate-700/50">
                                <span className="text-sm text-slate-400">Reminder</span>
                                <div 
                                    onClick={() => {
                                        console.log('Manual toggle click. Current:', reminder);
                                        setReminder(prev => !prev);
                                    }}
                                    className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${reminder ? 'bg-indigo-500' : 'bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${reminder ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button 
                                type="button"
                                onClick={suggestPriority}
                                disabled={!newTitle || aiLoading}
                                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-indigo-400 transition-colors disabled:opacity-50"
                            >
                                {aiLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                            </button>
                            <button type="submit" className="btn-primary py-3 px-6 flex items-center space-x-2">
                                <Plus size={20} />
                                <span>Add Task</span>
                            </button>
                        </div>
                    </div>
                </form>

                {/* Task List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>
                    ) : tasks.length > 0 ? tasks.map((task: any) => (
                        <div key={task._id} className="glass p-4 rounded-2xl flex items-center justify-between group transition-all hover:border-slate-600 border border-white/5">
                            <div className="flex items-center space-x-4">
                                <button onClick={() => toggleStatus(task)} className="text-slate-400 hover:text-indigo-500 transition-colors">
                                    {task.status === 'completed' ? <CheckSquare className="text-indigo-500" /> : <Square />}
                                </button>
                                <div className="space-y-0.5">
                                    <p className={`font-medium ${task.status === 'completed' ? 'line-through text-slate-500' : ''}`}>{task.title}</p>
                                    <div className="flex items-center space-x-3">
                                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                                            task.priority === 'high' ? 'bg-red-500/10 text-red-500' : 
                                            task.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' : 
                                            'bg-blue-500/10 text-blue-500'
                                        }`}>
                                            {task.priority}
                                        </span>
                                        {task.time && (
                                            <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                                                <Clock size={12} className="text-indigo-400" /> {task.time}
                                            </span>
                                        )}
                                        <button 
                                            onClick={() => toggleReminder(task)}
                                            className={`p-1 rounded-lg transition-colors ${task.reminder ? 'text-indigo-400 hover:bg-indigo-500/10' : 'text-slate-600 hover:bg-slate-700/30'}`}
                                            title={task.reminder ? 'Reminder On' : 'Reminder Off'}
                                        >
                                            {task.reminder ? <Bell size={14} /> : <BellOff size={14} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => deleteTask(task._id)} className="p-2 text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    )) : (
                        <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-700">
                            <AlertCircle className="mx-auto text-slate-600 mb-4" size={48} />
                            <p className="text-slate-500">No tasks found. Add your first task above!</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
