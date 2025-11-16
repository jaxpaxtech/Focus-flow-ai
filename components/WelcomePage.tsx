import React from 'react';
import Header from './Header';
import { BottomBar } from './BottomBar';
import { LogoIcon } from './Icons';

interface WelcomePageProps {
  onInitialise: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onInitialise }) => {
  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] text-white animate-[fadeIn_1s_ease-in-out]">
      {/* Header is reused, but mode change is disabled for this page */}
      <Header currentMode="text" currentPage="dashboard" onModeChange={() => {}} onNavigate={() => {}} />
      <main className="flex-1 flex flex-col items-center justify-center text-center p-4 relative overflow-hidden">
        {/* Background decorative glowing effects */}
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-500/10 rounded-full blur-3xl animate-pulse [animation-delay:2s]"></div>

        <div className="relative z-10 glass-panel p-8 md:p-12 rounded-2xl border border-cyan-500/20 shadow-2xl shadow-cyan-500/10 max-w-2xl">
          <LogoIcon className="w-20 h-20 text-cyan-300 mx-auto mb-4 animate-pulse-glow" />
          <h1 className="font-title text-4xl md:text-5xl text-cyan-300 tracking-widest">Welcome, Operator</h1>
          <p className="mt-4 text-gray-300 max-w-md mx-auto font-mono">
            FocusFlow OS is ready for deployment. Engage the system to begin optimizing your cognitive workflow and enhancing productivity.
          </p>
          <button
            onClick={onInitialise}
            aria-label="Initialise System"
            className="mt-8 px-10 py-4 font-bold text-lg bg-cyan-500/80 text-white rounded-lg border-2 border-cyan-400
                       hover:bg-cyan-400 hover:shadow-[0_0_20px_var(--primary-glow)] transition-all duration-300
                       transform hover:scale-105 animate-pulse-glow"
          >
            Initialise System
          </button>
        </div>
      </main>
      {/* BottomBar is reused with a custom message */}
      <BottomBar motivation="Awaiting initialisation signal..." />
    </div>
  );
};

export default WelcomePage;
