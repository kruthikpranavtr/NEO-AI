import React from 'react';
import { Menu, Sparkles, Volume2, VolumeX, ShieldCheck, Activity } from 'lucide-react';
import { AICoreState, PageView } from '../types';
import { soundFX } from '../services/audioFx';

interface HeaderProps {
  onToggleSidebar: () => void;
  coreState: AICoreState;
  activePage: PageView;
  onNavigate: (page: PageView) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  coreState,
  activePage,
  onNavigate,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header
      id="neo-top-header"
      className="sticky top-0 z-30 w-full neo-glass border-b border-cyan-500/15 px-3 sm:px-6 py-3 flex items-center justify-between transition-all"
    >
      {/* Left: Sidebar Toggle & Brand */}
      <div className="flex items-center gap-3">
        <button
          id="neo-mobile-menu-btn"
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-cyan-400 border border-cyan-500/20 hover:border-cyan-400 hover:shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all focus:outline-none"
          title="Toggle Sidebar Menu"
          aria-label="Toggle Sidebar Menu"
        >
          <Menu size={20} />
        </button>

        {/* NEO Logo */}
        <div
          onClick={() => onNavigate('home')}
          className="cursor-pointer flex items-center gap-2 group select-none"
          title="Return to NEO Home"
        >
          <div className="flex flex-col">
            <span className="font-orbitron font-black text-xl sm:text-2xl tracking-[0.25em] text-white text-glow-cyan group-hover:text-cyan-300 transition-colors">
              N E O
            </span>
            <span className="text-[9px] font-mono tracking-widest text-cyan-400/80 uppercase hidden sm:block">
              Your Intelligent AI Assistant
            </span>
          </div>
        </div>
      </div>

      {/* Center: System Status Beacon */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#070d1e] border border-cyan-500/20 shadow-inner">
        <div className="relative flex items-center justify-center w-3 h-3">
          <span
            className={`w-2 h-2 rounded-full ${
              coreState === 'listening'
                ? 'bg-cyan-400 animate-ping'
                : coreState === 'thinking'
                ? 'bg-blue-400 animate-pulse'
                : coreState === 'speaking'
                ? 'bg-emerald-400 animate-bounce'
                : coreState === 'error'
                ? 'bg-rose-500'
                : 'bg-cyan-500'
            }`}
          />
        </div>
        <span className="text-[11px] font-mono tracking-wider text-slate-300 uppercase">
          CORE: <span className="text-cyan-400 font-bold">{coreState}</span>
        </span>
        <Activity size={12} className="text-cyan-400/70 ml-1" />
      </div>

      {/* Right: Sound FX Toggle, Status, Navigation Pills */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Sound FX Toggle */}
        <button
          type="button"
          onClick={onToggleSound}
          className={`p-2 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all ${
            soundEnabled
              ? 'bg-cyan-950/40 text-cyan-300 border-cyan-500/30 hover:border-cyan-400'
              : 'bg-slate-900/60 text-slate-500 border-slate-800 hover:text-slate-300'
          }`}
          title={soundEnabled ? 'Mute Sci-Fi Audio FX' : 'Enable Sci-Fi Audio FX'}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          <span className="hidden lg:inline text-[11px]">{soundEnabled ? 'FX ON' : 'FX OFF'}</span>
        </button>

        {/* Security Badge */}
        <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-emerald-400/90 bg-emerald-950/30 px-2.5 py-1 rounded-xl border border-emerald-900/40">
          <ShieldCheck size={14} />
          <span>SECURE</span>
        </div>
      </div>
    </header>
  );
};
