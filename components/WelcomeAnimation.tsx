import React, { useState, useEffect } from 'react';
import { LogoIcon } from './Icons';

interface WelcomeAnimationProps {
  onAnimationComplete: () => void;
}

const WelcomeAnimation: React.FC<WelcomeAnimationProps> = ({ onAnimationComplete }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timeouts = [
      setTimeout(() => setStep(1), 100),       // Scene 1 starts
      setTimeout(() => setStep(2), 2000),      // Scene 2
      setTimeout(() => setStep(3), 4000),      // Scene 3
      setTimeout(() => setStep(4), 6000),      // Scene 4
      setTimeout(() => setStep(5), 8000),      // Scene 5
      setTimeout(() => onAnimationComplete(), 10500) // End
    ];
    return () => timeouts.forEach(clearTimeout);
  }, [onAnimationComplete]);

  const textStyle = "font-mono text-center transition-opacity duration-1000";

  return (
    <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center overflow-hidden z-50">
      
      {/* Scene 1 & 2: System Wake-up & Identity Boot */}
      <div className={`absolute transition-all duration-1000 ease-in-out ${step >= 3 ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
        {step >= 1 && (
            <div className="flex flex-col items-center justify-center">
                <div 
                    className="w-48 h-48 rounded-full border-2 border-[var(--primary-glow)]"
                    style={{ animation: 'expand-glow 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
                />
                <p className={`${textStyle} mt-8 text-lg animate-[fadeIn_1s_ease-out]`}>
                   Initializing FocusFlow OS...
                </p>
                {step >= 2 && (
                    <div className="mt-4 space-y-1 text-sm text-gray-400">
                        <p className={`${textStyle} animate-[fadeIn_1s_ease-out_.5s_both]`}>AI Cognitive Systems: Online.</p>
                        <p className={`${textStyle} animate-[fadeIn_1s_ease-out_1s_both]`}>Voice Interface: Calibrated.</p>
                        <p className={`${textStyle} animate-[fadeIn_1s_ease-out_1.5s_both]`}>Emotional Intelligence Module: Active.</p>
                    </div>
                )}
            </div>
        )}
      </div>

       {/* Scene 3 & 4: Greeting & Interface Emergence */}
      <div className={`absolute transition-opacity duration-1000 ease-in-out ${step >= 5 ? 'opacity-0' : 'opacity-100'}`}>
         {step >= 3 && (
            <div className="flex flex-col items-center justify-center animate-[fadeIn_1s_ease-out]">
                <LogoIcon className="w-24 h-24 text-[var(--primary-glow)] animate-pulse-glow" />
                 <h1 className="font-title text-4xl mt-4">FocusFlow</h1>
                 <p className={`${textStyle} mt-2`}>Your intelligent study companion.</p>
            </div>
         )}
      </div>

       {/* Scene 4 Panels (visual effect only) */}
       {step === 4 && (
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                <div className="w-1/3 h-3/4 glass-panel animate-[slide-out-left_1.5s_ease-out_forwards]" style={{transformOrigin: 'right'}}></div>
                <div className="w-1/3 h-3/4 glass-panel animate-[fadeIn_1s_ease-out]"></div>
                <div className="w-1/3 h-3/4 glass-panel animate-[slide-out-right_1.5s_ease-out_forwards]" style={{transformOrigin: 'left'}}></div>
            </div>
       )}

      {/* Scene 5: Final Activation */}
      <div className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${step >= 5 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex flex-col h-full">
            <header className="p-4 flex items-center space-x-4 border-b border-[var(--primary-glow)]/20 shadow-[0_4px_30px_rgba(0,255,255,0.1)] glass-panel z-10 animate-[fadeIn_1s_ease-out_500ms_both]">
                <LogoIcon className="h-8 w-8 text-[var(--primary-glow)]" />
                <h1 className="text-xl md:text-2xl font-bold text-cyan-300 font-title tracking-widest">FOCUSFLOW OS</h1>
            </header>
            <div className="flex-1 flex items-center justify-center">
                 <p className="font-mono text-lg text-cyan-300 overflow-hidden">
                   <span className="inline-block animate-text-reveal">System Online. Welcome.</span>
                 </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeAnimation;
