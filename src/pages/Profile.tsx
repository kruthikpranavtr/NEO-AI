import React, { useState } from 'react';
import {
  User,
  Mail,
  Shield,
  Clock,
  Sparkles,
  Zap,
  Check,
  Edit2,
  Cpu,
  Database,
  Award,
  Key,
} from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
}

export const Profile: React.FC<ProfileProps> = ({ profile, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [role, setRole] = useState(profile.role || 'AI Architect');
  const [title, setTitle] = useState(profile.title || 'Senior Researcher');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ name, email, role, title });
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div id="neo-profile-page" className="max-w-4xl mx-auto px-4 py-8 select-none">
      
      {/* Header Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl neo-glass-card border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.1)] overflow-hidden">
        {/* Glow flare */}
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Avatar with glowing cyber ring */}
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-cyan-400 p-[2px] shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              <div className="w-full h-full rounded-2xl bg-[#040816] flex items-center justify-center text-cyan-400">
                <User size={48} />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 border-2 border-[#040816] w-5 h-5 rounded-full" title="Online" />
          </div>

          {/* User Details */}
          <div className="flex-1 text-center sm:text-left space-y-1.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-orbitron text-white">
                  {profile.name}
                </h1>
                <p className="text-xs sm:text-sm font-mono text-cyan-400">
                  {profile.role} • {profile.title}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 text-xs font-mono flex items-center gap-1.5 transition-all self-center sm:self-auto"
              >
                <Edit2 size={13} />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Mail size={13} className="text-cyan-400" />
                {profile.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-blue-400" />
                Member since {profile.joinedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form Drawer */}
        {isEditing && (
          <form onSubmit={handleSave} className="mt-6 pt-6 border-t border-cyan-500/20 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-cyan-300 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#030612] border border-cyan-500/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-cyan-300 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#030612] border border-cyan-500/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-cyan-300 mb-1">Role / Specialization</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#030612] border border-cyan-500/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-cyan-300 mb-1">Title / Affiliation</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#030612] border border-cyan-500/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold text-xs font-mono hover:shadow-[0_0_15px_rgba(6,182,212,0.6)]"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}

        {saveSuccess && (
          <div className="mt-4 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <Check size={14} />
            <span>Profile successfully updated and synchronized!</span>
          </div>
        )}
      </div>

      {/* Neural Metrics Grid */}
      <div className="mt-8 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest px-1">
          <Sparkles size={14} />
          <span>NEO USAGE & INTELLIGENCE METRICS</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl neo-glass-card border border-cyan-500/15 flex flex-col justify-between">
            <div className="flex items-center justify-between text-cyan-400 mb-2">
              <Cpu size={18} />
              <span className="text-[10px] font-mono text-slate-500">THREADS</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-orbitron text-white">
              {profile.stats.totalConversations}
            </div>
            <span className="text-xs text-slate-400 mt-1">Saved Sessions</span>
          </div>

          <div className="p-4 rounded-2xl neo-glass-card border border-cyan-500/15 flex flex-col justify-between">
            <div className="flex items-center justify-between text-blue-400 mb-2">
              <Zap size={18} />
              <span className="text-[10px] font-mono text-slate-500">MESSAGES</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-orbitron text-white">
              {profile.stats.totalMessages}
            </div>
            <span className="text-xs text-slate-400 mt-1">Total Exchanges</span>
          </div>

          <div className="p-4 rounded-2xl neo-glass-card border border-cyan-500/15 flex flex-col justify-between">
            <div className="flex items-center justify-between text-teal-400 mb-2">
              <Sparkles size={18} />
              <span className="text-[10px] font-mono text-slate-500">VOICE</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-orbitron text-white">
              {profile.stats.voiceMinutes}
            </div>
            <span className="text-xs text-slate-400 mt-1">Voice Minutes</span>
          </div>

          <div className="p-4 rounded-2xl neo-glass-card border border-cyan-500/15 flex flex-col justify-between">
            <div className="flex items-center justify-between text-emerald-400 mb-2">
              <Award size={18} />
              <span className="text-[10px] font-mono text-slate-500">TODAY</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-orbitron text-white">
              {profile.stats.queriesToday}
            </div>
            <span className="text-xs text-slate-400 mt-1">Queries Today</span>
          </div>
        </div>
      </div>

      {/* System Infrastructure Details */}
      <div className="mt-8 p-5 rounded-2xl neo-glass-card border border-cyan-500/15 space-y-4">
        <h3 className="text-sm font-bold font-orbitron text-white flex items-center gap-2">
          <Database size={16} className="text-cyan-400" />
          <span>ARCHITECTURE & SECURITY PROTOCOLS</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-slate-300">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-bold">PERSISTENCE TIER:</span>
            <p className="text-slate-400">Durable JSON/SQLite database storage with automated state persistence.</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-bold">API KEY SECURITY:</span>
            <p className="text-slate-400">Strictly server-side isolated. Zero client-side API key exposure.</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-bold">VOICE ENGINE:</span>
            <p className="text-slate-400">Web Speech STT Recognition & Synthesis API with procedural Web Audio FX.</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-bold">AI CORE VISUALS:</span>
            <p className="text-slate-400">High-DPI 3D Projected WebGL/Canvas Particle Lattice with mouse physics.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
