import React, { useMemo } from 'react';
import { type Session } from '@supabase/supabase-js';
import { type StudySession, type StudyPlan, type Page } from '../types';
import { BookOpenIcon, ClockIcon, TrendingUpIcon, TipsIcon, ChartBarIcon } from './Icons';

interface DashboardPageProps {
    session: Session | null;
    studyHistory: StudySession[];
    studyPlan: StudyPlan | null;
    onNavigate: (page: Page) => void;
    onQuickAction: (prompt: string) => void;
}

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; color: string }> = ({ icon, title, value, color }) => (
    <div className="glass-panel p-4 rounded-lg flex items-center space-x-4 border border-white/10">
        <div className={`p-3 rounded-full`} style={{ backgroundColor: `${color}20`, border: `1px solid ${color}80` }}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const DashboardPage: React.FC<DashboardPageProps> = ({ session, studyHistory, studyPlan, onNavigate, onQuickAction }) => {
    const userName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'Operator';
    const today = new Date();

    const stats = useMemo(() => {
        const totalHours = studyHistory.reduce((sum, s) => sum + s.duration, 0);
        const totalSessions = studyHistory.length;

        // Calculate Streak
        let streak = 0;
        // FIX: Add explicit types to sort callback parameters to avoid type inference issues with `new Date()`.
        const uniqueDates = [...new Set(studyHistory.map(s => s.date))].sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime());
        if (uniqueDates.length > 0) {
            const todayStr = new Date().toISOString().split('T')[0];
            const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

            if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
                streak = 1;
                for (let i = 0; i < uniqueDates.length - 1; i++) {
                    const currentDate = new Date(uniqueDates[i]);
                    const prevDate = new Date(uniqueDates[i+1]);
                    const diffTime = currentDate.getTime() - prevDate.getTime();
                    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
                    if (diffDays === 1) {
                        streak++;
                    } else {
                        break;
                    }
                }
            }
        }
        
        return {
            totalHours: totalHours.toFixed(1),
            totalSessions: totalSessions.toString(),
            streak: streak.toString(),
        };
    }, [studyHistory]);

    const recentSessions = useMemo(() => {
        return [...studyHistory]
            .sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime())
            .slice(0, 4);
    }, [studyHistory]);

    return (
        <main className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto bg-black/20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-[fadeIn_0.5s_ease-out]">
                
                {/* Welcome Header */}
                <div className="lg:col-span-3 glass-panel p-6 rounded-lg border border-cyan-500/20 flex justify-between items-center">
                    <div>
                        <h1 className="font-title text-3xl text-cyan-300 tracking-wider">Welcome, {userName}</h1>
                        <p className="text-gray-400 font-mono mt-1">{today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <button 
                        onClick={() => onQuickAction('Generate a study plan for today.')}
                        className="px-6 py-3 font-bold bg-cyan-500/80 text-white rounded-lg border border-cyan-400 hover:bg-cyan-400 hover:shadow-[0_0_15px_var(--primary-glow)] transition-all transform hover:scale-105 hidden sm:block"
                    >
                        Plan Today's Session
                    </button>
                </div>

                {/* Stat Cards */}
                <StatCard icon={<ClockIcon className="w-6 h-6 text-cyan-300"/>} title="Total Hours" value={stats.totalHours} color="#00FFFF" />
                <StatCard icon={<BookOpenIcon className="w-6 h-6 text-purple-300"/>} title="Sessions Logged" value={stats.totalSessions} color="#7A00FF" />
                <StatCard icon={<TrendingUpIcon className="w-6 h-6 text-green-300"/>} title="Study Streak" value={`${stats.streak} Days`} color="#00FF9C" />

                {/* Quick Actions & AI Insight */}
                <div className="lg:col-span-2 glass-panel p-6 rounded-lg border border-white/10">
                     <h2 className="font-title text-xl text-cyan-400 border-b border-cyan-500/30 pb-2 mb-4">Core Modules</h2>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button onClick={() => onNavigate('timer')} className="p-6 bg-gray-900/50 rounded-lg text-left hover:bg-cyan-900/40 hover:border-cyan-500/50 border border-transparent transition-all">
                             <ClockIcon className="w-8 h-8 text-cyan-400 mb-2"/>
                             <h3 className="font-bold text-lg text-white">Study Timer</h3>
                             <p className="text-sm text-gray-400">Launch Pomodoro timer for focused sessions.</p>
                        </button>
                         <button onClick={() => onNavigate('tracker')} className="p-6 bg-gray-900/50 rounded-lg text-left hover:bg-cyan-900/40 hover:border-cyan-500/50 border border-transparent transition-all">
                             <ChartBarIcon className="w-8 h-8 text-cyan-400 mb-2"/>
                             <h3 className="font-bold text-lg text-white">View Tracker</h3>
                             <p className="text-sm text-gray-400">Analyze your progress and performance.</p>
                        </button>
                     </div>
                </div>

                <div className="glass-panel p-6 rounded-lg border border-purple-500/30 flex flex-col justify-center">
                    <h2 className="font-title text-xl text-purple-300 border-b border-purple-500/30 pb-2 mb-4 flex items-center gap-2"><TipsIcon className="w-5 h-5"/> AI Insight</h2>
                    <p className="text-gray-300 italic">"{studyPlan?.studyTip || studyPlan?.motivation || 'Generate a plan to receive a personalized tip.'}"</p>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-3 glass-panel p-6 rounded-lg border border-white/10">
                    <h2 className="font-title text-xl text-cyan-400 border-b border-cyan-500/30 pb-2 mb-4">Recent Activity</h2>
                    <div className="space-y-3">
                        {recentSessions.length > 0 ? recentSessions.map(s => (
                            <div key={s.id} className="flex justify-between items-center p-3 bg-gray-900/50 rounded-md font-mono">
                               <div>
                                    <p className="font-bold text-cyan-300">{s.subject}</p>
                                    <p className="text-xs text-gray-500">{new Date(s.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                               </div>
                               <div className="text-right">
                                    <p className="font-bold text-white">{s.duration} hrs</p>
                                    {s.completed ? <span className="text-xs text-green-400">Completed</span> : <span className="text-xs text-yellow-400">Partial</span>}
                               </div>
                            </div>
                        )) : (
                            <p className="text-gray-500 text-center py-4">No recent sessions logged. Start a timer or generate a plan!</p>
                        )}
                    </div>
                </div>

            </div>
        </main>
    );
};

export default DashboardPage;