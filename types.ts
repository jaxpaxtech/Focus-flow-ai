
export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export type AppMode = 'text' | 'voice';
export type Page = 'console' | 'tracker' | 'timer' | 'dashboard';

export interface TranscriptionEntry {
  id: string;
  user: string;
  agent: string;
}

export interface StudyPlanSubject {
  subject: string;
  duration: string;
  topic: string;
  completed: boolean;
}

export interface StudyPlan {
  totalTime: string;
  subjects: StudyPlanSubject[];
  studyTip: string;
  motivation: string;
}

export interface StudySession {
    id: string; // Will be a UUID from Supabase
    user_id: string; // Foreign key to auth.users
    subject: string;
    duration: number; // in hours
    date: string; // YYYY-MM-DD
    completed: boolean;
    created_at?: string; // Supabase timestamp
}

export interface ActiveTimerSession {
  subject: string;
  topic: string;
  duration: number; // total duration in seconds
  timeLeft: number; // time left in seconds
}