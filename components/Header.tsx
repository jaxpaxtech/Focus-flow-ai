
import React from 'react';
import { type AppMode, type Page } from '../types';
import { LogoIcon, MessageIcon, MicIcon, LogoutIcon, UserIcon } from './Icons';

interface HeaderProps {
  currentMode: AppMode;
  currentPage: Page;
  onModeChange: (mode: AppMode) => void;
  onNavigate: (page: Page) => void;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentMode, currentPage, onModeChange, onNavigate, onLogout }) => {
  const date = new Date();
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const day = date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  const handleConsoleClick = (mode: AppMode) => {
    onNavigate('console');
    onModeChange(mode);
  };

  return (
    <header className="p-4 flex justify-between items-center border-b border-[var(--primary-glow)]/20 shadow-[0_4px_30px_rgba(0,255,255,0.1)] glass-panel z-10">
      <div className="flex items-center space-x-4">
        <div className="text-[var(--primary-glow)] animate-pulse-glow">
          <LogoIcon className="h-8 w-8" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-cyan-300 font-title tracking-widest">FOCUSFLOW OS</h1>
      </div>
      
      <div className="hidden md:flex flex-col items-center text-center">
        <p className="font-mono text-sm text-cyan-300">FOCUS STATUS: ONLINE</p>
        <p className="text-xs text-gray-400">{day} // {time}</p>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center border border-cyan-500/30 rounded-full p-1">
          <button
            onClick={() => onNavigate('dashboard')}
            aria-label="Switch to Dashboard"
            className={`px-3 py-1.5 text-sm font-semibold rounded-full flex items-center space-x-2 transition-all duration-300 ${
              currentPage === 'dashboard'
                ? 'bg-cyan-500/20 text-cyan-300 shadow-[0_0_15px_rgba(0,255,255,0.3)]'
                : 'text-gray-400 hover:bg-cyan-500/10'
            }`}
          >
            <UserIcon className="w-5 h-5" />
            <span className="hidden md:inline">Dashboard</span>
          </button>
          <button
            onClick={() => handleConsoleClick('text')}
            aria-label="Switch to Text Chat"
            className={`px-3 py-1.5 text-sm font-semibold rounded-full flex items-center space-x-2 transition-all duration-300 ${
              currentPage === 'console' && currentMode === 'text'
                ? 'bg-cyan-500/20 text-cyan-300 shadow-[0_0_15px_rgba(0,255,255,0.3)]'
                : 'text-gray-400 hover:bg-cyan-500/10'
            }`}
          >
            <MessageIcon className="w-5 h-5" />
            <span className="hidden md:inline">Console</span>
          </button>
          <button
            onClick={() => handleConsoleClick('voice')}
            aria-label="Switch to Voice Chat"
            className={`px-3 py-1.5 text-sm font-semibold rounded-full flex items-center space-x-2 transition-all duration-300 ${
              currentPage === 'console' && currentMode === 'voice'
                ? 'bg-cyan-500/20 text-cyan-300 shadow-[0_0_15px_rgba(0,255,255,0.3)]'
                : 'text-gray-400 hover:bg-cyan-500/10'
            }`}
          >
            <MicIcon className="w-5 h-5" />
            <span className="hidden md:inline">Voice</span>
          </button>
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            aria-label="Logout"
            className="p-2 rounded-full text-gray-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogoutIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
