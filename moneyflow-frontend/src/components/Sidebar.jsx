import { NavLink, useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import { 
  LayoutDashboard, 
  PieChart, 
  Clock, 
  User, 
  LogOut, 
  TrendingUp, 
  Wallet,
  Zap,
  Repeat,
  Sparkles
} from "lucide-react";
import { AnimatedText } from "./ui/animated-text";

const LOGO_LOTTIE_URL = "https://lottie.host/81b28d6d-6761-4c6e-8b1b-648b268571bd/9P5f9jDIn9.json";

export default function Sidebar({ setToken }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.dispatchEvent(
      new CustomEvent("auth:token-changed", { detail: "" })
    );

    setToken("");
    navigate("/login");
  };

  const links = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={18} /> },
    { name: "AI Insights", path: "/ai-insights", icon: <Sparkles size={18} className="text-emerald-400" /> },
    { name: "Analytics", path: "/analytics", icon: <PieChart size={18} /> },
    { name: "Month Summary", path: "/month-summary", icon: <Calendar size={18} /> },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-zinc-950 border-r border-zinc-800 p-6 flex flex-col z-50">
      <div className="mb-10 flex items-center gap-2 px-2">
        <div className="w-12 h-12">
          <Lottie 
            animationData={null} 
            path={LOGO_LOTTIE_URL}
            loop={true} 
          />
        </div>
        <AnimatedText 
          text="MoneyFlow AI" 
          textClassName="text-xl font-bold tracking-tight text-white"
          className="items-start gap-0 -ml-2"
          underlineHeight="h-[2px]"
          underlineOffset="-bottom-1"
          underlineGradient="from-emerald-500 to-emerald-900"
          replay={true}
        />
      </div>

      <nav className="flex-1 space-y-1">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-4 mb-4">
          Main Menu
        </p>
        {links.map((l) => (
          <NavLink
            key={l.name}
            to={l.path}
            end
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200
               ${isActive 
                 ? "bg-zinc-900 text-emerald-400 border border-zinc-800 shadow-sm" 
                 : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"}`
            }
          >
            <div className={`transition-colors duration-200`}>
              {l.icon}
            </div>
            <span className="text-sm font-medium">{l.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="pt-6 border-t border-zinc-900">
        <button
          onClick={logout}
          className="group w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Log out</span>
        </button>
      </div>
    </aside>
  );
}
