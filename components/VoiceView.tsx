import React, { useState, useRef, useCallback, useEffect } from 'react';
import { type TranscriptionEntry } from '../types';
import { connectLive } from '../services/geminiService';
import { MicIcon, StopIcon } from './Icons';

type SessionStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED';

const VoiceView: React.FC = () => {
    const [status, setStatus] = useState<SessionStatus>('DISCONNECTED');
    const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionEntry[]>([]);
    
    const currentUserTranscriptionRef = useRef('');
    const currentAgentTranscriptionRef = useRef('');
    
    const [displayUserTranscription, setDisplayUserTranscription] = useState('');
    const [displayAgentTranscription, setDisplayAgentTranscription] = useState('');
    
    const sessionRef = useRef<Awaited<ReturnType<typeof connectLive>> | null>(null);

    const handleStartSession = useCallback(async () => {
        setStatus('CONNECTING');
        try {
            const session = await connectLive({
                onOpen: () => setStatus('CONNECTED'),
                onClose: () => {
                    setStatus('DISCONNECTED');
                    sessionRef.current = null;
                },
                onError: (e) => {
                    console.error('Session error:', e);
                    setStatus('DISCONNECTED');
                    let errorMessage = "A connection error occurred. Please try again.";
                    if (e.message && e.message.toLowerCase().includes('network error')) {
                        errorMessage = "Network Error: Could not connect to the voice service. Please check your internet connection and firewall settings, then try again.";
                    }
                    alert(errorMessage);
                },
                onMessage: (message) => {
                    if (message.serverContent?.outputTranscription) {
                        const text = message.serverContent.outputTranscription.text;
                        currentAgentTranscriptionRef.current += text;
                        setDisplayAgentTranscription(currentAgentTranscriptionRef.current);
                    } else if (message.serverContent?.inputTranscription) {
                        const text = message.serverContent.inputTranscription.text;
                        currentUserTranscriptionRef.current += text;
                        setDisplayUserTranscription(currentUserTranscriptionRef.current);
                    }

                    if (message.serverContent?.turnComplete) {
                        const user = currentUserTranscriptionRef.current;
                        const agent = currentAgentTranscriptionRef.current;
                        
                        if (user || agent) {
                           setTranscriptionHistory(prev => [...prev, { id: Date.now().toString(), user, agent }]);
                        }

                        currentUserTranscriptionRef.current = '';
                        currentAgentTranscriptionRef.current = '';
                        setDisplayUserTranscription('');
                        setDisplayAgentTranscription('');
                    }
                }
            });
            sessionRef.current = session;
        } catch (error) {
            console.error('Failed to start session:', error);
            setStatus('DISCONNECTED');
            alert("Could not start session. Please ensure microphone permissions are granted.");
        }
    }, []);

    const handleStopSession = useCallback(() => {
        if (sessionRef.current) {
            sessionRef.current.close();
            sessionRef.current = null;
        }
        setStatus('DISCONNECTED');
    }, []);
    
    useEffect(() => {
        // Cleanup on unmount
        return () => {
            if (sessionRef.current) {
                sessionRef.current.close();
            }
        };
    }, []);

    const getStatusText = () => {
        switch (status) {
            case 'CONNECTED': return 'STATUS: ONLINE // LISTENING';
            case 'CONNECTING': return 'CONNECTING TO AUDIO NEXUS...';
            case 'DISCONNECTED': return 'VOICE INTERFACE STANDBY';
        }
    };

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto">
            <div className="flex flex-col items-center justify-center p-8 glass-panel rounded-lg flex-shrink-0 shadow-lg">
                <p className="text-sm font-medium text-cyan-300 mb-4 font-mono tracking-widest uppercase">{getStatusText()}</p>
                <button
                    onClick={status === 'CONNECTED' ? handleStopSession : handleStartSession}
                    disabled={status === 'CONNECTING'}
                    aria-label={status === 'CONNECTED' ? 'Stop voice session' : 'Start voice session'}
                    className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out
                        ${status === 'CONNECTED' ? 'bg-red-500/80 hover:bg-red-500' : 'bg-cyan-500/80 hover:bg-cyan-500'}
                        ${status === 'CONNECTING' ? 'bg-gray-600 cursor-not-allowed' : ''}
                    `}
                >
                    {status === 'CONNECTED' && <div className="absolute inset-0 bg-red-500 rounded-full animate-pulse"></div>}
                    {status !== 'CONNECTED' && <div className="absolute inset-0 bg-cyan-500 rounded-full animate-ping opacity-50"></div>}

                    <div className="relative z-10">
                        {status === 'CONNECTED' ? <StopIcon className="w-10 h-10 text-white" /> : <MicIcon className="w-10 h-10 text-white" />}
                    </div>
                </button>
                 <p className="text-sm text-gray-400 mt-4 h-5 font-mono">
                    {status === 'CONNECTED' ? 'Tap to end conversation' : 'Tap to start speaking'}
                 </p>
            </div>

            <div className="flex-1 mt-6 overflow-y-auto glass-panel p-4 rounded-lg shadow-lg font-mono">
                <div className="space-y-4">
                     {transcriptionHistory.map(entry => (
                        <div key={entry.id} className="p-4 bg-gray-900/60 rounded-lg border border-gray-700/50">
                           {entry.user && <p><strong className="text-cyan-400">You:</strong> {entry.user}</p>}
                           {entry.agent && <p><strong className="text-teal-400">FocusFlow:</strong> {entry.agent}</p>}
                        </div>
                    ))}
                    {(displayUserTranscription || displayAgentTranscription) && (
                        <div className="p-4 bg-gray-900/40 rounded-lg opacity-75">
                            {displayUserTranscription && <p><strong className="text-cyan-400">You:</strong> {displayUserTranscription}</p>}
                            {displayAgentTranscription && <p><strong className="text-teal-400">FocusFlow:</strong> {displayAgentTranscription}</p>}
                        </div>
                    )}
                    {transcriptionHistory.length === 0 && !displayUserTranscription && !displayAgentTranscription && (
                         <div className="text-center text-gray-500 py-8">
                            <p>Conversation transcript will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VoiceView;