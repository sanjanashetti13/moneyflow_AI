import { useState } from "react";
import axios from "axios";
import { useNavigate, useOutletContext } from "react-router-dom";
import { User, Mail, Wallet, ShieldCheck, Check, LogOut, IndianRupee, DollarSign, Euro, PoundSterling } from "lucide-react";
import { SmartCombobox } from "@/components/ui/smart-combo-box";

export default function Profile() {
  const { token, setToken } = useOutletContext();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new CustomEvent("auth:token-changed", { detail: "" }));
    setToken("");
    navigate("/login");
  };

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [user, setUser] = useState({
    email: storedUser.email || "",
    username: storedUser.username || "",
    base_currency: storedUser.base_currency || "INR",
  });

  const [newUsername, setNewUsername] = useState(user.username);
  const [newCurrency, setNewCurrency] = useState(user.base_currency);
  const [loading, setLoading] = useState(false);

  const CURRENCIES = [
    { id: "INR", label: "INR", icon: <IndianRupee size={14} /> },
    { id: "USD", label: "USD", icon: <DollarSign size={14} /> },
    { id: "EUR", label: "EUR", icon: <Euro size={14} /> },
    { id: "GBP", label: "GBP", icon: <PoundSterling size={14} /> },
  ];

  const onSave = async (e) => {
    e.preventDefault();
    if (!token) return alert("Not authenticated");
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/set-username`,
        {
          username: newUsername,
          base_currency: newCurrency,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedUser = res.data.user;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.dispatchEvent(new CustomEvent("auth:token-changed", { detail: token }));
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col items-center text-center py-6">
        <div className="relative group">
          <div className="w-28 h-28 rounded-full bg-zinc-800 flex items-center justify-center text-4xl font-bold text-zinc-400 border-4 border-zinc-900 shadow-2xl relative z-10 overflow-hidden ring-4 ring-zinc-800/20 group-hover:ring-emerald-500/20 transition-all duration-500">
             {user.username ? user.username[0].toUpperCase() : "U"}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-zinc-950 p-1.5 rounded-full z-20 shadow-lg border-2 border-zinc-950">
            <ShieldCheck size={16} strokeWidth={3} />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-white mt-6 tracking-tight">{user.username}</h2>
        <p className="text-zinc-500 text-sm font-medium">{user.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-8">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-8 flex items-center gap-2">
              <User size={16} className="text-emerald-500" />
              Identity Settings
            </h3>

            <form onSubmit={onSave} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Display Name</label>
                <input
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-700"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 opacity-50">Email Address (Read Only)</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" />
                  <input
                    className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-xl py-3 pl-11 pr-4 text-sm text-zinc-500 cursor-not-allowed"
                    value={user.email}
                    readOnly
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Base Currency</label>
                <div className="relative">
                  <SmartCombobox
                    options={CURRENCIES}
                    value={newCurrency}
                    onValueChange={(val) => setNewCurrency(val)}
                  />
                </div>
              </div>

              <button
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/10 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                type="submit"
                disabled={loading}
              >
                {loading ? "Saving Changes..." : "Update Profile"}
                {!loading && <Check size={18} strokeWidth={3} />}
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6 text-center md:text-left">
           <div className="glass-card p-6 border-l-4 border-l-emerald-500">
              <h4 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2">Account Status</h4>
              <p className="text-white text-sm font-bold tracking-tight">Pro Plan Active</p>
              <p className="text-[11px] text-zinc-500 mt-1">Unlimited transactions and multi-currency support.</p>
           </div>
           
           <div className="glass-card p-6 border-l-4 border-l-red-500/50">
              <h4 className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Account Controls</h4>
              <p className="text-white text-sm font-bold tracking-tight">Session Management</p>
              <button 
                onClick={logout}
                className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-red-500/20 transition-all active:scale-[0.98]"
              >
                <LogOut size={14} />
                Log Out of MoneyFlow AI
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
