import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  Trash2,
  Edit3,
  Calendar,
  Clock,
  Download,
  ArrowRight,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { Conversation } from '../types';
import { soundFX } from '../services/audioFx';

interface HistoryProps {
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onClearAll: () => void;
}

export const History: React.FC<HistoryProps> = ({
  conversations,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
  onClearAll,
}) => {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.messages.some((m) => m.content.toLowerCase().includes(search.toLowerCase()))
  );

  // Group by timeframe
  const groupConversations = () => {
    const today: Conversation[] = [];
    const yesterday: Conversation[] = [];
    const earlier: Conversation[] = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 86400000;

    filtered.forEach((c) => {
      const cTime = new Date(c.updatedAt || c.createdAt).getTime();
      if (cTime >= startOfToday) {
        today.push(c);
      } else if (cTime >= startOfYesterday) {
        yesterday.push(c);
      } else {
        earlier.push(c);
      }
    });

    return { today, yesterday, earlier };
  };

  const { today, yesterday, earlier } = groupConversations();

  const handleExport = (c: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(c, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `neo-chat-${c.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const renderSection = (title: string, items: Conversation[]) => {
    if (items.length === 0) return null;

    return (
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400/80 uppercase tracking-widest px-1">
          <Calendar size={13} />
          <span>{title} ({items.length})</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((c) => {
            const isEditing = editingId === c.id;
            const lastMessage = c.messages[c.messages.length - 1];

            return (
              <div
                key={c.id}
                onClick={() => {
                  soundFX.playRipple();
                  onSelectConversation(c.id);
                }}
                className="group relative p-4 rounded-2xl neo-glass-card hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="p-2 rounded-xl bg-slate-900 border border-cyan-500/20 text-cyan-400 group-hover:border-cyan-400/40">
                        <MessageSquare size={16} />
                      </div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              onRenameConversation(c.id, editTitle.trim());
                              setEditingId(null);
                            }
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                          className="bg-slate-950 border border-cyan-500 rounded px-2 py-1 text-sm text-cyan-200 w-full focus:outline-none"
                        />
                      ) : (
                        <h3 className="text-sm font-semibold font-space text-slate-100 group-hover:text-cyan-300 transition-colors truncate">
                          {c.title || 'Untitled Conversation'}
                        </h3>
                      )}
                    </div>

                    <ArrowRight
                      size={16}
                      className="text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all flex-shrink-0"
                    />
                  </div>

                  <p className="text-xs text-slate-400 mt-2.5 line-clamp-2">
                    {lastMessage ? lastMessage.content : 'No messages in this session yet.'}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/60 text-[11px] font-mono text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {new Date(c.updatedAt || c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                    <span>•</span>
                    <span>{c.messages.length} msgs</span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(c.id);
                        setEditTitle(c.title);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800"
                      title="Rename"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleExport(c, e)}
                      className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800"
                      title="Export JSON"
                    >
                      <Download size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(c.id);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div id="neo-history-page" className="max-w-5xl mx-auto px-4 py-8 select-none">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cyan-500/15">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
            <Sparkles size={14} />
            <span>SESSION ARCHIVES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-orbitron text-white">
            Chat History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage, resume, export, and search through your past conversations with NEO.
          </p>
        </div>

        {conversations.length > 0 && (
          <div>
            {!showClearConfirm ? (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-900/50 text-xs font-mono flex items-center gap-2 transition-all"
              >
                <Trash2 size={14} />
                <span>Clear All History</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-rose-950/80 border border-rose-600/50 p-2 rounded-xl text-xs font-mono text-rose-200">
                <AlertTriangle size={14} className="text-rose-400" />
                <span>Confirm delete all?</span>
                <button
                  type="button"
                  onClick={() => {
                    onClearAll();
                    setShowClearConfirm(false);
                  }}
                  className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold"
                >
                  Yes, Clear
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="px-2 py-1 bg-slate-800 text-slate-300 rounded"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search Filter */}
      <div className="my-6">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search all conversations and messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#080d1e] border border-cyan-500/20 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] font-space"
          />
        </div>
      </div>

      {/* Timeline Groupings */}
      {conversations.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl neo-glass-card">
          <MessageSquare size={36} className="mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-300 font-space">No Conversation History</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Conversations you start will be persistently saved here for future reference.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500 italic">
          No conversations matching "{search}"
        </div>
      ) : (
        <div>
          {renderSection('Today', today)}
          {renderSection('Yesterday', yesterday)}
          {renderSection('Earlier', earlier)}
        </div>
      )}

    </div>
  );
};
