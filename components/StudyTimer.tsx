import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { type Page } from '../types';
import { ArrowLeftIcon, MotivationIcon } from './Icons';

interface StudyTimerProps {
  onNavigate: (page: Page) => void;
  onSessionComplete: (durationMinutes: number) => void;
}

const FOCUS_DURATION = 25 * 60;
const SHORT_BREAK_DURATION = 5 * 60;
const LONG_BREAK_DURATION = 15 * 60;
const SESSIONS_PER_CYCLE = 4;

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const MODE_CONFIG = {
    focus: { duration: FOCUS_DURATION, color: '#00FFFF', label: 'Focus' },
    shortBreak: { duration: SHORT_BREAK_DURATION, color: '#7A00FF', label: 'Short Break' },
    longBreak: { duration: LONG_BREAK_DURATION, color: '#00FF9C', label: 'Long Break' },
};

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const StudyTimer: React.FC<StudyTimerProps> = ({ onNavigate, onSessionComplete }) => {
    const [mode, setMode] = useState<TimerMode>('focus');
    const [secondsLeft, setSecondsLeft] = useState(MODE_CONFIG.focus.duration);
    const [isActive, setIsActive] = useState(false);
    const [sessionsCompleted, setSessionsCompleted] = useState(0);
    const [aiMessage, setAiMessage] = useState("Ready when you are. Let's begin a focus session.");

    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const progress = (secondsLeft / MODE_CONFIG[mode].duration) * circumference;
    const offset = circumference - progress;

    const nextMode = useCallback(() => {
        if (mode === 'focus') {
            onSessionComplete(MODE_CONFIG.focus.duration / 60);
            const newSessionsCompleted = sessionsCompleted + 1;
            setSessionsCompleted(newSessionsCompleted);
            if (newSessionsCompleted % SESSIONS_PER_CYCLE === 0) {
                setMode('longBreak');
                setSecondsLeft(MODE_CONFIG.longBreak.duration);
                 setAiMessage("Outstanding consistency! Take a well-deserved long break.");
            } else {
                setMode('shortBreak');
                setSecondsLeft(MODE_CONFIG.shortBreak.duration);
                setAiMessage("Focus session complete. Take a deep breath—you earned this break.");
            }
        } else { // After any break
            setMode('focus');
            setSecondsLeft(MODE_CONFIG.focus.duration);
            setAiMessage("Break's over. Time to lock in for another productive session.");
        }
        setIsActive(false);
    }, [mode, sessionsCompleted, onSessionComplete]);

    useEffect(() => {
        let interval: number | null = null;
        if (isActive) {
            if (secondsLeft <= 0) {
                nextMode();
            } else {
                 interval = window.setInterval(() => {
                    setSecondsLeft(prev => prev - 1);
                }, 1000);
            }
        }
        return () => {
            if (interval) window.clearInterval(interval);
        };
    }, [isActive, secondsLeft, nextMode]);

    const handleStartPause = () => {
        setIsActive(!isActive);
        if(!isActive) {
            setAiMessage("Timer initiated. Let’s lock in and make these minutes matter.");
        } else {
            setAiMessage("Paused. Take a moment and resume when you're ready.");
        }
    };
    
    const handleReset = () => {
        setIsActive(false);
        setSecondsLeft(MODE_CONFIG[mode].duration);
        setAiMessage("Timer reset. Ready for a fresh start.");
    };

    const currentModeConfig = useMemo(() => MODE_CONFIG[mode], [mode]);

    return (
        <div className="flex flex-col h-screen bg-[#0A0F12] text-[#E6E6E6] antialiased overflow-hidden animate-[fadeIn_1s_ease-in-out]">
            <div 
              className="absolute inset-0 transition-all duration-1000 ease-in-out animate-[background-glow-pulse_10s_infinite]" 
              style={{ '--timer-glow-color': `${currentModeConfig.color}22` } as React.CSSProperties}
            ></div>
            <header className="p-4 flex justify-between items-center border-b border-[var(--primary-glow)]/20 glass-panel z-10 relative">
                <div className="flex items-center space-x-4">
                    <button onClick={() => onNavigate('console')} className="p-2 rounded-full hover:bg-cyan-500/10 transition-colors">
                        <ArrowLeftIcon className="w-6 h-6 text-cyan-300" />
                    </button>
                    <h1 className="text-xl md:text-2xl font-bold text-cyan-300 font-title tracking-widest">⏱️ AI STUDY TIMER</h1>
                </div>
            </header>
            
            <main className="flex-1 flex flex-col items-center justify-center p-4 text-center z-10 relative">
                <div className="relative mb-8">
                    <svg className="transform -rotate-90" width="300" height="300" viewBox="0 0 280 280">
                         <circle className="text-gray-800/50" strokeWidth="15" stroke="currentColor" fill="transparent" r={radius} cx="140" cy="140" />
                         <circle
                            className="transition-all duration-500 ease-linear animate-glow-border"
                            strokeWidth="15"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            style={{ 
                                stroke: currentModeConfig.color, 
                                '--timer-glow-color': currentModeConfig.color 
                            } as React.CSSProperties}
                            strokeLinecap="round"
                            fill="transparent"
                            r={radius}
                            cx="140"
                            cy="140"
                        />
                    </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-mono text-6xl text-white tracking-tighter">{formatTime(secondsLeft)}</span>
                        <span className="font-title text-lg uppercase tracking-widest mt-2" style={{color: currentModeConfig.color}}>{currentModeConfig.label}</span>
                    </div>
                </div>
                
                <div className="flex space-x-4 mb-8">
                    <button onClick={handleStartPause} className="px-8 py-3 font-bold text-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 rounded-full hover:bg-cyan-500/40 hover:shadow-[0_0_15px_var(--primary-glow)] transition-all">
                        {isActive ? 'PAUSE' : 'START'}
                    </button>
                    <button onClick={handleReset} className="px-8 py-3 font-bold text-lg bg-gray-500/20 text-gray-300 border border-gray-500/50 rounded-full hover:bg-gray-500/40 transition-all">
                        RESET
                    </button>
                </div>

                 <div className="h-16 glass-panel rounded-lg p-4 flex items-center justify-center max-w-xl w-full">
                    <p className="font-mono text-center text-gray-300 italic">
                        <span style={{color: currentModeConfig.color}}>AI: </span> "{aiMessage}"
                    </p>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-4 text-left font-mono text-lg">
                    <div className="text-gray-400">Sessions Completed: <span className="text-white font-bold">{sessionsCompleted}</span></div>
                    <div className="text-gray-400">Cycle Progress: <span className="text-white font-bold">{sessionsCompleted % SESSIONS_PER_CYCLE} / {SESSIONS_PER_CYCLE}</span></div>
                </div>
            </main>
        </div>
    );
};

export default StudyTimer;