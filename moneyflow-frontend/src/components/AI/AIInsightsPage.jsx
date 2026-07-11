import React from 'react';
import { useOutletContext } from 'react-router-dom';
import AIInsights from './AIInsights';
import { Sparkles } from 'lucide-react';

export default function AIInsightsPage() {
    const { token } = useOutletContext();

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="bg-zinc-900/40 p-10 rounded-[2.5rem] border border-zinc-800/50 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[120px] rounded-full group-hover:bg-emerald-500/10 transition-all duration-1000"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
                            <Sparkles size={24} />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Intelligent Financial Insights</h1>
                    </div>
                    <p className="text-zinc-500 text-sm max-w-2xl font-medium leading-relaxed">
                        Our AI has analyzed your recent spending patterns, budget spikes, and habits to give you personalized, actionable advice to optimize your wealth.
                    </p>
                </div>
            </div>

            <AIInsights token={token} />
        </div>
    );
}
