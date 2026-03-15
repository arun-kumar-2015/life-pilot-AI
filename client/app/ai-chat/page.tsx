"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import API_URL from '@/config';
import { Send, Mic, MicOff, Bot, User, Loader2, Sparkles, MessageCircle, Volume2, VolumeX, ListTodo, GraduationCap, DollarSign, BrainCircuit } from 'lucide-react';

export default function AIChatPage() {
    const { user } = useAuth();
    const [messages, setMessages] = useState([
        { role: 'ai', content: "Hello! I'm LifePilot AI. How can I help you manage your day today?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isTTSActive, setIsTTSActive] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    const quickActions = [
        { icon: <ListTodo size={18} />, label: "Plan My Day", prompt: "Help me plan a productive day based on my tasks.", color: "text-emerald-400", bg: "bg-emerald-500/10" },
        { icon: <GraduationCap size={18} />, label: "Study Schedule", prompt: "I need a study schedule for my upcoming exam.", color: "text-indigo-400", bg: "bg-indigo-500/10" },
        { icon: <DollarSign size={18} />, label: "Log Expense", prompt: "I want to log a new expense I just made.", color: "text-amber-400", bg: "bg-amber-500/10" },
        { icon: <BrainCircuit size={18} />, label: "Mindful Insight", prompt: "Analyze my recent inner voice notes for patterns.", color: "text-purple-400", bg: "bg-purple-500/10" }
    ];

    const config = { headers: { Authorization: `Bearer ${user?.token}` } };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const speak = (text: string) => {
        if (!isTTSActive || !('speechSynthesis' in window)) return;
        
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        // Pick a nice voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang.includes('en-US') && v.name.includes('Google')) || voices[0];
        if (preferredVoice) utterance.voice = preferredVoice;

        window.speechSynthesis.speak(utterance);
    };

    const handleSend = async (text: string) => {
        if (!text.trim()) return;
        
        const userMsg = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await axios.post(`${API_URL}/ai/chat`, { prompt: text }, config);
            const aiMsg = { role: 'ai', content: res.data.response };
            setMessages(prev => [...prev, aiMsg]);
            speak(res.data.response);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I'm having trouble connecting right now." }]);
        } finally {
            setLoading(false);
        }
    };

    const toggleVoice = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert("Speech recognition not supported in this browser.");
            return;
        }

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            handleSend(transcript);
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col glass rounded-3xl overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-6 bg-slate-900/50 border-b border-slate-700 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center">
                            <Bot className="text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-xl">LifePilot AI</h2>
                            <div className="flex items-center space-x-3">
                                <span className="text-xs text-emerald-400 flex items-center">
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2"></span>
                                    Online
                                </span>
                                <button 
                                    onClick={() => setIsTTSActive(!isTTSActive)}
                                    className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                                        isTTSActive ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700'
                                    }`}
                                >
                                    {isTTSActive ? <Volume2 size={10} /> : <VolumeX size={10} />}
                                    <span>AI Voice: {isTTSActive ? 'ON' : 'OFF'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                    {messages.length === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            {quickActions.map((action, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(action.prompt)}
                                    className="flex items-center p-4 rounded-3xl bg-slate-800/40 border border-white/5 hover:border-indigo-500/30 hover:bg-slate-800/60 transition-all text-left group"
                                >
                                    <div className={`w-10 h-10 rounded-2xl ${action.bg} ${action.color} flex items-center justify-center mr-4 group-hover:scale-110 transition-transform`}>
                                        {action.icon}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">{action.label}</div>
                                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-black mt-0.5">Quick Start</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] flex ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    msg.role === 'user' ? 'bg-indigo-500' : 'bg-slate-800'
                                }`}>
                                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                    msg.role === 'user' 
                                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                                    : 'bg-slate-800/80 text-slate-200 rounded-tl-none border border-slate-700'
                                }`}>
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                             <div className="bg-slate-800/80 p-4 rounded-2xl flex items-center space-x-2 rounded-tl-none">
                                <Loader2 className="animate-spin text-indigo-400" size={16} />
                                <span className="text-xs text-slate-400 italic">Thinking...</span>
                             </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-6 bg-slate-900/50 border-t border-slate-700">
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <button 
                                onClick={toggleVoice}
                                className={`p-4 rounded-2xl transition-all relative z-10 ${
                                    isListening ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-indigo-400'
                                }`}
                            >
                                {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                            </button>
                            {isListening && (
                                <div className="absolute inset-0 bg-red-500 rounded-2xl animate-ping opacity-20"></div>
                            )}
                        </div>
                        <div className="flex-1 relative">
                            <input 
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend(input)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-6 pr-16 text-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none transition-all placeholder-slate-500"
                                placeholder={isListening ? "Listening..." : "Ask anything... 'Plan my day' or 'Add task: buy milk'"}
                            />
                            <button 
                                onClick={() => handleSend(input)}
                                disabled={!input.trim() || loading}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all disabled:opacity-50"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
