import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, RefreshCw, Lightbulb, TrendingUp, Wallet, Zap, ShieldCheck, PieChart, Box } from 'lucide-react';
import DynamicBorderCard from '../ui/dynamic-border-card';

export default function AIInsights({ token }) {
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL || "";

    const fetchInsights = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/ai/insights`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Handle both legacy string array and new object array
            const data = res.data.insights || [];
            const normalized = data.map(item => {
                if (typeof item === 'string') return { title: "Insight", content: item };
                return item;
            });
            setInsights(normalized);
        } catch (err) {
            console.error("Failed to fetch AI insights:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchInsights();
    }, [token]);

    const icons = [
        <Sparkles size={18} />,
        <Lightbulb size={18} />,
        <TrendingUp size={18} />,
        <Wallet size={18} />,
        <Zap size={18} />,
        <ShieldCheck size={18} />,
        <PieChart size={18} />,
        <Box size={18} />
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                        <Sparkles size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white tracking-tight uppercase">AI Insights</h3>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Smartest Financial Advice</p>
                    </div>
                </div>
                <button 
                    onClick={fetchInsights}
                    disabled={loading}
                    className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-all active:rotate-180 duration-500 disabled:opacity-50"
                >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-40 bg-zinc-900/40 rounded-2xl border border-zinc-800 animate-pulse"></div>
                    ))}
                </div>
            ) : insights.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {insights.map((insight, idx) => (
                        <DynamicBorderCard
                            key={idx}
                            title={insight.title || `Insight #${idx + 1}`}
                            icon={icons[idx % icons.length]}
                        >
                            {insight.content}
                        </DynamicBorderCard>
                    ))}
                </div>
            ) : (
                <div className="glass-card p-12 text-center border-dashed border-zinc-800 opacity-40">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Analyzing your data for magic insights...</p>
                </div>
            )}
        </div>
    );
}
