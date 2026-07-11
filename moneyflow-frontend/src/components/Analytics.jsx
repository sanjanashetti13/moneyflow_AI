import { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
  Legend,
  CartesianGrid
} from "recharts";
import { format } from "date-fns";
import { useOutletContext } from "react-router-dom";
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity } from "lucide-react";

const COLORS = ["#10b981", "#3b82f6", "#6366f1", "#f59e0b", "#71717a"];

export default function Analytics() {
  const { token } = useOutletContext();
  const [expenses, setExpenses] = useState([]);
  const [rates, setRates] = useState({});
  const baseCurrency = "INR";
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!token) return;
    let mounted = true;
    const load = async () => {
      try {
        const [expRes, rateRes] = await Promise.all([
          axios.get(`${API_URL}/api/expenses`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/currency`),
        ]);
        if (!mounted) return;
        setExpenses(expRes.data || []);
        setRates(rateRes.data?.rates || {});
      } catch (err) {
        console.error("Analytics load error:", err);
      }
    };
    load();
    return () => (mounted = false);
  }, [token, API_URL]);

  const toUTC = (dateStr) => {
    const d = new Date(dateStr);
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  };

  const convert = useCallback((amount, from) => {
    if (!amount) return 0;
    if (from === baseCurrency) return Number(amount);
    if (!rates[from] || !rates[baseCurrency]) return Number(amount);
    return (Number(amount) / rates[from]) * rates[baseCurrency];
  }, [rates]);

  const last7 = useMemo(() => {
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(todayUTC);
      day.setUTCDate(day.getUTCDate() - i);
      const dayStr = day.toISOString().slice(0, 10);

      const total = expenses
        .filter((e) => {
          const eDate = new Date(e.date).toISOString().slice(0, 10);
          return eDate === dayStr;
        })
        .reduce((sum, e) => sum + convert(e.amount, e.currency), 0);
      result.push({ day: format(day, "EEE"), total });
    }
    return result;
  }, [expenses, convert]);

  const categoryData = useMemo(() => {
    const map = new Map();
    expenses.forEach((e) => {
      const key = e.category || "Other";
      const amount = convert(e.amount, e.currency);
      map.set(key, (map.get(key) || 0) + amount);
    });
    return [...map].map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, [expenses, convert]);

  const months = useMemo(() => {
    const now = new Date();
    const arr = [];
    for (let i = 5; i >= 0; i--) {
      const ref = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const total = expenses
        .filter((e) => {
          const d = new Date(e.date);
          return d.getUTCFullYear() === ref.getUTCFullYear() && d.getUTCMonth() === ref.getUTCMonth();
        })
        .reduce((sum, e) => sum + convert(e.amount, e.currency), 0);
      arr.push({ month: format(ref, "MMM"), total });
    }
    return arr;
  }, [expenses, convert]);

  const grandTotal = useMemo(() => expenses.reduce((sum, e) => sum + convert(e.amount, e.currency), 0), [expenses, convert]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl shadow-2xl">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-sm font-bold text-emerald-400 font-sans">₹{payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-500" />
              Weekly Expenditure
            </h3>
            <div className="text-right">
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">LIVE SYNC</span>
            </div>
          </div>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={last7}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#18181b" />
                <XAxis dataKey="day" stroke="#52525b" fontSize={10} fontWeight={600} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#52525b" fontSize={10} fontWeight={600} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#27272a', strokeWidth: 1 }} />
                <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, stroke: '#09090b', strokeWidth: 2 }} animationDuration={1500} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-8">
              <Activity size={16} className="text-indigo-400" />
              Overview
            </h3>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total Volume</p>
                <p className="text-3xl font-bold text-white mt-1">₹{grandTotal.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total Entries</p>
                <p className="text-3xl font-bold text-white mt-1">{expenses.length}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-zinc-800/50">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Top Spending</p>
            <div className="space-y-3">
              {categoryData.slice(0, 3).map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: COLORS[i] }}></div>
                    <span className="text-xs font-semibold text-zinc-300">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-white">₹{item.value.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-8">
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-8">
            <PieChartIcon size={16} className="text-emerald-500" />
            Category Allocation
          </h3>
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} stroke="none">
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} className="hover:opacity-80 transition-opacity" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-8">
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-8">
            <BarChart3 size={16} className="text-indigo-400" />
            Monthly Growth
          </h3>
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={months}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#18181b" />
                <XAxis dataKey="month" stroke="#52525b" fontSize={10} fontWeight={600} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#52525b" fontSize={10} fontWeight={600} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#18181b' }} />
                <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
