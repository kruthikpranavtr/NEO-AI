import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, X, CornerDownLeft } from 'lucide-react';
import { VoiceButton } from './VoiceButton';
import { soundFX } from '../services/audioFx';
import { AIModelType } from '../types';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isThinking: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  onToggleVoice: () => void;
  selectedModel: AIModelType;
  onChangeModel?: (model: AIModelType) => void;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isThinking,
  isListening,
  isSpeaking,
  onToggleVoice,
  selectedModel,
  onChangeModel,
  placeholder = 'Ask NEO anything... (e.g. Explain quantum computing, debug React code, solve math...)',
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isThinking) return;
    soundFX.playSend();
    onSendMessage(trimmed);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div id="neo-message-input-wrapper" className="w-full max-w-4xl mx-auto px-2 sm:px-4 pb-4">
      {/* Outer Glow Container */}
      <div className="relative rounded-2xl p-[1px] bg-gradient-to-r from-cyan-500/30 via-blue-500/20 to-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.15)] focus-within:shadow-[0_0_35px_rgba(6,182,212,0.35)] focus-within:from-cyan-400 focus-within:to-blue-500 transition-all duration-300">
        <div className="rounded-2xl bg-[#080e1e]/90 backdrop-blur-xl border border-cyan-500/20 p-2 sm:p-3 flex flex-col gap-2">
          
          {/* Main Input Row */}
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              id="neo-chat-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isThinking}
              rows={1}
              placeholder={isListening ? 'Listening to your voice...' : placeholder}
              className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-sm sm:text-base resize-none focus:outline-none max-h-[180px] py-1.5 px-2 font-space leading-relaxed"
            />

            {/* Clear Button if text present */}
            {input.length > 0 && (
              <button
                type="button"
                onClick={() => setInput('')}
                className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
                title="Clear input"
              >
                <X size={16} />
              </button>
            )}

            {/* Voice Microphone Activator */}
            <VoiceButton
              isListening={isListening}
              isSpeaking={isSpeaking}
              onToggle={onToggleVoice}
              disabled={isThinking}
              size="medium"
            />

            {/* Send Button */}
            <button
              id="neo-send-button"
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || isThinking}
              title="Send message (Enter)"
              className={`
                p-2.5 rounded-xl flex items-center justify-center transition-all duration-300 focus:outline-none
                ${
                  !input.trim() || isThinking
                    ? 'bg-slate-800/60 text-slate-600 cursor-not-allowed border border-slate-700/50'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:scale-105 active:scale-95 cursor-pointer'
                }
              `}
            >
              <Send size={18} className={input.trim() && !isThinking ? 'translate-x-0.5' : ''} />
            </button>
          </div>

          {/* Sub-bar with Shortcuts & Model indicator */}
          <div className="flex items-center justify-between px-2 pt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 font-mono text-cyan-400/80 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                <Sparkles size={11} className="text-cyan-400" />
                <span>{selectedModel}</span>
              </span>
              <span className="hidden sm:inline text-slate-500">
                Shift + Enter for new line
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-500">
              <span className="hidden md:flex items-center gap-1">
                Press <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700 text-[10px] font-mono">Enter</kbd> <CornerDownLeft size={10} />
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
