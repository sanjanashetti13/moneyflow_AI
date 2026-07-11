import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, LucideBellDot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
    const [hasNew, setHasNew] = useState(false);
    const [latestSummary, setLatestSummary] = useState(null);
    const token = localStorage.getItem("token");
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();

    useEffect(() => {
        if (token) checkNewSummary();
    }, [token]);

    const checkNewSummary = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/summary/check`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.hasNew) {
                setHasNew(true);
                setLatestSummary(res.data.summary);
            }
        } catch (err) {
            console.error("Summary Check Failed:", err);
        }
    };

    const handleClick = () => {
        setHasNew(false);
        navigate('/month-summary');
    };

    return (
        <button 
            onClick={handleClick}
            className={`relative p-3 rounded-2xl transition-all active:scale-90 border backdrop-blur-xl ${
                hasNew 
                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
        >
            {hasNew ? <LucideBellDot size={20} className="animate-bounce" /> : <Bell size={20} />}
            
            {hasNew && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
            )}
        </button>
    );
}
