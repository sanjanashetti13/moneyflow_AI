import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PieChart, 
  Zap, 
  Repeat, 
  Clock 
} from 'lucide-react';

const menuItems = [
  { title: 'Dashboard', path: '/', icon: <LayoutDashboard size={24} />, gradientFrom: '#10b981', gradientTo: '#059669' },
  { title: 'Analytics', path: '/analytics', icon: <PieChart size={24} />, gradientFrom: '#3b82f6', gradientTo: '#2563eb' },
  { title: 'AI Insights', path: '/ai-insights', icon: <Zap size={24} />, gradientFrom: '#f59e0b', gradientTo: '#d97706' },
  { title: 'History', path: '/history', icon: <Clock size={24} />, gradientFrom: '#64748b', gradientTo: '#475569' }
];

export default function GradientMenu() {
  const location = useLocation();
  return (
    <div className="flex flex-col items-center bg-transparent py-8">
      <ul className="flex flex-col gap-6">
        {menuItems.map(({ title, path, icon, gradientFrom, gradientTo }, idx) => (
          <NavLink
            key={idx}
            to={path}
            style={{ 
                '--gradient-from': gradientFrom, 
                '--gradient-to': gradientTo 
            }}
            className={({ isActive }) => `
              relative w-[50px] h-[50px] bg-zinc-900 border border-zinc-800 shadow-lg rounded-full flex items-center justify-center transition-all duration-500 hover:w-[150px] hover:shadow-none group cursor-pointer
              ${isActive ? 'w-[150px] ring-2 ring-[var(--gradient-from)]' : ''}
            `}
          >
            {/* Gradient background on hover/active */}
            <span className={`absolute inset-0 rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] transition-all duration-500 group-hover:opacity-100 ${location.pathname === path ? 'opacity-100' : 'opacity-0'}`}></span>
            
            {/* Blur glow */}
            <span className="absolute top-[8px] inset-x-0 h-full rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] blur-[12px] opacity-0 -z-10 transition-all duration-500 group-hover:opacity-50"></span>

            {/* Icon */}
            <span className="relative z-10 transition-all duration-500 group-hover:scale-0 delay-0">
              <span className="text-xl text-zinc-400 group-hover:text-white">{icon}</span>
            </span>

            {/* Title */}
            <span className="absolute text-white uppercase tracking-widest text-[9px] font-black transition-all duration-500 scale-0 group-hover:scale-100 delay-150">
              {title}
            </span>
          </NavLink>
        ))}
      </ul>
    </div>
  );
}
