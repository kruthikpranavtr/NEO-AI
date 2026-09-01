import React, { useState } from 'react';
import { Copy, Check, Volume2, RotateCcw, Trash2, Cpu, User, Pause } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ChatMessage } from '../types';

interface MessageProps {
  message: ChatMessage;
  onRegenerate?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onSpeak?: (text: string) => void;
  onStopSpeaking?: () => void;
  isSpeakingThis?: boolean;
}

export const Message: React.FC<MessageProps> = ({
  message,
  onRegenerate,
  onDelete,
  onSpeak,
  onStopSpeaking,
  isSpeakingThis = false,
}) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeechToggle = () => {
    if (isSpeakingThis) {
      if (onStopSpeaking) onStopSpeaking();
    } else {
      if (onSpeak) onSpeak(message.content);
    }
  };

  return (
    <div
      id={`chat-message-${message.id}`}
      className={`group w-full flex gap-3 sm:gap-4 my-4 sm:my-6 transition-all duration-300 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* NEO Avatar (Left Side for Assistant) */}
      {!isUser && (
        <div className="flex-shrink-0 flex flex-col items-center">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-400 to-blue-600 p-[1px] shadow-[0_0_12px_rgba(6,182,212,0.4)]">
            <div className="w-full h-full rounded-xl bg-[#040816] flex items-center justify-center text-cyan-400">
              <Cpu size={18} className="animate-pulse" />
            </div>
          </div>
          <span className="text-[10px] font-mono text-cyan-400/70 mt-1 uppercase tracking-wider">NEO</span>
        </div>
      )}

      {/* Message Content Container */}
      <div
        className={`max-w-[88%] sm:max-w-[80%] md:max-w-[72%] rounded-2xl p-4 sm:p-5 transition-all duration-300 ${
          isUser
            ? 'bg-gradient-to-br from-cyan-600/20 via-blue-600/15 to-slate-900/80 border border-cyan-500/30 text-slate-100 rounded-tr-sm shadow-[0_4px_20px_rgba(6,182,212,0.08)]'
            : 'neo-glass-card border border-cyan-500/15 text-slate-200 rounded-tl-sm shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
        }`}
      >
        {/* Header inside Bubble */}
        <div className="flex items-center justify-between gap-3 mb-2 pb-1.5 border-b border-slate-800/60 text-xs font-mono">
          <span className={`font-semibold tracking-wider ${isUser ? 'text-cyan-300' : 'text-cyan-400'}`}>
            {isUser ? 'YOU' : 'NEO INTELLIGENCE'}
          </span>
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            {message.model && !isUser && (
              <span className="bg-cyan-950/50 text-cyan-400/90 px-1.5 py-0.5 rounded border border-cyan-900/40 text-[10px]">
                {message.model}
              </span>
            )}
            <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Message Body with Markdown */}
        <div className="prose prose-invert max-w-none text-sm sm:text-base leading-relaxed break-words font-space selection:bg-cyan-500 selection:text-black">
          {message.content ? (
            <MarkdownRenderer content={message.content} />
          ) : (
            <span className="text-slate-500 italic">No content</span>
          )}

          {/* Streaming Cursor */}
          {message.isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-cyan-400 animate-pulse align-middle" />
          )}
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/50 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition-all text-xs"
              title="Copy message"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {/* Read Aloud / Text to Speech */}
            {!isUser && onSpeak && (
              <button
                type="button"
                onClick={handleSpeechToggle}
                className={`flex items-center gap-1 px-2 py-1 rounded-md border text-xs transition-all ${
                  isSpeakingThis
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border-slate-800 hover:border-cyan-500/40'
                }`}
                title={isSpeakingThis ? 'Stop speaking' : 'Read aloud with voice'}
              >
                {isSpeakingThis ? <Pause size={13} className="text-cyan-400 animate-pulse" /> : <Volume2 size={13} />}
                <span>{isSpeakingThis ? 'Stop' : 'Voice'}</span>
              </button>
            )}

            {/* Regenerate for Assistant */}
            {!isUser && onRegenerate && (
              <button
                type="button"
                onClick={() => onRegenerate(message.id)}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition-all text-xs"
                title="Regenerate this response"
              >
                <RotateCcw size={12} />
                <span className="hidden sm:inline">Regenerate</span>
              </button>
            )}
          </div>

          {/* Delete Message */}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(message.id)}
              className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 rounded transition-opacity"
              title="Delete message"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* User Avatar (Right Side for User) */}
      {isUser && (
        <div className="flex-shrink-0 flex flex-col items-center">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <User size={18} />
          </div>
          <span className="text-[10px] font-mono text-slate-500 mt-1 uppercase tracking-wider">YOU</span>
        </div>
      )}
    </div>
  );
};
