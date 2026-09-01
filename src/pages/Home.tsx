import React from 'react';
import { Sparkles, Code2, BrainCircuit, BookOpen, Lightbulb, Zap, ArrowRight } from 'lucide-react';
import { AICore } from '../components/AICore';
import { VoiceButton } from '../components/VoiceButton';
import { AICoreState, SuggestionPrompt } from '../types';
import { soundFX } from '../services/audioFx';

interface HomeProps {
  coreState: AICoreState;
  onSelectPrompt: (promptText: string) => void;
  isListening: boolean;
  isSpeaking: boolean;
  onToggleVoice: () => void;
  onCoreClick?: () => void;
}

const SUGGESTIONS: SuggestionPrompt[] = [
  {
    id: 's-1',
    title: 'Explain Machine Learning',
    subtitle: 'Core concepts & real-world intuition',
    prompt: 'Explain machine learning algorithms and how neural networks learn from data in simple, intuitive terms with real-world examples.',
    icon: 'BrainCircuit',
    category: 'ai',
  },
  {
    id: 's-2',
    title: 'Help Me Code',
    subtitle: 'Write & debug TypeScript algorithms',
    prompt: 'Write a high-performance, fully-typed TypeScript priority queue data structure with complete unit test cases and explanations.',
    icon: 'Code2',
    category: 'code',
  },
  {
    id: 's-3',
    title: 'Teach Me AI Architecture',
    subtitle: 'Transformer attention & LLM models',
    prompt: 'How do self-attention mechanisms and transformer neural network architectures work under the hood?',
    icon: 'Sparkles',
    category: 'ai',
  },
  {
    id: 's-4',
    title: 'Help Me Study',
    subtitle: 'Systematic CS exam preparation plan',
    prompt: 'Create a structured 7-day study strategy and revision checklist for Computer Science and System Design interviews.',
    icon: 'BookOpen',
    category: 'study',
  },
];

export const Home: React.FC<HomeProps> = ({
  coreState,
  onSelectPrompt,
  isListening,
  isSpeaking,
  onToggleVoice,
  onCoreClick,
}) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'BrainCircuit':
        return <BrainCircuit size={18} className="text-cyan-400" />;
      case 'Code2':
        return <Code2 size={18} className="text-blue-400" />;
      case 'Sparkles':
        return <Sparkles size={18} className="text-cyan-300" />;
      case 'BookOpen':
        return <BookOpen size={18} className="text-teal-300" />;
      default:
        return <Lightbulb size={18} className="text-cyan-400" />;
    }
  };

  return (
    <div
      id="neo-home-screen"
      className="relative min-h-full flex flex-col items-center justify-center px-4 py-8 sm:py-12 max-w-5xl mx-auto select-none"
    >
      {/* Background Cyber Glow & Radial flare */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* 1. BRANDING & HEADER */}
      <div className="text-center space-y-2 mb-2 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 text-xs font-mono tracking-widest uppercase mb-1">
          <Zap size={13} className="text-cyan-400" />
          <span>NEURAL COGNITION SYSTEM</span>
        </div>
        <h1 className="font-orbitron font-black text-4xl sm:text-6xl tracking-[0.3em] text-white text-glow-cyan">
          N E O
        </h1>
        <p className="font-space font-medium text-sm sm:text-base text-cyan-300/80 tracking-widest uppercase">
          Your Intelligent AI Assistant
        </p>
      </div>

      {/* 2. THE SIGNATURE NEO AI CORE (Centerpiece) */}
      <div className="relative my-2 sm:my-4 flex flex-col items-center justify-center z-20">
        <AICore
          state={coreState}
          size="hero"
          interactive={true}
          onClick={onCoreClick}
          showStatusLabel={true}
        />

        {/* Circular Voice Button Overlapping AI Core */}
        <div className="relative -mt-6 z-30">
          <VoiceButton
            isListening={isListening}
            isSpeaking={isSpeaking}
            onToggle={onToggleVoice}
            size="large"
          />
        </div>
      </div>

      {/* 3. GREETING */}
      <div className="text-center mt-3 mb-6 z-10 space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold font-space text-slate-100">
          "Hello, I'm <span className="text-cyan-400 text-glow-cyan">NEO</span>."
        </h2>
        <p className="text-sm sm:text-base text-slate-400">
          How can I assist your intelligence today?
        </p>
      </div>

      {/* 4. SUGGESTION CARDS */}
      <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 z-10">
        {SUGGESTIONS.map((item) => (
          <button
            key={item.id}
            id={`suggestion-card-${item.id}`}
            type="button"
            onClick={() => {
              soundFX.playRipple();
              onSelectPrompt(item.prompt);
            }}
            className="group relative text-left p-4 rounded-2xl neo-glass-card hover:border-cyan-400/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-cyan-500/20 group-hover:border-cyan-400/40 transition-colors">
                {getIcon(item.icon)}
              </div>
              <ArrowRight
                size={16}
                className="text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all"
              />
            </div>
            <div className="mt-3">
              <h3 className="text-sm font-semibold font-space text-slate-200 group-hover:text-cyan-300 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                {item.subtitle}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
