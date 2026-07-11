import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp } from "lucide-react";

export default function GoogleCallback({ setToken }) {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const email = params.get("email");
    const backendName = params.get("name");
    const userId = params.get("userId");

    if (!token) {
      navigate("/login");
      return;
    }

    const existingUser = JSON.parse(localStorage.getItem("user") || "{}");
    localStorage.setItem("token", token);

    const userObj = {
      id: userId || existingUser.id || "",
      email: email || existingUser.email || "",
      username: backendName?.trim() !== "" ? backendName : (existingUser.username || ""),
      base_currency: existingUser.base_currency || "INR",
    };

    localStorage.setItem("user", JSON.stringify(userObj));
    if (typeof setToken === "function") setToken(token);
    window.dispatchEvent(new CustomEvent("auth:token-changed", { detail: token }));

    setTimeout(() => {
      if (!userObj.username) {
        navigate("/setup-username");
      } else {
        navigate("/");
      }
    }, 1500); // Give user a moment to see the premium loader
  }, [setToken, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 font-sans selection:bg-emerald-500/30 px-4">
      <div className="flex flex-col items-center animate-in fade-in duration-700">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-zinc-950 mb-8 shadow-2xl shadow-emerald-500/20 animate-bounce">
          <TrendingUp size={36} strokeWidth={2.5} />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight animate-pulse">Authenticating with Google</h2>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mt-3">Please wait a moment...</p>
        
        <div className="mt-12 w-48 h-1 bg-zinc-900 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 animate-progress origin-left"></div>
        </div>
      </div>
    </div>
  );
}
