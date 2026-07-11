import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import AIChatbot from "./AI/AIChatbot";
import { Globe } from "./ui/globe";
import GradientMenu from "./ui/gradient-menu";

export default function ProtectedLayout({ token, setToken }) {
  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30 overflow-hidden relative">
      {/* PERSISTENT GLOBE BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-0 opacity-40 overflow-hidden">
        <div className="relative w-full h-full max-w-5xl mx-auto flex items-center justify-center">
          <Globe className="top-0" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(9,9,11,0.8)_80%,#09090b_100%)]"></div>
        </div>
      </div>

      {/* FIXED SIDE NAVIGATION */}
      <aside className="fixed left-10 top-0 h-full w-fit z-50 flex items-center justify-center">
        <div className="h-fit">
            <GradientMenu />
        </div>
        {/* Subtle separator glow */}
        <div className="absolute right-[-20px] top-1/4 h-1/2 w-[1px] bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent opacity-50"></div>
      </aside>

      <div className="flex-1 w-full min-h-screen relative z-10 pl-32 transition-all duration-500">
        <Navbar setToken={setToken} />

        <main className="pt-28 px-8 pb-12">
          <div className="max-w-6xl mx-auto">
            <Outlet context={{ token, setToken }} />
          </div>
        </main>
      </div>

      {/* Global AI Assistant */}
      <AIChatbot token={token} />
    </div>
  );
}
