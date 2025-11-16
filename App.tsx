
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { type AppMode, type Message, type StudyPlan, type Page, type StudySession, type ActiveTimerSession, type StudyPlanSubject } from './types';
import Header from './components/Header';
import ChatView from './components/ChatView';
import VoiceView from './components/VoiceView';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import { BottomBar } from './components/BottomBar';
import WelcomeAnimation from './components/WelcomeAnimation';
import WelcomePage from './components/WelcomePage';
import LoginPage from './components/LoginPage';
import { StudyTrackerPage } from './components/StudyTrackerPage';
import StudyTimer from './components/StudyTimer';
import ActiveTimer from './components/ActiveTimer';
import DashboardPage from './components/DashboardPage';
import { initChat, sendMessage } from './services/geminiService';
import { type Chat, type GenerateContentResponse } from '@google/genai';
import { supabase } from './services/supabase';
import { type Session } from '@supabase/supabase-js';


const parseStudyPlan = (text: string): StudyPlan | null => {
  if (!text.includes('Daily Study Plan')) return null;

  try {
    const totalTimeMatch = text.match(/🕒 \*\*Total Study Time:\*\* (.*)/);
    const tipMatch = text.match(/💡 \*\*Study Tip:\*\*\n- (.*)/);
    const motivationMatch = text.match(/💬 \*\*Motivation:\*\*\n- (.*)/);

    const subjectsSection = text.split('📚 **Subjects:**')[1]?.split('☕ **Breaks:**')[0];
    const subjects = subjectsSection?.match(/(\d️⃣ \*\*.+\*\* — .+ — .+)/g)?.map(line => {
        const parts = line.replace(/\d️⃣ \*\*/g, '').split('** — ');
        const [subject, duration, topic] = parts.map(p => p.trim());
        return { subject, duration, topic: topic || 'N/A', completed: false };
    }) || [];

    return {
      totalTime: totalTimeMatch ? totalTimeMatch[1] : 'N/A',
      subjects: subjects,
      studyTip: tipMatch ? tipMatch[1] : 'N/A',
      motivation: motivationMatch ? motivationMatch[1] : 'N/A',
    };
  } catch (error) {
    console.error("Failed to parse study plan:", error);
    return null;
  }
};


const App: React.FC = () => {
  const [appState, setAppState] = useState<'animating' | 'welcome' | 'auth' | 'running'>('animating');
  const [session, setSession] = useState<Session | null>(null);
  const [mode, setMode] = useState<AppMode>('text');
  const [page, setPage] = useState<Page>('console');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: 'Welcome to FocusFlow. How can I help you optimize your study session today?' }
  ]);
  const [input, setInput] = useState('');
  const chatSession = useRef<Chat | null>(null);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [studyHistory, setStudyHistory] = useState<StudySession[]>([]);
  const [activeTimerSession, setActiveTimerSession] = useState<ActiveTimerSession | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session && appState === 'auth') {
        setAppState('running');
      } else if (!session && appState === 'running') {
        setAppState('auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [appState]);

  useEffect(() => {
    if (session) {
      const fetchHistory = async () => {
        setDbError(null);
        const { data, error } = await supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', session.user.id)
          .order('date', { ascending: false });

        if (error) {
          console.error('Error fetching study history:', error.message);
          if (error.message.includes('does not exist') || error.message.includes('Could not find the table')) {
             setDbError("Database Connection Error: The 'study_sessions' table was not found. This is a setup issue. If you are the administrator, please ensure the database schema is correctly initialized.");
          } else {
             setDbError(`Failed to fetch study history: ${error.message}`);
          }
        } else {
          setStudyHistory(data as StudySession[]);
        }
      };
      fetchHistory();
    }
  }, [session]);

  useEffect(() => {
    chatSession.current = initChat();
  }, []);

  const handleSendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || !chatSession.current || !session) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response: GenerateContentResponse = await sendMessage(chatSession.current, messageText);
      const functionCalls = response.functionCalls;

      if (functionCalls && functionCalls.length > 0) {
        for (const fc of functionCalls) {
          if (fc.name === 'logStudySession') {
            const { subject, duration, date } = fc.args;
            
            if (typeof subject === 'string' && typeof duration === 'number') {
              const newSessionData = {
                user_id: session.user.id,
                subject: subject,
                duration: parseFloat((duration / 60).toFixed(2)), // API returns minutes, DB stores hours
                date: (typeof date === 'string' && date) ? date : new Date().toISOString().split('T')[0],
                completed: true,
              };

              const { data, error } = await supabase
                .from('study_sessions')
                .insert(newSessionData)
                .select()
                .single();

              if (error) {
                console.error('Error logging session from chat:', error);
                const errorMessage: Message = { id: (Date.now() + 1).toString(), role: 'model', text: `I tried to log your session, but a database error occurred: ${error.message}` };
                setMessages(prev => [...prev, errorMessage]);
              } else if (data) {
                setStudyHistory(prev => [data as StudySession, ...prev]);
                const confirmationMessage: Message = { id: (Date.now() + 1).toString(), role: 'model', text: `Great work! I've logged a ${duration}-minute session for **${subject}** in your tracker.` };
                setMessages(prev => [...prev, confirmationMessage]);
              }
            } else {
              const errorMessage: Message = { id: (Date.now() + 1).toString(), role: 'model', text: "I couldn't log that session because some details were missing. Please make sure to specify both the subject and duration." };
              setMessages(prev => [...prev, errorMessage]);
            }
          }
        }
      } else {
        const responseText = response.text;
        const modelMessage: Message = { id: (Date.now() + 1).toString(), role: 'model', text: responseText };
        setMessages(prev => [...prev, modelMessage]);

        const parsedPlan = parseStudyPlan(responseText);
        if (parsedPlan) {
          setStudyPlan(parsedPlan);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = { id: (Date.now() + 1).toString(), role: 'model', text: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [session]);
  
  const handleQuickAction = useCallback((prompt: string) => {
    if (page !== 'console') setPage('console');
    handleSendMessage(prompt);
  }, [handleSendMessage, page]);

  const handleNavigate = (newPage: Page) => {
    setPage(newPage);
  };
  
  const handleSessionComplete = async (durationMinutes: number) => {
      if (!session) return;
      
      const newSessionData = {
          user_id: session.user.id,
          subject: 'General Focus',
          duration: parseFloat((durationMinutes / 60).toFixed(2)),
          date: new Date().toISOString().split('T')[0],
          completed: true,
      };

      const { data, error } = await supabase
        .from('study_sessions')
        .insert(newSessionData)
        .select()
        .single();

      if (error) {
          console.error('Error logging session:', error);
          alert(`Failed to save your session: ${error.message}. Please check your database setup and RLS policies.`);
      } else if (data) {
          setStudyHistory(prev => [data as StudySession, ...prev]);
      }
  };

  const handleStartSession = useCallback((subject: StudyPlanSubject) => {
    if (activeTimerSession) {
      alert("Another session is already in progress!");
      return;
    }
    
    const durationString = subject.duration;
    let durationInSeconds = 0;
    const minsMatch = durationString.match(/(\d+)\s*min/);
    const hourMatch = durationString.match(/(\d+(\.\d+)?)\s*hour/);

    if (minsMatch) {
      durationInSeconds = parseInt(minsMatch[1], 10) * 60;
    } else if (hourMatch) {
      durationInSeconds = parseFloat(hourMatch[1]) * 3600;
    } else {
      durationInSeconds = 25 * 60; // Default to 25 mins if parsing fails
    }

    setActiveTimerSession({
      subject: subject.subject,
      topic: subject.topic,
      duration: durationInSeconds,
      timeLeft: durationInSeconds,
    });
  }, [activeTimerSession]);

  const handleEndSession = useCallback(async (timeLeft: number, completed: boolean) => {
      if (!activeTimerSession || !studyPlan || !session) return;
      
      const sessionDurationHours = (activeTimerSession.duration - timeLeft) / 3600;

      if (sessionDurationHours > 0.01) { // Only log if some time has passed
          const newSessionData = {
              user_id: session.user.id,
              subject: activeTimerSession.subject,
              duration: parseFloat(sessionDurationHours.toFixed(2)),
              date: new Date().toISOString().split('T')[0],
              completed: completed,
          };
          const { data, error } = await supabase
            .from('study_sessions')
            .insert(newSessionData)
            .select()
            .single();
          
          if(error) {
              console.error('Error logging session from plan:', error);
              alert(`Failed to save your session: ${error.message}. Please check your database setup and RLS policies.`);
          } else if(data) {
              setStudyHistory(prev => [data as StudySession, ...prev]);
          }
      }
      
      if (completed) {
        setStudyPlan(prevPlan => {
            if (!prevPlan) return null;
            const newSubjects = prevPlan.subjects.map(s => 
                s.subject === activeTimerSession.subject && s.topic === activeTimerSession.topic && !s.completed
                    ? { ...s, completed: true }
                    : s
            );
            return { ...prevPlan, subjects: newSubjects };
        });
      }

      setActiveTimerSession(null);

  }, [activeTimerSession, studyPlan, session]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if(error) console.error('Error logging out:', error);
  };

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return (
          <DashboardPage
            session={session}
            studyHistory={studyHistory}
            studyPlan={studyPlan}
            onNavigate={handleNavigate}
            onQuickAction={handleQuickAction}
          />
        );
      case 'tracker':
        return <StudyTrackerPage studyHistory={studyHistory} onNavigate={handleNavigate} dbError={dbError} />;
      case 'timer':
        return <StudyTimer onNavigate={handleNavigate} onSessionComplete={handleSessionComplete} />;
      case 'console':
      default:
        return (
          <>
            <main className="flex-1 flex flex-col p-4 overflow-hidden relative">
               {activeTimerSession && (
                 <ActiveTimer session={activeTimerSession} onEndSession={handleEndSession} />
               )}
              {mode === 'text' ? (
                <ChatView messages={messages} input={input} setInput={setInput} isLoading={isLoading} onSend={handleSendMessage} />
              ) : (
                <VoiceView />
              )}
            </main>
            <RightSidebar studyPlan={studyPlan} onStartSession={handleStartSession} activeSessionSubject={activeTimerSession?.subject} />
          </>
        );
    }
  };

  if (appState === 'animating') {
    return <WelcomeAnimation onAnimationComplete={() => setAppState('welcome')} />;
  }

  if (appState === 'welcome') {
    return <WelcomePage onInitialise={() => setAppState(session ? 'running' : 'auth')} />;
  }

  if (appState === 'auth') {
    return <LoginPage />;
  }
  
  if (!session) {
      return (
          <div className="flex h-screen w-full items-center justify-center bg-[#0A0A0A]">
              <p className="font-mono text-cyan-300">Syncing with FocusFlow servers...</p>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] text-white">
      {(page !== 'tracker' && page !== 'timer') && <Header currentMode={mode} currentPage={page} onModeChange={setMode} onNavigate={handleNavigate} onLogout={handleLogout} />}
      <div className="flex flex-1 overflow-hidden">
        {(page === 'console' || page === 'dashboard') && <LeftSidebar onQuickAction={handleQuickAction} onNavigate={handleNavigate} />}
        <div className={`flex-1 flex flex-col overflow-hidden ${page === 'console' ? 'lg:flex-row' : ''}`}>
           {renderPage()}
        </div>
      </div>
      {page === 'console' && <BottomBar motivation={studyPlan?.motivation} />}
    </div>
  );
};

export default App;
