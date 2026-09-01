import React, { useEffect, useState } from 'react';
import { AICore } from './AICore';
import { soundFX } from '../services/audioFx';

interface LoadingAnimationProps {
  onComplete?: () => void;
  duration?: number;
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  onComplete,
  duration = 1800,
}) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('CALIBRATING NEURAL CORE...');

  useEffect(() => {
    soundFX.playStartup();

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 15) + 8;
        if (next >= 100) {
          clearInterval(interval);
          setStage('NEO CORE SYNCHRONIZED // READY');
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 300);
          return 100;
        }

        if (next > 70) {
          setStage('INITIALIZING INTELLIGENCE MATRIX...');
        } else if (next > 40) {
          setStage('ESTABLISHING QUANTUM SYNERGY...');
        }
        return next;
      });
    }, duration / 12);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <div
      id="neo-boot-loading-screen"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030611] text-slate-100 select-none px-4"
    >
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />

      {/* Mini Core in center */}
      <div className="relative z-10 flex flex-col items-center mb-6">
        <AICore state="thinking" size="compact" interactive={false} />
      </div>

      {/* Futuristic NEO Brand */}
      <div className="relative z-10 text-center space-y-2">
        <h1 className="text-4xl sm:text-5xl font-black font-orbitron tracking-[0.35em] text-white text-glow-cyan">
          N E O
        </h1>
        <p className="text-xs sm:text-sm font-mono tracking-widest text-cyan-400/80 uppercase">
          Your Intelligent AI Assistant
        </p>
      </div>

      {/* Progress Bar Container */}
      <div className="relative z-10 w-full max-w-xs mt-8 space-y-2">
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-cyan-500/30">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)] transition-all duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="text-cyan-400/90">{stage}</span>
          <span className="text-white font-bold">{progress}%</span>
        </div>
      </div>
    </div>
  );
};

export const ThinkingIndicator: React.FC<{ modelName?: string }> = ({ modelName = 'gemini-3.7-flash' }) => {
  return (
    <div id="neo-thinking-indicator" className="flex items-center gap-3 py-3 px-4 rounded-2xl neo-glass-card border border-cyan-500/20 max-w-md my-4">
      <div className="relative flex items-center justify-center w-6 h-6">
        <span className="absolute w-full h-full rounded-full bg-cyan-400/30 animate-ping" />
        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,1)]" />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-mono text-cyan-300 font-semibold tracking-wider">
            NEO IS THINKING
          </span>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
        <span className="text-[10px] font-mono text-slate-500">
          Processing via {modelName}
        </span>
      </div>
    </div>
  );
};
