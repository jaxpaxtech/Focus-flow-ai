
import React from 'react';
import { PlanIcon, ReviewIcon, TipsIcon, MotivationIcon, SettingsIcon, ChartBarIcon, ClockIcon } from './Icons';
import { type Page } from '../types';

interface LeftSidebarProps {
  onQuickAction: (prompt: string) => void;
  onNavigate: (page: Page) => void;
}

const actionItems = [
  { icon: PlanIcon, label: 'AI Console', prompt: '', page: 'console' as Page },
  { icon: ClockIcon, label: 'Study Timer', prompt: '', page: 'timer' as Page },
  { icon: ChartBarIcon, label: 'Study Tracker', prompt: '', page: 'tracker' as Page },
  { icon: ReviewIcon, label: 'Review Progress', prompt: 'Review my progress.' },
  { icon: TipsIcon, label: 'Focus Tips', prompt: 'Give me a focus tip.' },
  { icon: MotivationIcon, label: 'Motivation', prompt: 'Give me some motivation.' },
  { icon: SettingsIcon, label: 'Settings', prompt: 'What can I configure?' },
];

const LeftSidebar: React.FC<LeftSidebarProps> = ({ onQuickAction, onNavigate }) => {
  return (
    <aside className="w-64 p-4 border-r border-[var(--primary-glow)]/20 glass-panel hidden md:flex flex-col space-y-4">
      <h2 className="text-lg font-title text-cyan-400 border-b border-cyan-500/30 pb-2">Quick Actions</h2>
      <nav className="flex-1">
        <ul className="space-y-2">
          {actionItems.map(({ icon: Icon, label, prompt, page }) => (
            <li key={label}>
              <button
                onClick={() => page ? onNavigate(page) : onQuickAction(prompt)}
                className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-300 transition-colors duration-200 group"
              >
                <Icon className="w-6 h-6 text-cyan-500 group-hover:text-cyan-300 transition-colors" />
                <span className="font-semibold">{label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="text-center text-xs text-gray-600 font-mono">
        FocusFlow OS v1.0
      </div>
    </aside>
  );
};

export default LeftSidebar;
