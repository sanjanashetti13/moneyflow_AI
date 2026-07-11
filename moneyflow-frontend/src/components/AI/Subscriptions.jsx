import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import { Repeat, ShieldCheck, AlertCircle, Loader2, CreditCard, Calendar, Zap } from 'lucide-react';

export default function Subscriptions() {
    const { token } = useOutletContext();
    const [subs, setSubs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [pending, setPending] = useState([]);
    const [selectedIndices, setSelectedIndices] = useState([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (pending.length > 0) {
            setSelectedIndices(pending.map((_, i) => i));
        }
    }, [pending]);

    const toggleSelect = (idx) => {
        setSelectedIndices(prev => 
            prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
        );
    };

    const fetchSubs = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/ai/subscriptions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSubs(res.data.subscriptions || []);
        } catch (err) {
            console.error("Failed to detect subscriptions:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchSubs();
    }, [token]);

    const handleSync = async () => {
        setSyncing(true);
        try {
            const res = await axios.post(`${API_URL}/api/ai/sync-gmail`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPending(res.data.pending || []);
            setShowConfirm(true);
        } catch (err) {
            console.error("Sync failed:", err);
            alert("Gmail Sync failed: " + (err.response?.data?.msg || err.message));
        } finally {
            setSyncing(false);
        }
    };

    const confirmSubs = async () => {
        const toConfirm = pending.filter((_, i) => selectedIndices.includes(i));
        if (toConfirm.length === 0) return alert("Please select at least one subscription");
        
        try {
            await axios.post(`${API_URL}/api/ai/confirm-subscriptions`, { subscriptions: toConfirm }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowConfirm(false);
            fetchSubs();
            alert("Subscriptions confirmed and added!");
        } catch (err) {
            alert("Confirmation failed");
        }
    };

    const isDueSoon = (date) => {
        if (!date) return false;
        const diff = new Date(date) - new Date();
        return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="flex justify-between items-end">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black text-white tracking-tight">Subscriptions</h1>
                    <p className="text-zinc-500 text-sm font-medium">Manage your active subscriptions from Netflix, Amazon, Google Play, and more.</p>
                </div>
                <button 
                    onClick={handleSync}
                    disabled={syncing}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50"
                >
                    {syncing ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} />}
                    Sync with Gmail
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-emerald-500" size={40} />
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Analyzing your patterns...</p>
                </div>
            ) : subs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subs.map((sub, idx) => (
                        <div key={idx} className="glass-card p-6 bg-zinc-900/20 border-zinc-800/40 hover:border-emerald-500/30 transition-all group">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-3 bg-zinc-800 rounded-2xl text-zinc-400 group-hover:text-emerald-400 transition-colors">
                                    <CreditCard size={20} />
                                </div>
                                <div className="flex gap-2">
                                    {isDueSoon(sub.nextPayment) && (
                                        <div className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-[9px] font-black text-amber-500 uppercase tracking-widest animate-pulse">
                                            Due Soon
                                        </div>
                                    )}
                                    <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                                        {sub.frequency}
                                    </div>
                                </div>
                            </div>
                            
                            <h3 className="text-lg font-bold text-white mb-1">{sub.name}</h3>
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4">{sub.category}</p>
                            
                            {sub.nextPayment && (
                                <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-zinc-800/50 rounded-lg border border-zinc-700/30">
                                    <ShieldCheck size={12} className="text-emerald-500" />
                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                                        Next: <span className="text-white ml-1">{new Date(sub.nextPayment).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                    </p>
                                </div>
                            )}

                            <div className="pt-4 border-t border-zinc-800/50 flex items-center justify-between">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xs font-bold text-zinc-500">₹</span>
                                    <span className="text-xl font-black text-emerald-400">{sub.amount}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-zinc-500">
                                    <Calendar size={12} />
                                    <span className="text-[10px] font-bold uppercase tracking-tighter">Subscription</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass-card p-20 flex flex-col items-center justify-center border-dashed border-zinc-800 opacity-30">
                    <Repeat size={48} className="text-zinc-700 mb-4" />
                    <p className="text-sm font-bold text-zinc-600 uppercase tracking-widest">No subscriptions detected yet</p>
                </div>
            )}

            {/* Smart Disclaimer */}
            <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl flex gap-4 items-center">
                <ShieldCheck className="text-emerald-500 shrink-0" size={24} />
                <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                    Our AI models learn from your transaction history. If a subscription is missing, ensure those expenses are tagged correctly in your <span className="text-emerald-400 font-bold">History</span>.
                </p>
            </div>
            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="glass-card w-full max-w-2xl bg-zinc-900 overflow-hidden border-zinc-800">
                        <div className="p-8 border-b border-zinc-800/50">
                            <h2 className="text-xl font-black text-white mb-2">Confirm Subscriptions</h2>
                            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">We found the following recurring payments in your Gmail</p>
                        </div>
                        
                        <div className="p-8 max-h-[40vh] overflow-y-auto space-y-4">
                            {pending.length > 0 ? pending.map((p, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => toggleSelect(i)}
                                    className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                                        selectedIndices.includes(i) 
                                        ? 'bg-emerald-500/10 border-emerald-500/50 text-white' 
                                        : 'bg-zinc-800/20 border-zinc-800/50 text-zinc-500 grayscale opacity-60'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                            selectedIndices.includes(i) ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-700'
                                        }`}>
                                            {selectedIndices.includes(i) && <div className="w-2 h-3 border-r-2 border-b-2 border-zinc-950 rotate-45 mb-0.5"></div>}
                                        </div>
                                        <div>
                                            <p className={`font-bold transition-colors ${selectedIndices.includes(i) ? 'text-white' : 'text-zinc-500'}`}>{p.name}</p>
                                            <p className="text-[10px] font-medium uppercase tracking-widest opacity-80">{p.category} • {p.frequency}</p>
                                        </div>
                                    </div>
                                    <p className={`font-black transition-colors ${selectedIndices.includes(i) ? 'text-emerald-400' : 'text-zinc-600'}`}>{p.currency} {p.amount}</p>
                                </div>
                            )) : (
                                <p className="text-center text-zinc-600 font-bold uppercase tracking-widest py-10">No new subscriptions found this time.</p>
                            )}
                        </div>

                        <div className="p-8 bg-zinc-800/20 flex gap-4">
                            <button 
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 py-4 text-zinc-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                             <button 
                                onClick={confirmSubs}
                                disabled={selectedIndices.length === 0}
                                className="flex-[2] py-4 bg-emerald-500 text-zinc-950 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50"
                            >
                                Confirm & Add ({selectedIndices.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
