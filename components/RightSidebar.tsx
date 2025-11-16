import React from 'react';
import { type StudyPlan, type StudyPlanSubject } from '../types';
import { CheckCircleIcon, CircleIcon } from './Icons';

interface RightSidebarProps {
  studyPlan: StudyPlan | null;
  onStartSession: (subject: StudyPlanSubject) => void;
  activeSessionSubject: string | undefined;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ studyPlan, onStartSession, activeSessionSubject }) => {
  if (!studyPlan) {
    return (
        <aside className="w-80 p-4 border-l border-[var(--primary-glow)]/20 glass-panel hidden lg:flex flex-col">
            <h2 className="text-lg font-title text-cyan-400 border-b border-cyan-500/30 pb-2">Study Overview</h2>
            <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-500 font-mono text-center">Generate a study plan to see your overview here.</p>
            </div>
        </aside>
    );
  }

  const { totalTime, subjects, studyTip } = studyPlan;
  const completedCount = subjects.filter(s => s.completed).length;
  const progressPercentage = subjects.length > 0 ? (completedCount / subjects.length) * 100 : 0;

  return (
    <aside className="w-80 p-4 border-l border-[var(--primary-glow)]/20 glass-panel hidden lg:flex flex-col space-y-4 overflow-y-auto">
      <h2 className="text-lg font-title text-cyan-400 border-b border-cyan-500/30 pb-2">Daily Plan</h2>
      
      <div>
        <h3 className="font-semibold text-gray-300 mb-2">Total Study Time: {totalTime}</h3>
        <div className="w-full bg-gray-700/50 rounded-full h-2.5">
          <div 
            className="bg-cyan-400 h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${progressPercentage}%`, boxShadow: '0 0 8px var(--primary-glow)' }}
          ></div>
        </div>
        <p className="text-right text-xs mt-1 font-mono text-cyan-300">{completedCount}/{subjects.length} Tasks Done</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-2">
        <h3 className="font-semibold text-gray-300">Timeline</h3>
        {subjects.map((item, index) => (
          <button 
            key={index} 
            onClick={() => onStartSession(item)}
            disabled={item.completed || !!activeSessionSubject}
            className={`w-full flex items-start space-x-3 p-3 bg-gray-900/50 rounded-md border text-left transition-all duration-200
              ${item.completed 
                ? 'border-green-500/30 opacity-60 cursor-not-allowed' 
                : 'border-gray-700/50 hover:bg-cyan-900/40 hover:border-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed'}
              ${activeSessionSubject === item.subject ? 'border-cyan-400 ring-2 ring-cyan-400' : ''}  
            `}
          >
            <div className={`mt-1 ${item.completed ? 'text-green-400' : 'text-cyan-400'}`}>
                {item.completed ? <CheckCircleIcon className="w-5 h-5" /> : <CircleIcon className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-bold text-white">{item.subject} <span className="text-xs font-mono text-gray-400">({item.duration})</span></p>
              <p className="text-sm text-gray-400">{item.topic}</p>
            </div>
          </button>
        ))}
      </div>
      
      <div className="p-3 rounded-lg bg-purple-900/20 border border-purple-500/30">
        <h3 className="font-semibold text-purple-300 mb-1">💡 Study Tip</h3>
        <p className="text-sm text-gray-300">{studyTip}</p>
      </div>
    </aside>
  );
};

export default RightSidebar;
