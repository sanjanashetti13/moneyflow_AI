import NotificationBell from "./ui/NotificationBell";
import { User } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { AnimatedText } from "./ui/animated-text";

export default function Navbar({ setToken }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const location = useLocation();

  const logout = () => {
    localStorage.clear();
    setToken("");
    window.location.href = "/login";
  };

  return (
    <header className="fixed left-0 top-0 z-40 w-full h-20 bg-transparent flex items-center justify-between px-10">
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
        <AnimatedText 
          text="MoneyFlow AI" 
          textClassName="text-white font-black text-xl tracking-tighter hover:scale-105 transition-transform cursor-default"
          underlineHeight="h-[2px]"
          underlineOffset="-bottom-1"
          underlineGradient="from-emerald-500 to-emerald-900"
          replay={true}
        />
      </div>

      <div className="flex items-center gap-8">
        {/* Placeholder for left-side spacing compatibility if needed, but flex-between handles it */}
        <div className="w-10"></div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 border-l border-zinc-800/30 pl-6">
          <NotificationBell />
          
            <Link to="/profile" className="flex items-center gap-3 cursor-pointer hover:bg-zinc-900/50 p-1 rounded-xl transition-all">
              <div className="flex flex-col items-end leading-tight">
                <span className="text-xs font-semibold text-zinc-200">{user.username || "User"}</span>
                <span className="text-[10px] text-zinc-500 font-medium">Free Plan</span>
              </div>

              {user.picture ? (
                <img
                  src={user.picture}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-zinc-800 ring-offset-2 ring-offset-zinc-950"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                  {user.username ? user.username[0].toUpperCase() : "U"}
                </div>
              )}
            </Link>
          </div>
      </div>
    </header>
  );
}
