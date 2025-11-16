import React, { useState } from 'react';
import Header from './Header';
import { BottomBar } from './BottomBar';
import { MailIcon, LockIcon, UserIcon } from './Icons';
import { supabase } from '../services/supabase';

interface LoginPageProps {
  // This component now manages its own state and triggers global auth state changes via Supabase.
}

type AuthMode = 'login' | 'signup' | 'forgot';

const AuthInput: React.FC<{ 
  icon: React.ReactNode; 
  type: string; 
  placeholder: string; 
  id: string;
  disabled: boolean;
}> = ({ icon, type, placeholder, id, disabled }) => (
    <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            {icon}
        </div>
        <input
            type={type}
            id={id}
            name={id}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-3 bg-gray-900/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-glow)] border border-transparent focus:border-[var(--primary-glow)]/50 font-mono text-cyan-300 placeholder:text-cyan-600/70 disabled:opacity-50"
            required
            disabled={disabled}
        />
    </div>
);

const LoginPage: React.FC<LoginPageProps> = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTitle = () => {
    switch (mode) {
      case 'signup': return 'Create Operator Account';
      case 'forgot': return 'Password Recovery';
      case 'login':
      default: return 'Operator Authentication';
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email')?.toString() || formData.get('signup-email')?.toString() || formData.get('forgot-email')?.toString();
    const password = formData.get('password')?.toString() || formData.get('signup-password')?.toString();

    if (!email) {
        setError('Email is required.');
        setIsLoading(false);
        return;
    }

    try {
        switch(mode) {
            case 'login':
                if (!password) { throw new Error("Password is required."); }
                const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                if (signInError) throw signInError;
                // onAuthStateChange in App.tsx will handle navigation
                break;
            case 'signup':
                const fullName = formData.get('fullname')?.toString();
                const confirmPassword = formData.get('confirm-password')?.toString();
                if (!password || !confirmPassword) { throw new Error("Password is required."); }
                if (password !== confirmPassword) { throw new Error("Passwords do not match."); }
                
                const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ 
                    email, 
                    password,
                    options: { data: { full_name: fullName } }
                });
                if (signUpError) throw signUpError;
                if (signUpData.user) {
                    alert("Sign up successful! Please check your email to confirm your account.");
                    setMode('login');
                }
                break;
            case 'forgot':
                const { error: forgotError } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: window.location.origin, // URL for the password reset link
                });
                if (forgotError) throw forgotError;
                alert('Password reset link sent to your email!');
                setMode('login');
                break;
        }
    } catch (err: any) {
        setError(err.error_description || err.message || 'An unexpected error occurred.');
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] text-white animate-[fadeIn_1s_ease-in-out]">
      <Header currentMode="text" currentPage="dashboard" onModeChange={() => {}} onNavigate={() => {}} />
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-500/10 rounded-full blur-3xl animate-pulse [animation-delay:2s]"></div>

        <div className="relative z-10 glass-panel p-8 md:p-10 rounded-2xl border border-cyan-500/20 shadow-2xl shadow-cyan-500/10 w-full max-w-md">
          <h1 className="font-title text-3xl text-center text-cyan-300 tracking-widest mb-6">{getTitle()}</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
                <AuthInput icon={<UserIcon className="w-5 h-5"/>} type="text" placeholder="FULL NAME" id="fullname" disabled={isLoading} />
            )}

            {(mode === 'login' || mode === 'forgot') && <AuthInput icon={<MailIcon className="w-5 h-5"/>} type="email" placeholder="EMAIL ADDRESS" id="email" disabled={isLoading} />}
            {mode === 'login' && <AuthInput icon={<LockIcon className="w-5 h-5"/>} type="password" placeholder="PASSWORD" id="password" disabled={isLoading} />}
            
            {mode === 'signup' && <AuthInput icon={<MailIcon className="w-5 h-5"/>} type="email" placeholder="EMAIL ADDRESS" id="signup-email" disabled={isLoading} />}
            {mode === 'signup' && <AuthInput icon={<LockIcon className="w-5 h-5"/>} type="password" placeholder="PASSWORD" id="signup-password" disabled={isLoading} />}
            {mode === 'signup' && <AuthInput icon={<LockIcon className="w-5 h-5"/>} type="password" placeholder="CONFIRM PASSWORD" id="confirm-password" disabled={isLoading} />}
            
            {error && (
                <div className="text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-lg text-center font-mono text-sm">
                    {error}
                </div>
            )}

            {mode === 'login' && (
                <div className="text-right text-sm">
                    <button type="button" onClick={() => setMode('forgot')} disabled={isLoading} className="font-mono text-cyan-400 hover:text-cyan-200 transition-colors disabled:opacity-50">Forgot Password?</button>
                </div>
            )}
            
            <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 px-8 py-3 font-bold text-lg bg-cyan-500/80 text-white rounded-lg border-2 border-cyan-400
                       hover:bg-cyan-400 hover:shadow-[0_0_20px_var(--primary-glow)] transition-all duration-300
                       transform hover:scale-105 disabled:bg-gray-600 disabled:shadow-none disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center"
            >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    {mode === 'login' && 'Access System'}
                    {mode === 'signup' && 'Create Account'}
                    {mode === 'forgot' && 'Send Reset Link'}
                  </>
                )}
            </button>

             <div className="text-center text-sm pt-4 font-mono">
                {mode === 'login' && (
                    <p>No account? <button type="button" onClick={() => setMode('signup')} disabled={isLoading} className="font-bold text-cyan-400 hover:text-cyan-200 transition-colors disabled:opacity-50">Create one</button></p>
                )}
                {mode !== 'login' && (
                    <p>Already have an account? <button type="button" onClick={() => setMode('login')} disabled={isLoading} className="font-bold text-cyan-400 hover:text-cyan-200 transition-colors disabled:opacity-50">Login</button></p>
                )}
            </div>
          </form>
        </div>
      </main>
      <BottomBar motivation="Operator authentication required to proceed." />
    </div>
  );
};

export default LoginPage;
