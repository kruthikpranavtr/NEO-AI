import React, { useEffect, useRef } from 'react';
import { AICore } from '../components/AICore';
import { Message } from '../components/Message';
import { MessageInput } from '../components/MessageInput';
import { ThinkingIndicator } from '../components/LoadingAnimation';
import { AICoreState, AIModelType, ChatMessage, Conversation } from '../types';

interface ChatProps {
  conversation: Conversation | null;
  coreState: AICoreState;
  isListening: boolean;
  isSpeaking: boolean;
  onToggleVoice: () => void;
  onSendMessage: (text: string) => void;
  onRegenerate: (messageId: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onSpeakText: (text: string) => void;
  onStopSpeaking: () => void;
  selectedModel: AIModelType;
  onChangeModel?: (model: AIModelType) => void;
  onCoreClick?: () => void;
  speakingMessageText?: string | null;
}

export const Chat: React.FC<ChatProps> = ({
  conversation,
  coreState,
  isListening,
  isSpeaking,
  onToggleVoice,
  onSendMessage,
  onRegenerate,
  onDeleteMessage,
  onSpeakText,
  onStopSpeaking,
  selectedModel,
  onChangeModel,
  onCoreClick,
  speakingMessageText,
}) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom on new messages or streaming chunks
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages, coreState]);

  const messages = conversation?.messages || [];

  return (
    <div id="neo-chat-page" className="flex flex-col h-full overflow-hidden">
      
      {/* Top Compact AI Core & Status Bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-8 py-2 border-b border-cyan-500/15 bg-[#050917]/70 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <AICore
              state={coreState}
              size="mini"
              interactive={true}
              onClick={onCoreClick}
            />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold font-orbitron tracking-wider text-slate-100 truncate max-w-xs sm:max-w-md">
              {conversation?.title || 'NEO Intelligence Session'}
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400/80">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>CORE ACTIVE // {coreState.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Message count */}
        <div className="text-xs font-mono text-slate-400 bg-slate-900/60 px-3 py-1 rounded-full border border-slate-800">
          {messages.length} {messages.length === 1 ? 'Message' : 'Messages'}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-8 py-4 space-y-2">
        <div className="max-w-4xl mx-auto w-full">
          
          {/* Welcome Message if chat empty */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <AICore state={coreState} size="standard" onClick={onCoreClick} />
              <div className="space-y-1">
                <h3 className="text-lg font-bold font-space text-white">
                  NEO Neural Session Initialized
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md">
                  Speak into the microphone or type below to converse with NEO.
                </p>
              </div>
            </div>
          )}

          {/* Render All Chat Messages */}
          {messages.map((msg) => (
            <Message
              key={msg.id}
              message={msg}
              onRegenerate={onRegenerate}
              onDelete={onDeleteMessage}
              onSpeak={onSpeakText}
              onStopSpeaking={onStopSpeaking}
              isSpeakingThis={isSpeaking && speakingMessageText === msg.content}
            />
          ))}

          {/* Thinking Animation if AI is processing */}
          {coreState === 'thinking' && (
            <ThinkingIndicator modelName={selectedModel} />
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input Bar at Bottom */}
      <div className="flex-shrink-0">
        <MessageInput
          onSendMessage={onSendMessage}
          isThinking={coreState === 'thinking'}
          isListening={isListening}
          isSpeaking={isSpeaking}
          onToggleVoice={onToggleVoice}
          selectedModel={selectedModel}
          onChangeModel={onChangeModel}
        />
      </div>

    </div>
  );
};
