import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import { format, startOfDay, endOfDay } from "date-fns";
import { 
  Plus, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  Tag, 
  Calendar, 
  ChevronRight,
  IndianRupee,
  DollarSign,
  Euro,
  Circle,
  Zap,
  Mic,
  Eye,
  EyeOff,
  Shield,
  Utensils,
  Bus,
  ShoppingBag,
  FileText,
  MoreHorizontal
} from "lucide-react";
import { SmartCombobox } from "@/components/ui/smart-combo-box";
import { GlowingShadow } from "./ui/glowing-shadow";
import { 
  MorphingPopover, 
  MorphingPopoverTrigger, 
  MorphingPopoverContent 
} from "./ui/morphing-popover";
import { Button } from "./ui/button";

export default function Dashboard() {
  const { token } = useOutletContext();
  const [showBalance, setShowBalance] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const API_URL = import.meta.env.VITE_API_URL;

  const [expenses, setExpenses] = useState([]);
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [processingVoice, setProcessingVoice] = useState(false);
  const [voiceConfirm, setVoiceConfirm] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const [newExpense, setNewExpense] = useState({
    amount: "",
    category: "Food",
    note: "",
    currency: "INR",
  });

  const CATEGORIES = [
    { id: "Food", label: "Food", icon: <Utensils size={14} /> },
    { id: "Transport", label: "Transport", icon: <Bus size={14} /> },
    { id: "Shopping", label: "Shopping", icon: <ShoppingBag size={14} /> },
    { id: "Bills", label: "Bills", icon: <FileText size={14} /> },
    { id: "Other", label: "Other", icon: <MoreHorizontal size={14} /> },
  ];

  const CURRENCIES = [
    { id: "INR", label: "INR", icon: <IndianRupee size={14} /> },
    { id: "USD", label: "USD", icon: <DollarSign size={14} /> },
    { id: "EUR", label: "EUR", icon: <Euro size={14} /> },
  ];

  const baseCurrency = user.base_currency || "INR";

  useEffect(() => {
    if (!token) return;
    let mounted = true;
    const load = async () => {
      try {
        const [expRes, rateRes] = await Promise.all([
          axios.get(`${API_URL}/api/expenses`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/currency`)
        ]);
        if (!mounted) return;
        setExpenses(expRes.data || []);
        setRates(rateRes.data?.rates || {});
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
  }, [token, API_URL]);

  const toLocal = useCallback((dateStr) => new Date(dateStr), []);

  const todayExpenses = useMemo(() => {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    return expenses.filter((e) => {
      const d = toLocal(e.date);
      return d >= todayStart && d <= todayEnd;
    });
  }, [expenses, toLocal]);

  const convert = useCallback((amount, from) => {
    const amt = Number(amount);
    if (!amt) return 0;
    if (from === baseCurrency) return amt;
    if (!rates[from] || !rates[baseCurrency]) return amt;
    return (amt / rates[from]) * rates[baseCurrency];
  }, [rates, baseCurrency]);

  const totalToday = todayExpenses.reduce((sum, e) => sum + convert(e.amount, e.currency), 0);

  const addExpense = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/expenses`, newExpense, { headers: { Authorization: `Bearer ${token}` } });
      setNewExpense({ amount: "", category: "Food", note: "", currency: "INR" });
      const updated = await axios.get(`${API_URL}/api/expenses`, { headers: { Authorization: `Bearer ${token}` } });
      setExpenses(updated.data || []);
    } catch (err) {
      console.error("Add expense failed:", err);
      alert("Add failed");
    }
  };

  const deleteExpense = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await axios.delete(`${API_URL}/api/expenses/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setExpenses((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append("voice", blob, "recording.webm");
        
        setProcessingVoice(true);
        try {
          const res = await axios.post(`${API_URL}/api/ai/voice`, formData, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          });
          setVoiceConfirm(res.data);
        } catch (err) {
          console.error("Voice processing failed:", err);
          const detail = err.response?.data?.error || err.message;
          alert("Voice processing failed: " + detail);
        } finally {
          setProcessingVoice(false);
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access denied:", err);
      alert("Microphone access denied or not supported.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const saveVoiceEntry = async () => {
    if (!voiceConfirm) return;
    setLoading(true);
    try {
      // Ensure amount is a number and date is formatted correctly
      const submission = {
        ...voiceConfirm.parsed,
        amount: Number(voiceConfirm.parsed.amount)
      };

      // If amount is invalid, stop
      if (isNaN(submission.amount)) {
          return alert("Please enter a valid amount");
      }

      // If the AI date is missing or not today, we might want to default to 'now' 
      // to ensure it shows up in 'Today's Expenses' immediately
      if (!submission.date) {
        submission.date = new Date().toISOString();
      }

      await axios.post(`${API_URL}/api/expenses`, submission, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setVoiceConfirm(null);
      
      // Fetch fresh data for both history and dashboard charts
      const res = await axios.get(`${API_URL}/api/expenses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data) {
        setExpenses(res.data);
        // Also update any parent context if applicable? 
        // For now, local state should suffice for immediate feedback.
      }
    } catch (err) {
      console.error("Save Voice Entry Error:", err);
      alert("Failed to save entry: " + (err.response?.data?.msg || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getCurrencyIcon = (currency) => {
    switch (currency) {
      case 'INR': return <IndianRupee size={12} />;
      case 'USD': return <DollarSign size={12} />;
      case 'EUR': return <Euro size={12} />;
      default: return <Circle size={8} />;
    }
  };

  const topCategory = useMemo(() => {
    if (todayExpenses.length === 0) return "None";
    const map = new Map();
    todayExpenses.forEach((e) => {
      const cat = e.category || "Other";
      const amt = convert(e.amount, e.currency);
      map.set(cat, (map.get(cat) || 0) + amt);
    });
    let top = "None";
    let max = -1;
    map.forEach((val, key) => {
      if (val > max) {
        max = val;
        top = key;
      }
    });
    return top;
  }, [todayExpenses, convert]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-pulse text-zinc-500 font-medium">Loading data...</div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Overview Section */}
      <div className="flex flex-col items-center gap-12 w-full">
        {/* Spending Summary Card */}
        <div className="w-full max-w-3xl">
          <GlowingShadow>
            <div className="p-8 flex flex-col justify-between h-full relative overflow-hidden group">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
              
              <div className="relative z-10 flex justify-between items-start">
                <div className="space-y-4">
                  <p className="text-zinc-500 font-medium text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Average Daily Spending
                  </p>
                  <h1 className="text-5xl font-bold tracking-tighter text-white mt-4 flex items-baseline gap-2 group-hover:scale-[1.01] transition-transform duration-500">
                    <span className="text-2xl font-medium text-emerald-500/80">₹</span>
                    {showBalance ? 
                      totalToday.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 
                      "••••••"
                    }
                  </h1>
                </div>

                <MorphingPopover>
                  <MorphingPopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-zinc-600 hover:text-emerald-500 transition-colors">
                      {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
                    </Button>
                  </MorphingPopoverTrigger>
                  <MorphingPopoverContent className="w-48 p-3 shadow-2xl bg-zinc-900 border-zinc-800">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-emerald-500 mb-2">
                        <Shield size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Privacy Controls</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
                        Toggle balance visibility to keep your expenses private when sharing your screen.
                      </p>
                      <Button 
                        className="w-full text-[10px] font-black uppercase tracking-widest h-8" 
                        onClick={() => setShowBalance(!showBalance)}
                      >
                        {showBalance ? "Hide Balance" : "Show Balance"}
                      </Button>
                    </div>
                  </MorphingPopoverContent>
                </MorphingPopover>
              </div>
              <div className="flex gap-4 mt-8 relative z-10">
                <div className="bg-zinc-800/30 px-4 py-2 rounded-xl border border-zinc-700/30 flex items-center gap-2 backdrop-blur-sm">
                  <ArrowUpRight className="text-emerald-400" size={14} />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Today's Peak: {topCategory}</span>
                </div>
              </div>
            </div>
          </GlowingShadow>
        </div>

        {/* Quick Entry Form */}
        <div className="w-full max-w-xl space-y-6">
          <div className="flex items-center justify-center gap-3 mb-2">
             <div className="h-[1px] w-12 bg-zinc-800"></div>
             <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Quick Entry</h3>
             <div className="h-[1px] w-12 bg-zinc-800"></div>
          </div>
          
          <div className="text-center mb-2">
            <span className="text-[9px] font-medium text-zinc-600 bg-zinc-900/30 px-3 py-1 rounded-full border border-zinc-800/50">
              Try: "Spent 500 on dinner" or "100 for taxi today"
            </span>
          </div>
          
          <form onSubmit={addExpense} className="space-y-4">
            <div className="relative group">
              <input
                type="number"
                placeholder="0.00"
                required
                disabled={isRecording || processingVoice}
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-xl py-3 px-10 text-xl font-bold text-white focus:outline-none focus:border-emerald-500/30 transition-all placeholder:text-zinc-800 text-center disabled:opacity-50"
              />
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 font-bold group-focus-within:text-emerald-500 transition-colors">
                ₹
              </div>
              
              {(isRecording || processingVoice) && (
                <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm rounded-xl flex items-center justify-center gap-3 animate-in fade-in duration-300">
                  {isRecording ? (
                    <>
                      <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-1 h-4 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>
                        ))}
                      </div>
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Listening...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Processing Voice...</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SmartCombobox
                placeholder="Category"
                options={CATEGORIES}
                value={newExpense.category}
                onValueChange={(val) => setNewExpense({ ...newExpense, category: val })}
              />

              <SmartCombobox
                placeholder="Currency"
                options={CURRENCIES}
                value={newExpense.currency}
                onValueChange={(val) => setNewExpense({ ...newExpense, currency: val })}
              />
            </div>

            <div className="relative group">
               <input
                type="text"
                placeholder="Add an optional note..."
                value={newExpense.note}
                onChange={(e) => setNewExpense({ ...newExpense, note: e.target.value })}
                className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-lg py-3 px-4 text-xs font-medium text-white focus:outline-none focus:border-emerald-500/30 transition-all placeholder:text-zinc-700"
              />
            </div>

            <div className="flex gap-2">
                <button 
                  type="submit" 
                  disabled={loading || !newExpense.amount}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black py-3 rounded-xl transition-all shadow-xl shadow-emerald-500/10 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 text-xs uppercase tracking-widest cursor-pointer"
                >
                  <Plus size={16} strokeWidth={3} /> Add Entry
                </button>
                <button 
                  type="button" 
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-4 rounded-xl transition-all active:scale-95 border ${
                    isRecording 
                    ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' 
                    : 'bg-zinc-800/50 border-zinc-700/30 text-zinc-400 hover:text-white hover:bg-zinc-700/50'
                  }`}
                >
                    <Mic size={20} className={isRecording ? "scale-125" : ""} />
                </button>
            </div>
          </form>
        </div>
      </div>

      {/* Voice Confirmation Modal */}
      {voiceConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-lg bg-zinc-900 overflow-hidden border-zinc-800 shadow-2xl">
            <div className="p-8 border-b border-zinc-800/50 relative">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-900"></div>
               <h2 className="text-xl font-black text-white mb-2 uppercase tracking-tighter">Confirm Voice Entry</h2>
               <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Verify what the AI captured</p>
            </div>
            
            <div className="p-8 space-y-6">
                <div className="space-y-2">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">You said:</p>
                    <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800 italic text-zinc-300 text-sm opacity-80">
                        "{voiceConfirm.transcription}"
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-zinc-800/30 rounded-xl border border-zinc-800 space-y-2">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Amount</p>
                        <div className="flex items-center gap-2">
                            <span className="text-emerald-500 font-bold">{voiceConfirm.parsed.currency}</span>
                            <input 
                                type="number"
                                value={voiceConfirm.parsed.amount}
                                onChange={(e) => setVoiceConfirm({
                                    ...voiceConfirm,
                                    parsed: { ...voiceConfirm.parsed, amount: e.target.value }
                                })}
                                className="w-full bg-transparent border-b border-zinc-700 focus:border-emerald-500 text-xl font-black text-white focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="p-4 bg-zinc-800/30 rounded-xl border border-zinc-800 space-y-2">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Category</p>
                        <SmartCombobox 
                            options={CATEGORIES}
                            value={voiceConfirm.parsed.category}
                            onValueChange={(val) => setVoiceConfirm({
                                ...voiceConfirm,
                                parsed: { ...voiceConfirm.parsed, category: val }
                            })}
                        />
                    </div>
                </div>

                <div className="p-4 bg-zinc-800/30 rounded-xl border border-zinc-800 space-y-2">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Note (Optional)</p>
                    <input 
                        type="text"
                        placeholder="Edit or add a note..."
                        value={voiceConfirm.parsed.note || ""}
                        onChange={(e) => setVoiceConfirm({
                            ...voiceConfirm,
                            parsed: { ...voiceConfirm.parsed, note: e.target.value }
                        })}
                        className="w-full bg-transparent border-b border-zinc-700 focus:border-emerald-500 text-sm text-zinc-300 focus:outline-none"
                    />
                </div>
            </div>

            <div className="p-8 bg-zinc-800/20 flex gap-4">
                <button 
                    onClick={() => setVoiceConfirm(null)}
                    className="flex-1 py-4 text-zinc-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors"
                >
                    Discard
                </button>
                <button 
                    onClick={saveVoiceEntry}
                    className="flex-[2] py-4 bg-emerald-500 text-zinc-950 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all active:scale-95"
                >
                    Confirm & Save
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
