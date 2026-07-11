import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { format, startOfDay, subDays } from "date-fns";
import { useOutletContext } from "react-router-dom";
import { Clock, Calendar, ChevronRight, Tag, ArrowRight, Activity } from "lucide-react";

export default function History() {
  const { token } = useOutletContext();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!token) return;
    let mounted = true;

    const load = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/expenses`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (mounted) {
          setExpenses(res.data || []);
          setLoading(false);
        }
      } catch (err) {
        console.error("History load error:", err);
      }
    };

    load();
    return () => (mounted = false);
  }, [token, API_URL]);

  const toLocal = (dateStr) => new Date(dateStr);

  const last7Group = useMemo(() => {
    const out = [];
    for (let i = 0; i < 7; i++) {
      const day = subDays(new Date(), i);
      const start = startOfDay(day).getTime();
      const end = start + 24 * 3600 * 1000 - 1;

      const items = expenses
        .filter((e) => {
          const d = toLocal(e.date).getTime();
          return d >= start && d <= end;
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      out.push({
        date: new Date(start),
        items,
      });
    }
    return out;
  }, [expenses]);

  const monthly = useMemo(() => {
    const map = new Map();
    expenses.forEach((e) => {
      const d = toLocal(e.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(e);
    });

    return [...map.entries()]
      .map(([k, items]) => {
        const [y, m] = k.split("-");
        return { year: Number(y), month: Number(m), items };
      })
      .sort((a, b) => (b.year - a.year) || (b.month - a.month));
  }, [expenses]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-pulse text-zinc-500 font-medium">Fetching history...</div>
    </div>
  );

  return (
    <div className="space-y-12 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <section className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <Clock size={16} className="text-emerald-500" />
            Recent Activity
          </h2>
          <span className="text-[10px] font-bold text-zinc-600">PAST 7 DAYS</span>
        </div>

        <div className="space-y-8">
          {last7Group.map((g) => (
            <div key={g.date.toISOString()} className="relative">
              <div className="sticky top-20 z-10 py-2 bg-zinc-950/80 backdrop-blur-sm mb-4">
                <h3 className="text-xs font-bold text-zinc-400 flex items-center gap-2">
                  <Calendar size={12} />
                  {format(g.date, "EEEE, MMMM do")}
                </h3>
              </div>

              {g.items.length === 0 ? (
                <div className="pl-6 border-l border-zinc-900 ml-1.5 py-4">
                  <p className="text-xs text-zinc-600 italic">No transactions recorded for this day.</p>
                </div>
              ) : (
                <div className="space-y-3 pl-6 border-l border-zinc-900 ml-1.5 pt-2 pb-6">
                  {g.items.map((it) => (
                    <div key={it._id} className="group glass-card p-4 flex items-center justify-between hover:bg-zinc-900 transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-zinc-800/50 rounded-lg flex items-center justify-center text-zinc-400 border border-zinc-700/30 group-hover:border-zinc-500 transition-all">
                          <Tag size={16} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white tracking-tight">{it.category}</div>
                          {it.note && <div className="text-[11px] text-zinc-500 mt-0.5">{it.note}</div>}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-bold text-emerald-400">₹{Number(it.amount).toLocaleString('en-IN')}</div>
                          <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">
                            {format(toLocal(it.date), "hh:mm a")}
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-zinc-800 group-hover:text-zinc-400 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6 pt-12 border-t border-zinc-900">
        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 px-1">
          <Activity size={16} className="text-indigo-400" />
          Archive
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {monthly.map((m) => (
            <div key={`${m.year}-${m.month}`} className="group glass-card p-6 hover:bg-zinc-900 transition-all cursor-pointer border-l-4 border-l-zinc-800 hover:border-l-indigo-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                    {new Date(m.year, m.month).toLocaleString(undefined, {
                      month: "long",
                      year: "numeric",
                    })}
                  </h3>
                  <div className="text-[11px] font-bold text-zinc-500 mt-1 uppercase tracking-wider">
                    {m.items.length} Transactions
                  </div>
                </div>
                <div className="text-right">
                <div className="text-lg font-bold text-white">
                  ₹{m.items.reduce((s, x) => s + Number(x.amount || 0), 0).toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Total Spent</div>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between text-[10px] font-bold text-indigo-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                <span>View Full Report</span>
                <ArrowRight size={12} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
