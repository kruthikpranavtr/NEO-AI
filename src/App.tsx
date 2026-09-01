import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LoadingAnimation } from './components/LoadingAnimation';
import { Home } from './pages/Home';
import { Chat } from './pages/Chat';
import { History } from './pages/History';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { AICoreState, AIModelType, AppSettings, ChatMessage, Conversation, PageView, UserProfile } from './types';
import { api } from './services/api';
import { voiceService } from './services/voice';
import { soundFX } from './services/audioFx';

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [activePage, setActivePage] = useState<PageView>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [coreState, setCoreState] = useState<AICoreState>('idle');
  
  // Voice states
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingText, setSpeakingText] = useState<string | null>(null);

  // Conversations & active chat
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);
  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  // Profile & Settings
  const [profile, setProfile] = useState<UserProfile>({
    id: 'usr-1',
    name: 'Research Architect',
    email: 'architect@neo.ai',
    role: 'AI Engineer & Researcher',
    title: 'Lead Systems Designer',
    joinedDate: 'August 2026',
    stats: {
      totalConversations: 0,
      totalMessages: 0,
      voiceMinutes: 0,
      queriesToday: 0,
    },
  });

  const [settings, setSettings] = useState<AppSettings>({
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
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const voiceStartTimeRef = useRef<number | null>(null);

  // Load initial conversations, settings, profile
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [convs, setts, prof] = await Promise.all([
          api.getConversations().catch(() => []),
          api.getSettings().catch(() => settings),
          api.getProfile().catch(() => profile),
        ]);

        if (convs && Array.isArray(convs)) {
          setConversations(convs);
          if (convs.length > 0) {
            setActiveConversationId(convs[0].id);
          }
        }
        if (setts) {
          setSettings(setts);
          setSoundEnabled(setts.soundEffects ?? true);
          soundFX.enabled = setts.soundEffects ?? true;
        }
        if (prof) {
          setProfile(prof);
        }
      } catch (e) {
        console.error('Initialization error:', e);
      }
    }

    loadInitialData();
  }, []);

  // Update soundFX sync
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFX.enabled = next;
    api.updateSettings({ soundEffects: next }).catch(() => {});
  };

  // Switch/Create new chat
  const handleNewChat = useCallback(async () => {
    try {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
      setCoreState('idle');
      
      const newConv = await api.createConversation('New Intelligence Thread');
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
      setActivePage('home');
    } catch {
      // Offline fallback
      const localNew: Conversation = {
        id: `conv-${Date.now()}`,
        title: 'New Intelligence Thread',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
        messageCount: 0,
      };
      setConversations((prev) => [localNew, ...prev]);
      setActiveConversationId(localNew.id);
      setActivePage('home');
    }
  }, []);

  // Select existing conversation
  const handleSelectConversation = useCallback((id: string) => {
    voiceService.stopSpeaking();
    setIsSpeaking(false);
    setActiveConversationId(id);
    setActivePage('chat');
  }, []);

  // Rename conversation
  const handleRenameConversation = async (id: string, newTitle: string) => {
    try {
      await api.updateConversationTitle(id, newTitle);
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
      );
    } catch {
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
      );
    }
  };

  // Delete conversation
  const handleDeleteConversation = async (id: string) => {
    try {
      await api.deleteConversation(id);
      setConversations((prev) => {
        const nextList = prev.filter((c) => c.id !== id);
        if (activeConversationId === id) {
          if (nextList.length > 0) {
            setActiveConversationId(nextList[0].id);
          } else {
            setActiveConversationId(undefined);
            setActivePage('home');
          }
        }
        return nextList;
      });
    } catch {
      setConversations((prev) => prev.filter((c) => c.id !== id));
    }
  };

  // Clear all conversations
  const handleClearAllConversations = async () => {
    try {
      await api.clearAllConversations();
      setConversations([]);
      setActiveConversationId(undefined);
      setActivePage('home');
    } catch {
      setConversations([]);
      setActiveConversationId(undefined);
      setActivePage('home');
    }
  };

  // Text-to-Speech reading
  const handleSpeakText = (text: string) => {
    if (!text) return;
    setSpeakingText(text);
    setIsSpeaking(true);
    setCoreState('speaking');

    voiceService.speak(text, {
      rate: settings.voiceSpeed,
      onStart: () => {
        setIsSpeaking(true);
        setCoreState('speaking');
      },
      onEnd: () => {
        setIsSpeaking(false);
        setSpeakingText(null);
        setCoreState('idle');
      },
      onError: () => {
        setIsSpeaking(false);
        setSpeakingText(null);
        setCoreState('idle');
      },
    });
  };

  const handleStopSpeaking = () => {
    voiceService.stopSpeaking();
    setIsSpeaking(false);
    setSpeakingText(null);
    setCoreState('idle');
  };

  // Main Send Message Handler
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Stop speaking if playing
    handleStopSpeaking();

    // Ensure we have an active conversation
    let convId = activeConversationId;
    let targetConv = conversations.find((c) => c.id === convId);

    if (!convId || !targetConv) {
      try {
        targetConv = await api.createConversation(text.slice(0, 32) + '...');
        convId = targetConv.id;
        setConversations((prev) => [targetConv!, ...prev]);
        setActiveConversationId(convId);
      } catch {
        convId = `conv-${Date.now()}`;
        targetConv = {
          id: convId,
          title: text.slice(0, 32) + '...',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [],
          messageCount: 0,
        };
        setConversations((prev) => [targetConv!, ...prev]);
        setActiveConversationId(convId);
      }
    }

    // Switch to chat view
    setActivePage('chat');

    const userMessageId = `msg-user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    const assistantPlaceholderId = `msg-neo-${Date.now() + 1}`;
    const assistantMessage: ChatMessage = {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      model: settings.aiModel,
      isStreaming: true,
    };

    // Optimistically update conversation state
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          const isFirstMessage = c.messages.length === 0;
          return {
            ...c,
            title: isFirstMessage ? text.slice(0, 32) + (text.length > 32 ? '...' : '') : c.title,
            updatedAt: new Date().toISOString(),
            messages: [...c.messages, userMessage, assistantMessage],
            messageCount: c.messages.length + 2,
          };
        }
        return c;
      })
    );

    // Set core state to thinking
    setCoreState('thinking');

    try {
      if (settings.streamResponses) {
        let accumulatedText = '';

        api.streamMessage(
          {
            message: text,
            conversationId: convId,
            model: settings.aiModel,
            style: settings.aiResponseStyle,
            creativityLevel: settings.creativityLevel,
            thinkingLevel: settings.thinkingLevel,
          },
          // onChunk
          (chunk) => {
            accumulatedText += chunk;
            setConversations((prev) =>
              prev.map((c) => {
                if (c.id === convId) {
                  return {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === assistantPlaceholderId
                        ? { ...m, content: accumulatedText, isStreaming: true }
                        : m
                    ),
                  };
                }
                return c;
              })
            );
          },
          // onDone
          (doneData) => {
            setCoreState('idle');
            soundFX.playReceive();

            setConversations((prev) =>
              prev.map((c) => {
                if (c.id === convId) {
                  return {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === assistantPlaceholderId
                        ? { ...m, content: accumulatedText, isStreaming: false }
                        : m
                    ),
                  };
                }
                return c;
              })
            );

            // Auto-speak if enabled
            if (settings.autoSpeak && accumulatedText) {
              handleSpeakText(accumulatedText);
            }
          },
          // onError
          (errorMsg) => {
            setCoreState('error');
            soundFX.playError();
            setConversations((prev) =>
              prev.map((c) => {
                if (c.id === convId) {
                  return {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === assistantPlaceholderId
                        ? {
                            ...m,
                            content: `⚠️ Neural synchronization error: ${errorMsg}\nPlease check network connection or try again.`,
                            isStreaming: false,
                          }
                        : m
                    ),
                  };
                }
                return c;
              })
            );
            setTimeout(() => setCoreState('idle'), 3500);
          }
        );
      } else {
        // Standard REST POST
        const res = await api.sendMessage({
          message: text,
          conversationId: convId,
          model: settings.aiModel,
          style: settings.aiResponseStyle,
          creativityLevel: settings.creativityLevel,
          thinkingLevel: settings.thinkingLevel,
        });

        setCoreState('idle');
        soundFX.playReceive();

        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === convId) {
              return {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantPlaceholderId
                    ? {
                        ...m,
                        content: res.response,
                        model: res.model,
                        tokensEstimate: res.tokensEstimate,
                        isStreaming: false,
                      }
                    : m
                ),
              };
            }
            return c;
          })
        );

        if (settings.autoSpeak && res.response) {
          handleSpeakText(res.response);
        }
      }
    } catch (err: unknown) {
      setCoreState('error');
      soundFX.playError();
      const errMessage = err instanceof Error ? err.message : 'Unknown communication failure';
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === convId) {
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantPlaceholderId
                  ? {
                      ...m,
                      content: `⚠️ Unable to reach NEO Intelligence Engine: ${errMessage}`,
                      isStreaming: false,
                    }
                  : m
              ),
            };
          }
          return c;
        })
      );
      setTimeout(() => setCoreState('idle'), 3500);
    }
  };

  // Regenerate response
  const handleRegenerate = async (messageId: string) => {
    if (!activeConversation) return;
    const msgIndex = activeConversation.messages.findIndex((m) => m.id === messageId);
    if (msgIndex <= 0) return;

    const previousUserMsg = activeConversation.messages[msgIndex - 1];
    if (previousUserMsg && previousUserMsg.role === 'user') {
      // Remove current assistant msg and resend
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConversation.id) {
            return {
              ...c,
              messages: c.messages.slice(0, msgIndex),
            };
          }
          return c;
        })
      );
      handleSendMessage(previousUserMsg.content);
    }
  };

  // Delete message
  const handleDeleteMessage = (messageId: string) => {
    if (!activeConversation) return;
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversation.id) {
          return {
            ...c,
            messages: c.messages.filter((m) => m.id !== messageId),
          };
        }
        return c;
      })
    );
  };

  // Voice Microphone Toggle
  const handleToggleVoice = () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
      setCoreState('idle');
      if (voiceStartTimeRef.current) {
        const mins = (Date.now() - voiceStartTimeRef.current) / 60000;
        setProfile((p) => ({
          ...p,
          stats: { ...p.stats, voiceMinutes: Math.round((p.stats.voiceMinutes + mins) * 10) / 10 },
        }));
      }
    } else {
      voiceStartTimeRef.current = Date.now();
      setIsListening(true);
      setCoreState('listening');

      const started = voiceService.startListening(
        (transcript, isFinal) => {
          if (isFinal && transcript.trim()) {
            setIsListening(false);
            setCoreState('idle');
            handleSendMessage(transcript.trim());
          }
        },
        () => {
          setIsListening(true);
          setCoreState('listening');
        },
        () => {
          setIsListening(false);
          setCoreState('idle');
        },
        (errorMsg) => {
          setIsListening(false);
          setCoreState('error');
          setTimeout(() => setCoreState('idle'), 2500);
        }
      );

      if (!started) {
        setIsListening(false);
        setCoreState('idle');
      }
    }
  };

  // Update user profile
  const handleUpdateProfile = async (updated: Partial<UserProfile>) => {
    const nextProf = { ...profile, ...updated };
    setProfile(nextProf);
    try {
      await api.updateProfile(updated);
    } catch {}
  };

  // Update settings
  const handleUpdateSettings = async (newSettings: Partial<AppSettings>) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    if (newSettings.soundEffects !== undefined) {
      setSoundEnabled(newSettings.soundEffects);
      soundFX.enabled = newSettings.soundEffects;
    }
    try {
      await api.updateSettings(newSettings);
    } catch {}
  };

  // Initial Loading Screen
  if (isInitializing) {
    return <LoadingAnimation onComplete={() => setIsInitializing(false)} />;
  }

  return (
    <div id="neo-root-app" className="relative flex h-screen w-screen overflow-hidden bg-[#05070a] bg-cyber-grid text-slate-100 font-space selection:bg-cyan-500 selection:text-black">
      
      {/* Background Cyber Ambient Lights */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Collapsible Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        activePage={activePage}
        onNavigate={(page) => {
          setActivePage(page);
          if (window.innerWidth < 1024) setIsSidebarOpen(false);
        }}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
      />

      {/* Main Content Area */}
      <div className="relative flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          coreState={coreState}
          activePage={activePage}
          onNavigate={setActivePage}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 h-full overflow-y-auto relative z-10">
          {activePage === 'home' && (
            <Home
              coreState={coreState}
              onSelectPrompt={handleSendMessage}
              isListening={isListening}
              isSpeaking={isSpeaking}
              onToggleVoice={handleToggleVoice}
              onCoreClick={() => {
                if (!isListening && !isSpeaking && coreState === 'idle') {
                  setCoreState('thinking');
                  setTimeout(() => setCoreState('idle'), 1500);
                }
              }}
            />
          )}

          {activePage === 'chat' && (
            <Chat
              conversation={activeConversation}
              coreState={coreState}
              isListening={isListening}
              isSpeaking={isSpeaking}
              onToggleVoice={handleToggleVoice}
              onSendMessage={handleSendMessage}
              onRegenerate={handleRegenerate}
              onDeleteMessage={handleDeleteMessage}
              onSpeakText={handleSpeakText}
              onStopSpeaking={handleStopSpeaking}
              selectedModel={settings.aiModel}
              onChangeModel={(m) => handleUpdateSettings({ aiModel: m })}
              onCoreClick={() => {
                if (!isListening && !isSpeaking && coreState === 'idle') {
                  setCoreState('thinking');
                  setTimeout(() => setCoreState('idle'), 1500);
                }
              }}
              speakingMessageText={speakingText}
            />
          )}

          {activePage === 'history' && (
            <History
              conversations={conversations}
              onSelectConversation={handleSelectConversation}
              onDeleteConversation={handleDeleteConversation}
              onRenameConversation={handleRenameConversation}
              onClearAll={handleClearAllConversations}
            />
          )}

          {activePage === 'profile' && (
            <Profile
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
            />
          )}

          {activePage === 'settings' && (
            <Settings
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onClearAllHistory={handleClearAllConversations}
            />
          )}
        </main>
      </div>

    </div>
  );
}
