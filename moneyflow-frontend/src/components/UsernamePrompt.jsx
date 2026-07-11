import { useEffect, useState } from "react";
import axios from "axios";
import { User, Check } from "lucide-react";

export default function UsernamePrompt({ token, onSaved }) {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.name || user.name.trim() === "") setVisible(true);
  }, []);

  const save = async () => {
    if (!name || name.trim() === "") return alert("Please enter a name");
    try {
      if (token) {
        await axios.patch(`${API_URL}/api/user`, { name }, { headers: { Authorization: `Bearer ${token}` } });
      }
    } catch (e) {
      console.warn("Server update failed:", e?.message || e);
    }
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    user.name = name;
    localStorage.setItem("user", JSON.stringify(user));
    setVisible(false);
    if (onSaved) onSaved(name);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="glass-card p-8 w-full max-w-md shadow-2xl border-zinc-800/80 bg-zinc-900/40 animate-in zoom-in-95 duration-300">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
            <User size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Display Name</h3>
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Personalize your profile</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">What should we call you?</label>
            <input 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-700" 
              value={name} 
              onChange={(e)=>setName(e.target.value)} 
              placeholder="e.g. Alex" 
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              onClick={()=>setVisible(false)} 
              className="flex-1 py-3 px-4 rounded-xl border border-zinc-800 text-zinc-400 font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-[0.98]"
            >
              Skip
            </button>
            <button 
              onClick={save} 
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/10 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Save Name
              <Check size={14} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
