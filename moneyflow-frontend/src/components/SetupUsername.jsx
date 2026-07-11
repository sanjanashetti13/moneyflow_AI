import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { TrendingUp, User, ArrowRight } from "lucide-react";

export default function SetupUsername({ setToken }) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    if (u?.username) navigate("/");
  }, [navigate]);

  const submit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Session expired. Please login again.");
      return navigate("/login");
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/set-username`,
        { username },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.setItem("user", JSON.stringify(res.data.user));
      if (setToken) setToken(token);
      window.dispatchEvent(new CustomEvent("auth:token-changed", { detail: token }));
      navigate("/");
    } catch (err) {
      console.error("Failed to set username:", err?.response?.data || err);
      alert("Failed to set username");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 font-sans selection:bg-emerald-500/30 px-4">
      <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-zinc-950 mb-6 shadow-xl shadow-emerald-500/20 rotate-3">
            <TrendingUp size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Final Step</h1>
          <p className="text-zinc-500 text-sm mt-2 font-medium">Choose a unique username for your account</p>
        </div>

        <div className="glass-card p-8 bg-zinc-900/40 border-zinc-800/50 backdrop-blur-xl transition-all duration-500">
          <form onSubmit={submit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Choose Username</label>
              <div className="relative group">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  placeholder="e.g. money_pro"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-700"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/10 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? "Saving..." : "Complete Setup"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
