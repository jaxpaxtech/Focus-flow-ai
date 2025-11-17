

import React, { useMemo } from 'react';
import { type StudySession, type Page } from '../types';
import { ArrowLeftIcon, PlusCircleIcon, DocumentReportIcon, TipsIcon, ChartBarIcon, MotivationIcon } from './Icons';

interface StudyTrackerPageProps {
  studyHistory: StudySession[];
  onNavigate: (page: Page) => void;
  dbError?: string | null;
}

// Sub-component for the main focus ring
const FocusRing: React.FC<{ percentage: number; hours: number; score: number }> = ({ percentage, hours, score }) => {
    const radius = 100;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex flex-col items-center justify-center">
            <svg className="transform -rotate-90" width="240" height="240" viewBox="0 0 240 240">
                <circle className="text-gray-800/50" strokeWidth="12" stroke="currentColor" fill="transparent" r={radius} cx="120" cy="120" />
                <circle
                    className="text-cyan-400 animate-fill"
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ '--stroke-dashoffset': offset } as React.CSSProperties}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="120"
                    cy="120"
                />
            </svg>
            <div className="absolute flex flex-col items-center text-center">
                <span className="font-title text-5xl text-white tracking-tighter">{percentage.toFixed(0)}%</span>
                <span className="text-sm text-gray-400 font-mono">Today's Goal</span>
                <div className="mt-2 border-t border-cyan-500/20 w-2/3 pt-2">
                    <span className="font-mono text-xl text-cyan-300">{hours.toFixed(1)} hrs</span>
                    <p className="text-xs text-purple-300">Focus Score: {score}%</p>
                </div>
            </div>
        </div>
    );
};

// Sub-component for the 7-day bar chart
const BarChart: React.FC<{ data: { day: string; hours: number }[] }> = ({ data }) => {
    const maxHours = Math.max(...data.map(d => d.hours), 4);
    return (
        <div className="flex justify-between items-end h-40 px-2 pb-4 border-b border-l border-gray-700/50 rounded-bl-lg">
            {data.map(({ day, hours }) => (
                <div key={day} className="flex flex-col items-center w-1/8 group">
                    <div
                        className="w-4/5 bg-cyan-500/30 rounded-t-sm hover:bg-cyan-400 transition-all duration-300"
                        style={{ height: `${(hours / maxHours) * 100}%`, minHeight: '2px', boxShadow: '0 0 8px var(--primary-glow)' }}
                    >
                        <span className="text-xs font-mono text-white opacity-0 group-hover:opacity-100 transition-opacity relative -top-5">{hours.toFixed(1)}h</span>
                    </div>
                    <span className="text-xs text-gray-500 mt-1">{day}</span>
                </div>
            ))}
        </div>
    );
};

export const StudyTrackerPage: React.FC<StudyTrackerPageProps> = ({ studyHistory, onNavigate, dbError }) => {
    const today = new Date().toISOString().split('T')[0];

    const {
        totalHoursToday,
        completionPercentage,
        focusScore,
        subjectStats,
        sevenDayData,
        streak
    } = useMemo(() => {
        const todaysSessions = studyHistory.filter(s => s.date === today);
        const totalHours = todaysSessions.reduce((sum, s) => sum + s.duration, 0);
        const completedSessions = todaysSessions.filter(s => s.completed).length;
        const completion = todaysSessions.length > 0 ? (completedSessions / todaysSessions.length) * 100 : 0;
        
        // Calculate Streak
        let currentStreak = 0;
        const uniqueDates = [...new Set<string>(studyHistory.map(s => s.date))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        if (uniqueDates.length > 0) {
            const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

            if (uniqueDates[0] === today || uniqueDates[0] === yesterdayStr) {
                currentStreak = 1;
                for (let i = 0; i < uniqueDates.length - 1; i++) {
                    const currentDate = new Date(uniqueDates[i]);
                    const prevDate = new Date(uniqueDates[i+1]);
                    const diffTime = currentDate.getTime() - prevDate.getTime();
                    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
                    if (diffDays === 1) {
                        currentStreak++;
                    } else {
                        break;
                    }
                }
            }
        }

        const subjectMap = new Map<string, { totalHours: number, count: number, streak: number }>();
        studyHistory.forEach(session => {
            const stats = subjectMap.get(session.subject) || { totalHours: 0, count: 0, streak: 0 };
            stats.totalHours += session.duration;
            stats.count += 1;
            subjectMap.set(session.subject, stats);
        });
        const allSubjectStats = Array.from(subjectMap.entries()).map(([name, data]) => ({ name, ...data }));

        const last7Days = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return {
                day: d.toLocaleDateString('en-US', { weekday: 'short' }),
                hours: studyHistory.filter(s => s.date === d.toISOString().split('T')[0]).reduce((sum, s) => sum + s.duration, 0)
            };
        }).reverse();

        return {
            totalHoursToday: totalHours,
            completionPercentage: completion,
            focusScore: Math.round(completion), // Simplified focus score
            subjectStats: allSubjectStats,
            sevenDayData: last7Days,
            streak: currentStreak
        };
    }, [studyHistory, today]);
    
    if (dbError) {
        return (
            <div className="flex flex-col h-screen bg-[#0A0F12] text-[#E6E6E6] antialiased overflow-hidden animate-[fadeIn_1s_ease-in-out]">
                 <header className="p-4 flex justify-between items-center border-b border-red-500/20 glass-panel z-10">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => onNavigate('console')} className="p-2 rounded-full hover:bg-cyan-500/10 transition-colors">
                            <ArrowLeftIcon className="w-6 h-6 text-cyan-300" />
                        </button>
                        <h1 className="text-xl md:text-2xl font-bold text-red-300 font-title tracking-widest">⚠️ DATABASE ERROR</h1>
                    </div>
                </header>
                <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                     <div className="glass-panel p-8 rounded-lg border border-red-500/50 max-w-2xl w-full">
                        <h2 className="font-title text-2xl text-red-400 mb-4">Could Not Load Study History</h2>
                        <p className="font-mono text-gray-300 bg-red-900/40 p-4 rounded-md">{dbError}</p>
                        <p className="mt-6 text-sm text-gray-400">
                            Please check your Supabase project configuration. The application cannot connect to the required table to store and retrieve study data.
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[#0A0F12] text-[#E6E6E6] antialiased overflow-hidden animate-[fadeIn_1s_ease-in-out]">
            {/* Header */}
            <header className="p-4 flex justify-between items-center border-b border-[var(--primary-glow)]/20 glass-panel z-10">
                <div className="flex items-center space-x-4">
                    <button onClick={() => onNavigate('console')} className="p-2 rounded-full hover:bg-cyan-500/10 transition-colors">
                        <ArrowLeftIcon className="w-6 h-6 text-cyan-300" />
                    </button>
                    <h1 className="text-xl md:text-2xl font-bold text-cyan-300 font-title tracking-widest">📊 STUDY TRACKER</h1>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar */}
                <aside className="w-64 p-4 border-r border-[var(--primary-glow)]/20 glass-panel hidden md:flex flex-col space-y-4">
                     <h2 className="text-lg font-title text-cyan-400 border-b border-cyan-500/30 pb-2">Actions</h2>
                     <ul className="space-y-2">
                        {[
                            { icon: PlusCircleIcon, label: 'Add Session' },
                            { icon: DocumentReportIcon, label: 'Export Report' },
                            { icon: MotivationIcon, label: 'Get Motivation' },
                        ].map(({icon: Icon, label}) => (
                            <li key={label}>
                                <button className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-300 transition-colors duration-200 group">
                                    <Icon className="w-6 h-6 text-cyan-500 group-hover:text-cyan-300 transition-colors" />
                                    <span>{label}</span>
                                </button>
                            </li>
                        ))}
                     </ul>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col overflow-y-auto p-4 md:p-6 space-y-6">
                    <div className="flex justify-center">
                        <FocusRing percentage={completionPercentage} hours={totalHoursToday} score={focusScore} />
                    </div>

                    <h2 className="font-title text-2xl text-cyan-300 border-b border-cyan-500/20 pb-2">Subject Performance</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subjectStats.map((stat, index) => (
                             <div key={stat.name} className="glass-panel p-4 rounded-lg border border-purple-500/30 animate-[slide-in-bottom_0.5s_ease-out_forwards]" style={{animationDelay: `${index * 100}ms`, opacity: 0}}>
                                 <h3 className="font-bold text-lg text-purple-300">{stat.name}</h3>
                                 <p className="font-mono text-3xl text-white my-2">{stat.totalHours.toFixed(1)} <span className="text-lg text-gray-400">hrs</span></p>
                                 <p className="text-sm text-gray-500">{stat.count} sessions logged</p>
                             </div>
                        ))}
                    </div>
                </main>

                {/* Right Sidebar */}
                <aside className="w-80 p-4 border-l border-[var(--primary-glow)]/20 glass-panel hidden lg:flex flex-col space-y-6">
                    <h2 className="text-lg font-title text-cyan-400 border-b border-cyan-500/30 pb-2">AI Insights</h2>
                    <div className="p-3 rounded-lg bg-cyan-900/20 border border-cyan-500/30">
                        <p className="text-sm text-gray-200">
                           You've maintained focus for <strong className="text-cyan-300">{streak} days</strong> straight. Your best performance is in <strong className="text-cyan-300">{subjectStats[0]?.name || '...'}</strong>. Keep up the excellent work.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-300 mb-2">7-Day Activity</h3>
                        <BarChart data={sevenDayData} />
                    </div>
                    <div className="p-3 rounded-lg bg-purple-900/20 border border-purple-500/30 mt-auto">
                        <h3 className="font-semibold text-purple-300 mb-1"><TipsIcon className="w-5 h-5 inline -mt-1"/> Quote of the Day</h3>
                        <p className="text-sm text-gray-300 italic">"The secret of getting ahead is getting started."</p>
                    </div>
                </aside>
            </div>
            
             {/* Footer */}
             <footer className="p-2 border-t border-[var(--primary-glow)]/20 glass-panel text-xs font-mono">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2 text-green-400">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                        <span>AI FOCUS SCORE: {focusScore}% (GOOD)</span>
                    </div>
                    <div className="text-center text-gray-400 hidden sm:block">
                        Consistency builds excellence.
                    </div>
                    <div className="text-cyan-300">
                        STUDY STREAK: 🔥 {streak} DAYS
                    </div>
                </div>
                <div className="text-center text-gray-600 pt-2 mt-2 border-t border-white/10">
                    Developed by Prince
                </div>
            </footer>
        </div>
    );
};