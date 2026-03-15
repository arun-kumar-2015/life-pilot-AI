"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '@/config';
import { Plus, Trash2, StickyNote, Smile, Meh, Frown, Loader2, Send, Sparkles } from 'lucide-react';

export default function NotesPage() {
    const { user } = useAuth();
    const [notes, setNotes] = useState<any[]>([]);
    const [content, setContent] = useState('');
    const [mood, setMood] = useState('Neutral');
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);

    const config = { headers: { Authorization: `Bearer ${user?.token}` } };

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const res = await axios.get(`${API_URL}/notes`, config);
                setNotes(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchNotes();
    }, [user]);

    const addNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        
        setSubmitLoading(true);
        try {
            const res = await axios.post(`${API_URL}/notes`, { content, mood }, config);
            setNotes([res.data, ...notes]);
            setContent('');
            setMood('Neutral');
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitLoading(false);
        }
    };

    const deleteNote = async (id: string) => {
        try {
            await axios.delete(`http://localhost:5000/api/notes/${id}`, config);
            setNotes(notes.filter((n: any) => n._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const moodIcons: any = {
        'Happy': <Smile className="text-emerald-400" size={20} />,
        'Neutral': <Meh className="text-indigo-400" size={20} />,
        'Sad': <Frown className="text-pink-400" size={20} />
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto pb-20">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Inner Voice</h1>
                        <p className="text-slate-400 mt-1">Listen to your inner self. Share your thoughts, feelings, and what's on your mind.</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-2xl">
                        <StickyNote className="text-indigo-500" size={32} />
                    </div>
                </div>

                {/* Add Note Form */}
                <form onSubmit={addNote} className="glass p-6 rounded-[2rem] mb-10 space-y-6 border border-white/10 shadow-xl">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Daily Reflection</label>
                        <textarea 
                            required
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full bg-slate-800/40 border border-white/5 rounded-2xl py-4 px-5 focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder-slate-500 min-h-[120px] transition-all"
                            placeholder="What's on your mind today? How are you feeling?"
                        />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-6">
                        <div className="flex items-center space-x-3">
                            <label className="text-sm font-medium text-slate-400">Current Mood:</label>
                            <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5">
                                {['Happy', 'Neutral', 'Sad'].map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setMood(m)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${mood === m ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                                    >
                                        {m === 'Happy' && <Smile size={16} />}
                                        {m === 'Neutral' && <Meh size={16} />}
                                        {m === 'Sad' && <Frown size={16} />}
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={submitLoading || !content.trim()}
                            className="btn-primary py-3 px-8 rounded-2xl flex items-center space-x-3 font-semibold shadow-xl shadow-indigo-500/20 disabled:opacity-50 transition-transform active:scale-95"
                        >
                            {submitLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                            <span>Share Thought</span>
                        </button>
                    </div>
                </form>

                {/* Activity Feed / Notes List */}
                <div className="space-y-6">
                    {loading ? (
                        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>
                    ) : notes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {notes.map((note: any) => (
                                <div key={note._id} className="glass p-6 rounded-[1.8rem] flex flex-col justify-between group border border-white/5 hover:border-white/10 transition-all hover:-translate-y-1">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center space-x-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-white/5">
                                                {moodIcons[note.mood]}
                                                <span className="text-xs font-semibold text-slate-300 uppercase tracking-widest">{note.mood}</span>
                                            </div>
                                            <button onClick={() => deleteNote(note._id)} className="p-2 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <p className="text-white/90 leading-relaxed font-medium">
                                            {note.content}
                                        </p>
                                        
                                        {note.analysis && (
                                            <div className="bg-indigo-500/10 border-l-2 border-indigo-500 p-3 rounded-r-xl space-y-1">
                                                <div className="flex items-center gap-2 text-indigo-400">
                                                    <Sparkles size={14} />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">AI Insight</span>
                                                </div>
                                                <p className="text-sm text-slate-300 italic leading-relaxed">
                                                    "{note.analysis}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-white/5">
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                                            {new Date(note.createdAt).toLocaleDateString()} at {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-slate-900/10 rounded-[3rem] border border-dashed border-white/10">
                            <div className="bg-indigo-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <StickyNote className="text-indigo-400" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No entries yet</h3>
                            <p className="text-slate-500 max-w-xs mx-auto">Take a moment to record your inner voice. It's good for the soul.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
