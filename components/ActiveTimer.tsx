import React, { useState, useEffect } from 'react';
import { type ActiveTimerSession } from '../types';
import { StopIcon } from './Icons';

interface ActiveTimerProps {
    session: ActiveTimerSession;
    onEndSession: (timeLeft: number, completed: boolean) => void;
}

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const ActiveTimer: React.FC<ActiveTimerProps> = ({ session, onEndSession }) => {
    const [timeLeft, setTimeLeft] = useState(session.timeLeft);

    useEffect(() => {
        setTimeLeft(session.timeLeft); // Reset timer if session prop changes
        
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onEndSession(0, true); // Session completed successfully
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [session.timeLeft, onEndSession]);

    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const progress = (timeLeft / session.duration);
    const offset = circumference * (1 - progress);

    return (
        <div className="absolute inset-0 z-20 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center animate-[fadeIn_0.5s_ease-out]">
            <div className="relative flex flex-col items-center justify-center p-8 glass-panel rounded-2xl border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(0,255,255,0.3)]">
                
                {/* Timer Ring */}
                <div className="relative">
                    <svg className="transform -rotate-90" width="160" height="160" viewBox="0 0 140 140">
                        <circle className="text-gray-700/50" strokeWidth="8" stroke="currentColor" fill="transparent" r={radius} cx="70" cy="70" />
                        <circle
                            className="text-cyan-400 transition-all duration-1000 ease-linear"
                            strokeWidth="8"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            style={{ filter: 'drop-shadow(0 0 5px #00FFFF)' }}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r={radius}
                            cx="70"
                            cy="70"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-mono text-4xl text-white tracking-tighter">{formatTime(timeLeft)}</span>
                        <span className="text-sm text-gray-400">Remaining</span>
                    </div>
                </div>

                {/* Session Info */}
                <div className="text-center mt-6">
                    <p className="font-title text-xl text-cyan-300 tracking-wide">{session.subject}</p>
                    <p className="text-gray-400">{session.topic}</p>
                </div>

                {/* Stop Button */}
                <button 
                    onClick={() => onEndSession(timeLeft, false)} // Session ended early by user
                    className="mt-6 px-6 py-2 flex items-center space-x-2 bg-red-500/20 text-red-300 border border-red-500/50 rounded-full hover:bg-red-500/40 hover:shadow-[0_0_15px_rgba(255,0,0,0.4)] transition-all"
                >
                    <StopIcon className="w-5 h-5" />
                    <span>End Session</span>
                </button>
            </div>
        </div>
    );
};

export default ActiveTimer;
