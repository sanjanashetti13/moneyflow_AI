import React, { useEffect, useRef } from 'react';

const DynamicBorderCard = ({ children, title, icon }) => {
  const topRef = useRef(null);
  const rightRef = useRef(null);
  const bottomRef = useRef(null);
  const leftRef = useRef(null);
  
  useEffect(() => {
    const animateBorder = () => {
      const now = Date.now() / 1000;
      const speed = 0.5; // Animation speed
      
      // Calculate positions based on time
      const topX = Math.sin(now * speed) * 100;
      const rightY = Math.cos(now * speed) * 100;
      const bottomX = Math.sin(now * speed + Math.PI) * 100;
      const leftY = Math.cos(now * speed + Math.PI) * 100;
      
      // Apply positions to elements
      if (topRef.current) topRef.current.style.transform = `translateX(${topX}%)`;
      if (rightRef.current) rightRef.current.style.transform = `translateY(${rightY}%)`;
      if (bottomRef.current) bottomRef.current.style.transform = `translateX(${bottomX}%)`;
      if (leftRef.current) leftRef.current.style.transform = `translateY(${leftY}%)`;
      
      requestAnimationFrame(animateBorder);
    };
    
    const animationId = requestAnimationFrame(animateBorder);
    return () => cancelAnimationFrame(animationId);
  }, []);
  
  return (
    <div className="relative w-full bg-zinc-950/50 border border-zinc-900 rounded-2xl p-6 overflow-hidden shadow-2xl group hover:scale-[1.02] transition-all duration-500">
      {/* Animated border elements */}
      <div className="absolute top-0 left-0 w-full h-[1px] overflow-hidden">
        <div 
          ref={topRef}
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"
        ></div>
      </div>
      
      <div className="absolute top-0 right-0 w-[1px] h-full overflow-hidden">
        <div 
          ref={rightRef}
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-emerald-500/50 to-transparent"
        ></div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-[1px] overflow-hidden">
        <div 
          ref={bottomRef}
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"
        ></div>
      </div>
      
      <div className="absolute top-0 left-0 w-[1px] h-full overflow-hidden">
        <div 
          ref={leftRef}
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-emerald-500/50 to-transparent"
        ></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:animate-[float_3s_ease-in-out_infinite]">
              {icon}
            </div>
            <h3 className="font-black text-white text-[10px] uppercase tracking-widest">{title}</h3>
        </div>
        
        <p className="text-zinc-400 text-sm font-medium leading-relaxed italic">
          "{children}"
        </p>

      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
      <div className="absolute bottom-2 left-2 w-1 h-1 rounded-full bg-emerald-700 animate-pulse"></div>
    </div>
  );
};

export default DynamicBorderCard;
