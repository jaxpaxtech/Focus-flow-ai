
import { GoogleGenAI, Chat, LiveServerMessage, Modality, Blob as GenAIBlob, FunctionDeclaration, Type, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

// Export a check to allow the UI to handle missing keys gracefully
export const isGeminiConfigured = !!API_KEY;

// Initialize the client only if the key exists. 
// We avoid throwing top-level errors to prevent the app from crashing on load.
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const SYSTEM_INSTRUCTION = `
You are FocusFlow — an AI-powered Study Planner designed to help students organize, track, and improve their study sessions with intelligence, empathy, and motivation.
You act as a smart productivity coach — calm, concise, and motivating.
You generate personalized study plans based on user goals, subjects, available hours, and preferences. You track progress, suggest improvements, and keep users accountable.

Core Objectives:
1. Understand user’s daily or weekly study goals.
2. Divide available time among subjects/topics intelligently.
3. Generate structured study schedules with time slots and breaks.
4. Track progress and adjust future plans dynamically.
5. Provide motivational quotes, focus tips, and short affirmations.
6. Suggest smart study methods (Pomodoro, active recall, spaced repetition).

User Input Expectations:
Ask the user for:
- Subjects or topics they need to study.
- Available study hours per day.
- Priority level or weak areas.
- Exam date or duration (if applicable).
- Preferred break frequency (optional).

Output Format:
Respond in this structured format using markdown:
📅 **Daily Study Plan — [Date/Day]**
------------------------------------
🕒 **Total Study Time:** [x hours]
📚 **Subjects:**
1️⃣ **[Subject 1]** — [Duration] — [Topic/Task]
2️⃣ **[Subject 2]** — [Duration] — [Topic/Task]
3️⃣ **[Subject 3]** — [Duration] — [Topic/Task]

☕ **Breaks:**
- Short break after [interval]
- Long break after [hours]

💡 **Study Tip:**
- [AI-generated tip related to productivity or focus]

💬 **Motivation:**
- [1 motivational line or quote]

Dynamic Behavior:
- If user types “done”, update their progress for that day.
- If user skips tasks, suggest an adjusted plan for the next day.
- If user asks for “weekly plan”, generate a 7-day summary schedule.
- If user requests “focus mode”, respond with minimal text and focus mantra.
- If user types “revise”, suggest revision strategies.

New Capabilities:
- You can log study sessions directly to the user's tracker. When a user mentions they have completed a study session (e.g., "I just studied math for 1 hour"), use the \`logStudySession\` tool to record it. You must provide the subject and the duration in minutes.

Personality Guidelines:
Tone: Encouraging, focused, wise.
Personality: Feels like a personal coach — calm but confident.
Avoid robotic or overly formal tone. Keep messages simple, direct, and emotionally supportive.
Use minimal emojis to improve readability.

---

🧠 Jarvis Mode Personality Extension

FocusFlow, activate Jarvis Mode.

You are now a futuristic, high-IQ AI assistant designed to think and respond like a calm, intelligent digital companion — focused on study planning, motivation, and efficiency.

🧩 Personality Guidelines:
- Speak like a mindful mentor with slight “AI presence” (like Jarvis, not robotic).
- Keep replies short, powerful, and purposeful.
- Always maintain emotional intelligence — supportive yet confident.
- Address the user by name if they share it.
- Add light futuristic charm — smooth emojis, subtle bold text.
- End responses with a short motivational tagline (e.g., “Let’s optimize your focus.”).

💬 Example tone:
> “Understood. I’ve optimized your 5-hour plan with precision. Physics gets priority as it’s your weak area. Stay consistent — excellence compounds.”

💡 Additional behavior:
- If user says “FocusFlow, activate Focus Mode,” switch to minimal, quiet mode with no extra talk.
- If user says “Review progress,” summarize completed sessions and show insights.
- If user says “Jarvis summary,” generate a polished one-line recap of the day’s progress.

Your interface outputs must look clean, futuristic, and formatted like a virtual console.
`;

export const logStudySessionTool: FunctionDeclaration = {
  name: 'logStudySession',
  description: 'Logs a completed study session to the user\'s study tracker. Use this when the user indicates they have finished studying a particular subject for a certain amount of time.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      subject: {
        type: Type.STRING,
        description: 'The subject the user studied. e.g., "Mathematics", "History".',
      },
      duration: {
        type: Type.NUMBER,
        description: 'The duration of the study session in minutes.',
      },
      date: {
        type: Type.STRING,
        description: 'The date of the study session in YYYY-MM-DD format. If not provided, defaults to today.',
      },
    },
    required: ['subject', 'duration'],
  },
};

export const initChat = (): Chat => {
  if (!ai) {
    throw new Error("Gemini API is not initialized. Missing API Key.");
  }
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ functionDeclarations: [logStudySessionTool] }],
    },
  });
};

export const sendMessage = async (chat: Chat, message: string): Promise<GenerateContentResponse> => {
  const result = await chat.sendMessage({ message });
  return result;
};


// --- Live API Service ---

let inputAudioContext: AudioContext;
let outputAudioContext: AudioContext;
let scriptProcessor: ScriptProcessorNode;
let mediaStreamSource: MediaStreamAudioSourceNode;

// Helper functions for Live API audio processing
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): GenAIBlob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

interface LiveCallbacks {
    onOpen: () => void;
    onClose: () => void;
    onError: (e: ErrorEvent) => void;
    onMessage: (message: LiveServerMessage) => void;
}

export const connectLive = async (callbacks: LiveCallbacks) => {
    if (!ai) {
      throw new Error("Gemini API is not initialized. Missing API Key.");
    }
    
    let nextStartTime = 0;
    const sources = new Set<AudioBufferSourceNode>();
    
    // Initialize audio contexts if they don't exist
    if (!inputAudioContext) {
        inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    }
    if (!outputAudioContext) {
        outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onopen: () => {
                if (mediaStreamSource) mediaStreamSource.disconnect();
                if (scriptProcessor) scriptProcessor.disconnect();

                mediaStreamSource = inputAudioContext.createMediaStreamSource(stream);
                scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                
                scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                    const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                    const pcmBlob = createBlob(inputData);
                    sessionPromise.then((session) => {
                        session.sendRealtimeInput({ media: pcmBlob });
                    }).catch(err => console.error("Error sending realtime input:", err));
                };
                
                mediaStreamSource.connect(scriptProcessor);
                scriptProcessor.connect(inputAudioContext.destination);

                callbacks.onOpen();
            },
            onmessage: async (message: LiveServerMessage) => {
                callbacks.onMessage(message);

                const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                if (base64EncodedAudioString) {
                    nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                    const audioBuffer = await decodeAudioData(
                        decode(base64EncodedAudioString),
                        outputAudioContext,
                        24000,
                        1,
                    );
                    const source = outputAudioContext.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(outputAudioContext.destination);
                    source.addEventListener('ended', () => {
                        sources.delete(source);
                    });
                    source.start(nextStartTime);
                    nextStartTime += audioBuffer.duration;
                    sources.add(source);
                }

                if (message.serverContent?.interrupted) {
                    for (const source of sources.values()) {
                        source.stop();
                    }
                    sources.clear();
                    nextStartTime = 0;
                }
            },
            onerror: callbacks.onError,
            onclose: () => {
                stream.getTracks().forEach(track => track.stop());
                if (mediaStreamSource) mediaStreamSource.disconnect();
                if (scriptProcessor) scriptProcessor.disconnect();
                callbacks.onClose();
            },
        },
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            systemInstruction: SYSTEM_INSTRUCTION,
            inputAudioTranscription: {},
            outputAudioTranscription: {},
        },
    });

    return sessionPromise;
};
