import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Sliders,
  Volume2,
  Cpu,
  Database,
  Check,
  RotateCcw,
  Sparkles,
  Shield,
  Layers,
  Bell,
} from 'lucide-react';
import { AIModelType, AppSettings, ResponseStyle } from '../types';
import { soundFX } from '../services/audioFx';

interface SettingsProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onClearAllHistory: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  onUpdateSettings,
  onClearAllHistory,
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleChange = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    onUpdateSettings({ [key]: value });
    soundFX.playRipple();
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const handleResetDefaults = () => {
    const defaults: AppSettings = {
      theme: 'futuristic-dark',
      language: 'en',
      soundEffects: true,
      notifications: true,
      aiResponseStyle: 'balanced',
      aiModel: 'gemini-3.7-flash',
      creativityLevel: 0.7,
      autoSpeak: false,
      voiceGender: 'female',
      voiceSpeed: 1.0,
      thinkingLevel: 'LOW',
      streamResponses: true,
    };
    setLocalSettings(defaults);
    onUpdateSettings(defaults);
    soundFX.playRipple();
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  return (
    <div id="neo-settings-page" className="max-w-4xl mx-auto px-4 py-8 select-none space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cyan-500/15">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
            <Sliders size={14} />
            <span>NEO SYSTEM CONFIGURATION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-orbitron text-white">
            Settings & Preferences
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Configure AI reasoning engines, voice parameters, sensory feedback, and data storage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedFeedback && (
            <span className="flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 rounded-xl">
              <Check size={14} />
              <span>SAVED</span>
            </span>
          )}
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-mono flex items-center gap-1.5 transition-all"
            title="Reset to factory defaults"
          >
            <RotateCcw size={13} />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: AI INTELLIGENCE & MODELS */}
      <div className="p-6 rounded-3xl neo-glass-card border border-cyan-500/20 space-y-5">
        <div className="flex items-center gap-2.5 text-sm font-bold font-orbitron text-white border-b border-slate-800 pb-3">
          <Cpu size={18} className="text-cyan-400" />
          <span>AI NEURAL ENGINE CONFIGURATION</span>
        </div>

        {/* Model Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-mono text-cyan-300">
            Selected Gemini Intelligence Model
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                id: 'gemini-flash-latest',
                title: 'Gemini Flash (Latest)',
                desc: 'Fastest latency, stable high-throughput execution',
                tag: 'RECOMMENDED',
              },
              {
                id: 'gemini-3.7-flash',
                title: 'Gemini 3.7 Flash',
                desc: 'Balanced, state-of-the-art multimodal reasoning',
                tag: 'ADVANCED',
              },
              {
                id: 'gemini-3.1-flash-lite',
                title: 'Gemini 3.1 Flash Lite',
                desc: 'Ultra low latency, instantaneous conversational speed',
                tag: 'FAST',
              },
              {
                id: 'gemini-3.1-pro-preview',
                title: 'Gemini 3.1 Pro',
                desc: 'Advanced problem solving and high thinking mode',
                tag: 'DEEP THINKING',
              },
            ].map((m) => {
              const isSelected = localSettings.aiModel === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleChange('aiModel', m.id as AIModelType)}
                  className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-cyan-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-space text-white">{m.title}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-900">
                      {m.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{m.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Response Style */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-mono text-cyan-300">
            NEO Response Persona & Tone
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'concise', label: 'Concise & Direct' },
              { id: 'balanced', label: 'Balanced & Clear' },
              { id: 'comprehensive', label: 'Deep Comprehensive' },
              { id: 'code-expert', label: 'Code & Architecture' },
            ].map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => handleChange('aiResponseStyle', style.id as ResponseStyle)}
                className={`py-2 px-3 rounded-xl text-xs font-mono border text-center transition-all ${
                  localSettings.aiResponseStyle === style.id
                    ? 'bg-cyan-500 text-black font-bold border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-cyan-500/30'
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        {/* Creativity Slider */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-cyan-300">Creativity & Neural Temperature</span>
            <span className="text-white font-bold">{localSettings.creativityLevel.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.1"
            value={localSettings.creativityLevel}
            onChange={(e) => handleChange('creativityLevel', parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>0.0 (Deterministic / Exact)</span>
            <span>0.5 (Balanced)</span>
            <span>1.0 (Creative & Exploratory)</span>
          </div>
        </div>

        {/* Streaming Mode Toggle */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-xs font-mono text-cyan-300 block">Real-Time Streaming Responses</span>
            <span className="text-[11px] text-slate-400">Stream words progressively as NEO generates them</span>
          </div>
          <input
            type="checkbox"
            checked={localSettings.streamResponses}
            onChange={(e) => handleChange('streamResponses', e.target.checked)}
            className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-400 cursor-pointer"
          />
        </div>
      </div>

      {/* SECTION 2: VOICE & AUDIO SYNTHESIS */}
      <div className="p-6 rounded-3xl neo-glass-card border border-cyan-500/20 space-y-5">
        <div className="flex items-center gap-2.5 text-sm font-bold font-orbitron text-white border-b border-slate-800 pb-3">
          <Volume2 size={18} className="text-cyan-400" />
          <span>VOICE & ACOUSTIC SETTINGS</span>
        </div>

        {/* Auto Speak Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-cyan-300 block">Auto-Read AI Responses (Text-to-Speech)</span>
            <span className="text-[11px] text-slate-400">Automatically read NEO's answers aloud when received</span>
          </div>
          <input
            type="checkbox"
            checked={localSettings.autoSpeak}
            onChange={(e) => handleChange('autoSpeak', e.target.checked)}
            className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-400 cursor-pointer"
          />
        </div>

        {/* Sound Effects FX */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-cyan-300 block">Futuristic UI Sound Effects</span>
            <span className="text-[11px] text-slate-400">Procedural Web Audio chimes for core clicks, mic, and sends</span>
          </div>
          <input
            type="checkbox"
            checked={localSettings.soundEffects}
            onChange={(e) => handleChange('soundEffects', e.target.checked)}
            className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-400 cursor-pointer"
          />
        </div>

        {/* Voice Speed */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-cyan-300">Speech Reading Rate</span>
            <span className="text-white font-bold">{localSettings.voiceSpeed}x</span>
          </div>
          <input
            type="range"
            min="0.8"
            max="1.4"
            step="0.1"
            value={localSettings.voiceSpeed}
            onChange={(e) => handleChange('voiceSpeed', parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>
      </div>

      {/* SECTION 3: GENERAL & DATA MANAGEMENT */}
      <div className="p-6 rounded-3xl neo-glass-card border border-cyan-500/20 space-y-5">
        <div className="flex items-center gap-2.5 text-sm font-bold font-orbitron text-white border-b border-slate-800 pb-3">
          <Database size={18} className="text-cyan-400" />
          <span>GENERAL & DATA MANAGEMENT</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <span className="text-xs font-mono text-rose-400 block font-bold">Wipe Stored Conversation History</span>
            <span className="text-[11px] text-slate-400">Permanently delete all conversation threads from local SQLite/database</span>
          </div>
          <button
            type="button"
            onClick={onClearAllHistory}
            className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-600/40 text-xs font-mono transition-all self-start sm:self-auto"
          >
            Clear All History
          </button>
        </div>
      </div>

    </div>
  );
};
