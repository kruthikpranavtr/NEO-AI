export type AICoreState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

export type PageView = 'home' | 'chat' | 'history' | 'profile' | 'settings';

export type ResponseStyle = 'concise' | 'balanced' | 'comprehensive' | 'code-expert';

export type AIModelType = 'gemini-flash-latest' | 'gemini-3.7-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.1-pro-preview';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  model?: string;
  isStreaming?: boolean;
  audioGenerated?: boolean;
  tokensEstimate?: number;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  messageCount: number;
  preview?: string;
  tags?: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  title: string;
  joinedDate: string;
  stats: {
    totalConversations: number;
    totalMessages: number;
    voiceMinutes: number;
    queriesToday: number;
  };
}

export interface AppSettings {
  theme: 'futuristic-dark' | 'cyber-blue' | 'deep-space';
  language: string;
  soundEffects: boolean;
  notifications: boolean;
  aiResponseStyle: ResponseStyle;
  aiModel: AIModelType;
  creativityLevel: number; // 0.0 - 1.0
  autoSpeak: boolean;
  voiceGender: 'male' | 'female';
  voiceSpeed: number; // 0.8 - 1.5
  thinkingLevel: 'LOW' | 'HIGH';
  streamResponses: boolean;
}

export interface SuggestionPrompt {
  id: string;
  title: string;
  subtitle: string;
  prompt: string;
  icon: string;
  category: 'code' | 'science' | 'ai' | 'study' | 'creative';
}
