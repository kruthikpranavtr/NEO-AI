import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  History as HistoryIcon,
  Settings as SettingsIcon,
  User as UserIcon,
  Home as HomeIcon,
  Trash2,
  Edit3,
  Check,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Cpu,
} from 'lucide-react';
import { Conversation, PageView } from '../types';
import { AICore } from './AICore';
import { soundFX } from '../services/audioFx';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  conversations: Conversation[];
  activeConversationId?: string;
  activePage: PageView;
  onNavigate: (page: PageView) => void;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  conversations,
  activeConversationId,
  activePage,
  onNavigate,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startRename = (c: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(c.id);
    setEditTitle(c.title);
  };

  const saveRename = (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playRipple();
    onDeleteConversation(id);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="neo-sidebar"
        className={`
          fixed lg:static top-0 left-0 bottom-0 z-50
          w-72 sm:w-80 bg-[#050917]/95 backdrop-blur-2xl border-r border-cyan-500/20
          flex flex-col justify-between transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:-translate-x-full lg:w-0 lg:border-r-0'}
        `}
      >
        {/* Top Section */}
        <div className="flex flex-col h-full overflow-hidden p-4">
          
          {/* Header Row in Sidebar */}
          <div className="flex items-center justify-between pb-3 border-b border-cyan-500/15">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Cpu size={18} />
              </div>
              <div>
                <h2 className="font-orbitron font-bold text-base text-white tracking-widest">
                  NEO CORE
                </h2>
                <span className="text-[10px] font-mono text-cyan-400/80">AI NAVIGATION</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onToggle}
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
              title="Close Sidebar"
            >
              <ChevronLeft size={20} />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            id="neo-sidebar-new-chat-btn"
            type="button"
            onClick={() => {
              soundFX.playRipple();
              onNewChat();
            }}
            className="mt-4 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold font-space flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus size={18} className="stroke-[3]" />
            <span className="tracking-wide">New Chat</span>
          </button>

          {/* Quick Page Nav Tabs */}
          <div className="grid grid-cols-2 gap-1.5 my-3">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono transition-all ${
                activePage === 'home'
                  ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <HomeIcon size={14} />
              <span>Home</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('chat')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono transition-all ${
                activePage === 'chat'
                  ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <MessageSquare size={14} />
              <span>Chat View</span>
            </button>
          </div>

          {/* Search Input for Chats */}
          <div className="relative my-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#080d1e] border border-cyan-500/15 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/40 font-space"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Recent Chats Section */}
          <div className="flex-1 overflow-y-auto pr-1 mt-2 space-y-1">
            <div className="flex items-center justify-between px-1 py-1 text-[11px] font-mono text-cyan-400/70 uppercase tracking-wider">
              <span>Recent Chats ({filteredConversations.length})</span>
            </div>

            {filteredConversations.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 italic">
                {searchQuery ? 'No matching chats found' : 'No chats yet. Start a conversation!'}
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isActive = activeConversationId === c.id && activePage === 'chat';
                const isEditing = editingId === c.id;

                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      onSelectConversation(c.id);
                      if (window.innerWidth < 1024) onToggle();
                    }}
                    className={`group relative flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                      isActive
                        ? 'bg-cyan-950/70 border border-cyan-500/40 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.15)] font-medium'
                        : 'hover:bg-slate-900/80 text-slate-300 border border-transparent hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                      <MessageSquare
                        size={14}
                        className={`flex-shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-400'}`}
                      />
                      {isEditing ? (
                        <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveRename(c.id, e);
                              if (e.key === 'Escape') cancelRename(e as unknown as React.MouseEvent);
                            }}
                            autoFocus
                            className="bg-slate-950 border border-cyan-500 rounded px-1.5 py-0.5 text-xs text-cyan-200 w-full focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={(e) => saveRename(c.id, e)}
                            className="text-emerald-400 hover:text-emerald-300 p-0.5"
                          >
                            <Check size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={cancelRename}
                            className="text-slate-400 hover:text-slate-300 p-0.5"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <span className="truncate">{c.title || 'Untitled Session'}</span>
                      )}
                    </div>

                    {/* Quick action buttons on hover */}
                    {!isEditing && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => startRename(c, e)}
                          className="text-slate-500 hover:text-cyan-300 p-1 rounded hover:bg-slate-800"
                          title="Rename chat"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(c.id, e)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800"
                          title="Delete chat"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Footer Navigation */}
          <div className="pt-3 mt-auto border-t border-cyan-500/15 space-y-1">
            <button
              type="button"
              onClick={() => onNavigate('history')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-mono transition-all ${
                activePage === 'history'
                  ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <HistoryIcon size={16} />
              <span>Full History</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('profile')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-mono transition-all ${
                activePage === 'profile'
                  ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <UserIcon size={16} />
              <span>Profile & Metrics</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-mono transition-all ${
                activePage === 'settings'
                  ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <SettingsIcon size={16} />
              <span>Settings</span>
            </button>
          </div>

        </div>
      </aside>
    </>
  );
};
