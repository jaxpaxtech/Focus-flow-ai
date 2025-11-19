
import React from 'react';
import { LogoIcon } from './Icons';

interface DeploymentErrorPageProps {
  missingGeminiKey: boolean;
  missingSupabaseConfig: boolean;
}

const DeploymentErrorPage: React.FC<DeploymentErrorPageProps> = ({ missingGeminiKey, missingSupabaseConfig }) => {
  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] text-white items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500"></div>
        
        <div className="max-w-2xl w-full relative z-10">
            <div className="flex items-center justify-center mb-8 animate-pulse">
                <LogoIcon className="w-16 h-16 text-red-500" />
            </div>
            
            <div className="glass-panel p-8 md:p-10 rounded-xl border border-red-500/30 shadow-[0_0_50px_rgba(220,38,38,0.1)]">
                <h1 className="font-title text-3xl text-red-400 mb-2 tracking-widest text-center">DEPLOYMENT ERROR</h1>
                <p className="font-mono text-center text-gray-400 mb-8 text-sm">SYSTEM CONFIGURATION INCOMPLETE</p>

                <div className="space-y-6">
                    {missingGeminiKey && (
                        <div className="bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r">
                            <h3 className="text-red-300 font-bold mb-1">Missing Gemini API Key</h3>
                            <p className="text-gray-300 text-sm mb-2">
                                The environment variable <code className="bg-black/30 px-1 rounded text-red-200">API_KEY</code> is not set.
                            </p>
                            <p className="text-gray-400 text-xs">
                                To fix this, add your Google GenAI API key to your environment variables or `.env` file.
                            </p>
                        </div>
                    )}

                    {missingSupabaseConfig && (
                        <div className="bg-orange-900/20 border-l-4 border-orange-500 p-4 rounded-r">
                            <h3 className="text-orange-300 font-bold mb-1">Invalid Supabase Configuration</h3>
                            <p className="text-gray-300 text-sm mb-2">
                                The Supabase URL or Anon Key in <code className="bg-black/30 px-1 rounded text-orange-200">services/supabase.ts</code> is still set to the default placeholder.
                            </p>
                            <p className="text-gray-400 text-xs">
                                Please update <code className="text-orange-200">supabaseUrl</code> and <code className="text-orange-200">supabaseAnonKey</code> with your actual project credentials.
                            </p>
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                    <p className="text-gray-500 text-xs font-mono">
                        FocusFlow OS cannot initialize without these core components.
                        <br />
                        Check your console for more details.
                    </p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-6 px-6 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded border border-white/10 transition-colors text-sm font-mono"
                    >
                        RETRY CONNECTION
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default DeploymentErrorPage;
