"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { GraduationCap, BookOpen, Clock, Sparkles, Loader2, Plus, Calendar, Trash2 } from 'lucide-react';

export default function StudyPlannerPage() {
    const { user } = useAuth();
    const [subject, setSubject] = useState('');
    const [examDate, setExamDate] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    const config = { headers: { Authorization: `Bearer ${user?.token}` } };

    useEffect(() => {
        setMounted(true);
        const fetchPlans = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/study', config);
                setPlans(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchPlans();
    }, [user]);

    const deletePlan = async (id: string) => {
        if (!confirm('Are you sure you want to delete this study plan?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/study/${id}`, config);
            setPlans(plans.filter(p => p._id !== id));
        } catch (err) {
            console.error(err);
            alert("Failed to delete plan.");
        }
    };

    const generatePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        setAiLoading(true);
        try {
            if (file) {
                // File Upload Flow
                const formData = new FormData();
                formData.append('file', file);
                formData.append('subject', subject);
                formData.append('examDate', examDate);

                const res = await axios.post('http://localhost:5000/api/study/upload', formData, {
                    headers: {
                        ...config.headers,
                        'Content-Type': 'multipart/form-data',
                    },
                });
                setPlans([res.data, ...plans]);
            } else {
                // Manual Generation Flow
                const aiRes = await axios.post('http://localhost:5000/api/ai/chat', { 
                    prompt: `Create a detailed 3-day study schedule for ${subject} with an exam on ${examDate}. 
                    CRITICAL: Return ONLY a valid JSON object with a 'schedule' key. 
                    Format: Exact time ranges (e.g. 09:00-10:00 AM), Periods (Morning/Afternoon/Evening), Topics, and Descriptions. 
                    Include breaks and review sessions.
                    Example: {"schedule": [{"day": 1, "date": "...", "sessions": [{"period": "Morning", "timeRange": "09:00-09:30 AM", "topic": "Warm-up", "description": "Quick review"}]}]}`
                }, config);

                let scheduleData;
                try {
                    const text = aiRes.data.response.trim();
                    const parsed = JSON.parse(text);
                    scheduleData = parsed.schedule || parsed.days || (Array.isArray(parsed) ? parsed : null);
                    
                    if (!scheduleData) {
                        // Attempt fallback extraction
                        const startBracket = text.indexOf('[');
                        const endBracket = text.lastIndexOf(']');
                        if (startBracket !== -1 && endBracket !== -1) {
                            scheduleData = JSON.parse(text.substring(startBracket, endBracket + 1));
                        } else {
                            throw new Error("No JSON schedule found");
                        }
                    }
                } catch (parseErr) {
                    console.error("Failed to parse study plan JSON:", parseErr);
                    scheduleData = aiRes.data.response;
                }

                const res = await axios.post('http://localhost:5000/api/study', { 
                    subject, 
                    examDate, 
                    schedule: scheduleData 
                }, config);

                setPlans([res.data, ...plans]);
            }
            
            setSubject('');
            setExamDate('');
            setFile(null);
        } catch (err) {
            console.error(err);
            alert("Failed to generate plan. Please try again.");
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-white">Study Planner</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Input Section */}
                    <div className="glass p-8 rounded-3xl h-fit border border-white/10 shadow-xl">
                        <h2 className="text-xl font-bold mb-6 flex items-center space-x-2 text-white">
                            <BookOpen className="text-indigo-400" />
                            <span>New Study Plan</span>
                        </h2>
                        <form onSubmit={generatePlan} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Subject / Course</label>
                                <input 
                                    type="text"
                                    required
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-slate-500"
                                    placeholder="e.g. Data Structures"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Exam Date</label>
                                <input 
                                    type="date"
                                    required
                                    value={examDate}
                                    onChange={(e) => setExamDate(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-indigo-500 text-white inverted-scheme-date"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Upload Syllabus/Notes (Optional)</label>
                                <div className="relative group">
                                    <input 
                                        type="file"
                                        accept=".pdf,.txt,.md"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label 
                                        htmlFor="file-upload"
                                        className="w-full flex items-center justify-between bg-slate-800/50 border border-slate-700 border-dashed rounded-xl py-3 px-4 cursor-pointer hover:border-indigo-500 transition-all text-slate-400 hover:text-indigo-400"
                                    >
                                        <span className="truncate flex-1 pr-4">
                                            {file ? file.name : 'Choose PDF or Text File'}
                                        </span>
                                        <Plus size={18} />
                                    </label>
                                </div>
                                <p className="text-[10px] text-slate-500 italic">AI will extract topics from your file for more accuracy.</p>
                            </div>

                            <button 
                                type="submit" 
                                disabled={aiLoading || !subject || !examDate}
                                className="w-full btn-primary py-4 flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/20"
                            >
                                {aiLoading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                                <span>{file ? 'Generate from File' : 'Generate AI Plan'}</span>
                            </button>
                        </form>
                    </div>

                    {/* Plans List */}
                    <div className="lg:col-span-2 space-y-6">
                        {loading ? (
                            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>
                        ) : plans.length > 0 ? plans.map((plan: any) => (
                            <div key={plan._id} className="glass p-8 rounded-3xl border border-white/5 shadow-inner hover:border-indigo-500/30 transition-all">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-indigo-400 lowercase first-letter:uppercase">{plan.subject}</h3>
                                        <div className="flex items-center text-slate-400 text-sm mt-2">
                                            <div className="p-1.5 bg-slate-800 rounded-lg mr-3">
                                                <Calendar size={14} className="text-indigo-400" />
                                            </div>
                                            <span className="font-semibold tracking-wide">Exam: {mounted ? new Date(plan.examDate).toLocaleDateString() : ''}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border border-emerald-500/20">
                                            AI Pilot Ready
                                        </div>
                                        <button 
                                            onClick={() => deletePlan(plan._id)}
                                            className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                            title="Delete Plan"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-12">
                                    {Array.isArray(plan.schedule) ? (
                                        plan.schedule.map((day: any, dayIdx: number) => {
                                            // Group sessions by period
                                            const periods = ['Morning', 'Afternoon', 'Evening'];
                                            return (
                                                <div key={dayIdx} className="space-y-6">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-slate-800 to-slate-800"></div>
                                                        <span className="text-sm font-black uppercase tracking-[0.3em] text-indigo-400 bg-indigo-500/10 px-6 py-2 rounded-full border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
                                                            Day {day.day} • {day.date}
                                                        </span>
                                                        <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent via-slate-800 to-slate-800"></div>
                                                    </div>
                                                    
                                                    <div className="space-y-10 pl-4 border-l-2 border-slate-800/50 ml-4">
                                                        {periods.map((period) => {
                                                            const sessions = day.sessions?.filter((s: any) => s.period === period);
                                                            if (!sessions || sessions.length === 0) return null;
                                                            
                                                            return (
                                                                <div key={period} className="relative">
                                                                    <div className="absolute -left-[2.1rem] top-0 w-4 h-4 rounded-full bg-slate-900 border-2 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                                                                    <h4 className="text-lg font-bold text-white mb-6 flex items-center">
                                                                        <span className="text-indigo-400 mr-2">✦</span>
                                                                        {period}
                                                                    </h4>
                                                                    
                                                                    <div className="grid grid-cols-1 gap-4">
                                                                        {sessions.map((session: any, sessIdx: number) => (
                                                                            <div key={sessIdx} className="bg-slate-900/40 p-6 rounded-[2rem] border border-white/5 hover:border-indigo-500/30 transition-all group relative overflow-hidden">
                                                                                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-3xl rounded-full -mr-10 -mt-10"></div>
                                                                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                                                                    <div className="space-y-2">
                                                                                        <div className="flex items-center space-x-3">
                                                                                            <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
                                                                                                {session.timeRange || session.time}
                                                                                            </span>
                                                                                            <h5 className="text-white font-bold text-lg leading-tight group-hover:text-indigo-300 transition-colors">
                                                                                                {session.topic}
                                                                                            </h5>
                                                                                        </div>
                                                                                        <p className="text-slate-400 text-sm leading-relaxed ml-2 border-l-2 border-slate-800/50 pl-4 mt-3">
                                                                                            {session.description || session.technique}
                                                                                        </p>
                                                                                    </div>
                                                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                        <Clock size={16} className="text-indigo-400/50" />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="bg-slate-900/80 p-6 rounded-2xl whitespace-pre-wrap text-slate-300 leading-relaxed font-medium text-sm border border-white/5 shadow-inner backdrop-blur-md">
                                            {plan.schedule}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-20 glass rounded-3xl border border-dashed border-slate-700/50">
                                <GraduationCap className="mx-auto text-slate-700 mb-4 opacity-20" size={64} />
                                <p className="text-slate-500 text-lg font-medium">No plans generated yet.</p>
                                <p className="text-slate-600 text-sm">Upload your syllabus or enter a subject to see the magic.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
