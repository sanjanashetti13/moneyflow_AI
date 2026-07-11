import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, X, Bot, User, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import StarButton from '../ui/star-button';
import { InteractiveRobotSpline } from '../ui/interactive-3d-robot';
import { Card } from '../ui/card';
import { AnimatedText } from '../ui/animated-text';

export default function AIChatbot({ token }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello! I'm MoneyFlowAI, your 3D Financial Assistant. Ask me anything about your MoneyFlow!" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);
    const API_URL = import.meta.env.VITE_API_URL || "";
    const ROBOT_SCENE_URL = "https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode";

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await axios.post(`${API_URL}/api/ai/chat`, { message: input }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
        } catch (err) {
            console.error("Chat Failed:", err);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Ask AI Trigger Button */}
            {!isOpen && (
                <div className="fixed bottom-10 right-10 z-[100] animate-in fade-in zoom-in duration-500 delay-500">
                    <StarButton 
                        label="Ask AI" 
                        onClick={() => setIsOpen(true)} 
                    />
                </div>
            )}

            {/* Full Screen 3D Chat Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[200] bg-transparent flex flex-col animate-in fade-in duration-700">
                    {/* 3D Robot Background */}
                    <div className="absolute inset-0 z-0">
                        <InteractiveRobotSpline 
                            scene={ROBOT_SCENE_URL} 
                            className="w-full h-full"
                        />
                    </div>

                    {/* Top Header - Controls Only */}
                    <div className="relative z-20 p-8 flex justify-end items-start">
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="p-4 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-2xl border border-zinc-800 transition-all active:scale-95 backdrop-blur-xl"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Chat Container Area */}
                    <div className="relative z-20 flex-1 flex flex-col items-center justify-end h-full pb-10 px-6">
                        <Card className="w-full max-w-2xl h-[450px] flex flex-col overflow-hidden border-zinc-800/50 bg-transparent backdrop-blur-none shadow-none">
                            {/* Messages List */}
                            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                                {messages.map((m, idx) => (
                                    <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] p-4 rounded-2xl text-[13px] font-medium leading-relaxed ${
                                            m.role === 'user' 
                                            ? 'bg-emerald-500 text-zinc-950 rounded-tr-none font-bold shadow-lg shadow-emerald-500/10' 
                                            : 'bg-zinc-900/80 text-zinc-200 rounded-tl-none border border-zinc-800 backdrop-blur-sm'
                                        }`}>
                                            {m.content}
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl rounded-tl-none animate-pulse">
                                            <Loader2 size={16} className="text-emerald-500 animate-spin" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Input Field */}
                            <div className="p-4 bg-zinc-900/50 border-t border-zinc-800">
                                <form onSubmit={handleSend} className="relative group">
                                    <input 
                                        type="text" 
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Command MoneyFlowAI..."
                                        className="w-full bg-zinc-950/80 border border-zinc-700/50 rounded-xl py-4 pl-6 pr-14 text-sm font-medium text-white placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500/30 transition-all backdrop-blur-xl"
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!input.trim() || loading}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-emerald-500 text-zinc-950 rounded-lg flex items-center justify-center hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        <Send size={20} />
                                    </button>
                                </form>
                            </div>
                        </Card>
                    </div>
                </div>
            )}
        </>
    );
}
