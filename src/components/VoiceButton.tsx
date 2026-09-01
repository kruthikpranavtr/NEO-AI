import React from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { soundFX } from '../services/audioFx';

interface VoiceButtonProps {
  isListening: boolean;
  isSpeaking?: boolean;
  onToggle: () => void;
  disabled?: boolean;
  size?: 'large' | 'medium' | 'small';
  className?: string;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  isListening,
  isSpeaking = false,
  onToggle,
  disabled = false,
  size = 'large',
  className = '',
}) => {
  const handleClick = () => {
    if (disabled) return;
    if (!isListening) {
      soundFX.playListening();
    }
    onToggle();
  };

  const getButtonSize = () => {
    switch (size) {
      case 'large':
        return 'w-16 h-16 text-2xl';
      case 'medium':
        return 'w-12 h-12 text-lg';
      case 'small':
        return 'w-9 h-9 text-sm';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'large':
        return 28;
      case 'medium':
        return 20;
      case 'small':
        return 16;
    }
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Animated Glowing Wave Rings when Listening */}
      {isListening && (
        <>
          <span className="absolute inset-0 rounded-full bg-cyan-500/30 animate-ping duration-1000" />
          <span className="absolute -inset-2 rounded-full border-2 border-cyan-400/50 animate-pulse duration-700" />
          <span className="absolute -inset-4 rounded-full border border-cyan-300/30 animate-ping duration-1000 delay-300" />
        </>
      )}

      {/* Speaking Ripple */}
      {isSpeaking && (
        <span className="absolute -inset-2 rounded-full border border-emerald-400/60 animate-ping duration-1000" />
      )}

      {/* Main Microphone Button */}
      <button
        id="neo-voice-mic-button"
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-label={isListening ? 'Stop Listening' : 'Start Voice Input'}
        title={isListening ? 'Click to stop listening' : 'Click to speak to NEO'}
        className={`
          relative z-10 flex items-center justify-center rounded-full transition-all duration-300
          focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#040711]
          ${getButtonSize()}
          ${
            disabled
              ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500 border border-slate-700'
              : isListening
              ? 'bg-gradient-to-tr from-cyan-500 to-blue-500 text-black shadow-[0_0_30px_rgba(6,182,212,0.8)] scale-110'
              : isSpeaking
              ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-black shadow-[0_0_25px_rgba(16,185,129,0.7)] scale-105'
              : 'bg-slate-900/90 text-cyan-400 hover:text-white border border-cyan-500/40 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:scale-105 active:scale-95'
          }
        `}
      >
        {isListening ? (
          <Mic className="animate-pulse text-black" size={getIconSize()} />
        ) : isSpeaking ? (
          <Volume2 className="animate-bounce text-black" size={getIconSize()} />
        ) : (
          <Mic size={getIconSize()} />
        )}
      </button>
    </div>
  );
};
