import React from 'react';
import { Rocket } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0d0d14] z-[9999]">
      <div className="relative flex flex-col items-center">
        {/* Pulsing glow behind the logo */}
        <div className="absolute inset-0 bg-[#7F77DD] blur-[50px] opacity-20 rounded-full animate-pulse"></div>
        
        {/* Logo container */}
        <div className="relative w-20 h-20 bg-gradient-to-br from-[#7F77DD] to-[#534AB7] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(127,119,221,0.3)] animate-bounce mb-8">
          <Rocket className="w-10 h-10 text-white" />
        </div>
        
        {/* Loading text */}
        <div className="flex flex-col items-center">
          <h2 className="text-white text-xl font-bold tracking-wider mb-2">LEARNING SPACE</h2>
          <div className="flex items-center gap-1.5">
            <span className="text-white/60 text-sm font-medium tracking-widest uppercase">Initializing</span>
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-[#7F77DD] rounded-full animate-[bounce_1s_infinite_0ms]"></span>
              <span className="w-1.5 h-1.5 bg-[#7F77DD] rounded-full animate-[bounce_1s_infinite_200ms]"></span>
              <span className="w-1.5 h-1.5 bg-[#7F77DD] rounded-full animate-[bounce_1s_infinite_400ms]"></span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
