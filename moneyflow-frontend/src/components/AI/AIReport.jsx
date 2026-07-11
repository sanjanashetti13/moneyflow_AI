import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import { FileText, Mail, ArrowRight, CheckCircle2, Loader2, Sparkles, TrendingDown, Target } from 'lucide-react';

export default function AIReport() {
    const { token } = useOutletContext();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);
    const [success, setSuccess] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL;

    const generateReport = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/ai/weekly-report`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReport(res.data);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error("Report generation failed:", err);
            alert("Failed to generate report. Make sure you have OpenAI and SMTP configured.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-900/40 p-10 rounded-[2.5rem] border border-zinc-800/50 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[120px] rounded-full group-hover:bg-emerald-500/10 transition-all duration-1000"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
                            <Sparkles size={24} />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tighter">AI Financial Report</h1>
                    </div>
                    <p className="text-zinc-500 text-sm max-w-md font-medium leading-relaxed">
                        Generate a comprehensive analysis of your monthly spending habits, powered by our advanced AI model.
                    </p>
                </div>

                <div className="relative z-10 flex flex-col items-center">
                    <button 
                        onClick={generateReport}
                        disabled={loading}
                        className="group bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black px-8 py-4 rounded-2xl transition-all shadow-2xl shadow-emerald-500/20 flex items-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <FileText size={20} />}
                        {loading ? "ANALYZING DATA..." : "GENERATE & EMAIL REPORT"}
                    </button>
                    {success && (
                        <div className="flex items-center gap-2 mt-4 text-emerald-400 animate-in fade-in slide-in-from-top-2">
                            <CheckCircle2 size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Sent to your inbox</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Generated Report Content */}
            {report ? (
                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
                    {/* Summary Card */}
                    <div className="glass-card p-10 bg-zinc-900/20 border-zinc-800/40">
                        <h2 className="text-[10px] font-black tracking-[0.3em] uppercase text-zinc-600 mb-6 flex items-center gap-2">
                             <TrendingDown size={14} className="text-emerald-500" />
                             Executive Summary
                        </h2>
                        <p className="text-lg text-zinc-300 leading-relaxed font-medium italic">
                            "{report.summary}"
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Highlights */}
                        <div className="glass-card p-8 bg-zinc-950/40 border-zinc-800/30">
                            <h3 className="text-[10px] font-black tracking-[0.3em] uppercase text-zinc-600 mb-8 flex items-center gap-2">
                                <Sparkles size={14} className="text-emerald-400" />
                                Growth Insights
                            </h3>
                            <div className="space-y-6">
                                {report.insights.map((i, idx) => (
                                    <div key={idx} className="flex gap-4 group">
                                        <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-[10px] font-black shrink-0 group-hover:bg-emerald-500 group-hover:text-zinc-950 transition-all duration-300">
                                            {idx + 1}
                                        </div>
                                        <p className="text-xs font-semibold text-zinc-400 leading-relaxed group-hover:text-zinc-200 transition-colors">{i}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Suggestions */}
                        <div className="glass-card p-8 bg-zinc-950/40 border-zinc-800/30">
                            <h3 className="text-[10px] font-black tracking-[0.3em] uppercase text-zinc-600 mb-8 flex items-center gap-2">
                                <Target size={14} className="text-amber-400" />
                                Action Plan
                            </h3>
                            <div className="space-y-6">
                                {report.suggestions.map((s, idx) => (
                                    <div key={idx} className="flex gap-4 group">
                                        <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 text-[10px] font-black shrink-0 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-all duration-300">
                                            {idx + 1}
                                        </div>
                                        <p className="text-xs font-semibold text-zinc-400 leading-relaxed group-hover:text-zinc-200 transition-colors">{s}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : !loading && (
                <div className="flex flex-col items-center justify-center py-20 opacity-20 group">
                    <FileText size={80} className="text-zinc-800 mb-6 group-hover:scale-110 transition-transform duration-1000" />
                    <p className="text-sm font-bold text-zinc-600 uppercase tracking-widest">No report generated yet</p>
                </div>
            )}
        </div>
    );
}
