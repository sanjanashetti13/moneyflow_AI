import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, TrendingDown, TrendingUp, ChevronRight, Mail, CheckCircle2, Clock } from 'lucide-react';
import { Card } from './ui/card';

export default function MonthSummary() {
    const [summaries, setSummaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetchSummaries();
    }, []);

    const fetchSummaries = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/summary/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSummaries(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Fetch Summaries Failed:", err);
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await axios.post(`${API_URL}/api/summary/mark-read/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSummaries(prev => prev.map(s => s._id === id ? { ...s, isRead: true } : s));
        } catch (err) {
            console.error("Mark Read Failed:", err);
        }
    };

    const getMonthName = (m, y) => {
        return new Date(y, m).toLocaleString('default', { month: 'long', year: 'numeric' });
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div>
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Monthly Summaries</h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-2">Your historical financial performance reports</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {summaries.length > 0 ? summaries.map((s) => (
                    <Card key={s._id} className={`group overflow-hidden border-zinc-800 transition-all hover:border-emerald-500/30 ${!s.isRead ? 'ring-2 ring-emerald-500/20' : ''}`}>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-zinc-800 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform">
                                    <Calendar size={20} />
                                </div>
                                <div className="flex flex-col items-end">
                                    {!s.isRead && (
                                        <span className="px-2 py-0.5 bg-emerald-500 text-zinc-950 text-[8px] font-black uppercase rounded-full mb-2">New</span>
                                    )}
                                    {s.isEmailSent && <Mail size={14} className="text-zinc-600" />}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">{getMonthName(s.month, s.year)}</h3>
                                <div className="flex items-baseline gap-1 mt-2">
                                    <span className="text-xs font-bold text-zinc-500">₹</span>
                                    <span className="text-3xl font-black text-white tracking-tighter">{s.totalAmount.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="space-y-2 pt-4 border-t border-zinc-800/50">
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Top Categories</p>
                                {Object.entries(s.categoryBreakdown).slice(0, 3).map(([cat, amt]) => (
                                    <div key={cat} className="flex justify-between items-center bg-zinc-800/20 p-2 rounded-lg border border-zinc-800/50">
                                        <span className="text-[10px] font-bold text-zinc-400">{cat}</span>
                                        <span className="text-[10px] font-black text-white">₹{amt.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>

                            <button 
                                onClick={() => markAsRead(s._id)}
                                className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                                    s.isRead 
                                    ? 'bg-zinc-800/50 text-zinc-500 cursor-default' 
                                    : 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400 active:scale-95'
                                }`}
                                disabled={s.isRead}
                            >
                                {s.isRead ? 'Already Reviewed' : 'Mark as Reviewed'}
                            </button>
                        </div>
                    </Card>
                )) : (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center bg-zinc-900/30 rounded-3xl border-2 border-dashed border-zinc-800">
                        <Clock size={48} className="text-zinc-700 mb-4" />
                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">No monthly summaries generated yet.</p>
                        <p className="text-zinc-700 text-[10px] mt-2 font-medium">Summaries are auto-generated at the start of each month.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
