import React from 'react';

interface BottomBarProps {
  motivation?: string | null;
}

export const BottomBar: React.FC<BottomBarProps> = ({ motivation }) => {
  return (
    <footer className="p-2 border-t border-[var(--primary-glow)]/20 glass-panel text-xs font-mono">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2 text-cyan-300">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
          <span>AI SYNC: ACTIVE</span>
        </div>
        
        {motivation && (
          <div className="text-center text-gray-400 hidden sm:block truncate px-4">
              <span className="text-purple-300">MOTIVATION: </span>{motivation}
          </div>
        )}

        <div className="text-gray-500">
          STUDY STREAK: 1 DAY
        </div>
      </div>
      <div className="text-center text-gray-600 pt-2 mt-2 border-t border-white/10">
        FocusFlow: Your AI Study Planner
      </div>
    </footer>
  );
};
