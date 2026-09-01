import { AppSettings, ChatMessage, Conversation, UserProfile } from '../types';

export interface ChatRequestPayload {
  message: string;
  conversationId?: string;
  model?: string;
  style?: string;
  creativityLevel?: number;
  thinkingLevel?: 'LOW' | 'HIGH';
}

export interface ChatResponsePayload {
  response: string;
  conversationId: string;
  messageId: string;
  model: string;
  tokensEstimate?: number;
}

export const api = {
  // Send message and receive response
  async sendMessage(payload: ChatRequestPayload): Promise<ChatResponsePayload> {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Network response was not ok' }));
      throw new Error(errorData.error || `Request failed with status ${res.status}`);
    }

    return res.json();
  },

  // Stream message via SSE
  streamMessage(
    payload: ChatRequestPayload,
    onChunk: (chunk: string) => void,
    onDone: (data: { conversationId: string; messageId: string }) => void,
    onError: (err: string) => void
  ) {
    fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errJson = await response.json().catch(() => ({ error: 'Streaming failed' }));
          onError(errJson.error || 'Server error');
          return;
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        if (!reader) {
          onError('Stream body unavailable');
          return;
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const dataStr = trimmed.substring(6);
              if (dataStr === '[DONE]') {
                continue;
              }
              try {
                const parsed = JSON.parse(dataStr);
                const chunkContent = parsed.chunk || parsed.text;
                if (chunkContent) {
                  onChunk(chunkContent);
                }
                if (parsed.done) {
                  onDone({
                    conversationId: parsed.conversationId || payload.conversationId || '',
                    messageId: parsed.messageId || '',
                  });
                }
                if (parsed.error) {
                  onError(parsed.error);
                }
              } catch {
                // Raw text chunk fallback
                if (dataStr) {
                  onChunk(dataStr);
                }
              }
            }
          }
        }
      })
      .catch((err) => {
        onError(err.message || 'Network connection failed');
      });
  },

  // Conversations
  async getConversations(): Promise<Conversation[]> {
    const res = await fetch('/api/conversations');
    if (!res.ok) throw new Error('Failed to load conversations');
    return res.json();
  },

  async getConversation(id: string): Promise<Conversation> {
    const res = await fetch(`/api/conversations/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Conversation not found');
    return res.json();
  },

  async createConversation(title?: string): Promise<Conversation> {
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error('Failed to create conversation');
    return res.json();
  },

  async updateConversationTitle(id: string, title: string): Promise<{ success: boolean; title: string }> {
    const res = await fetch(`/api/conversations/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error('Failed to rename conversation');
    return res.json();
  },

  async deleteConversation(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/conversations/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete conversation');
    return res.json();
  },

  async clearAllConversations(): Promise<{ success: boolean }> {
    const res = await fetch('/api/conversations', {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to clear conversations');
    return res.json();
  },

  // Settings
  async getSettings(): Promise<AppSettings> {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to load settings');
    return res.json();
  },

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to save settings');
    return res.json();
  },

  // Profile
  async getProfile(): Promise<UserProfile> {
    const res = await fetch('/api/profile');
    if (!res.ok) throw new Error('Failed to load profile');
    return res.json();
  },

  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    if (!res.ok) throw new Error('Failed to save profile');
    return res.json();
  },

  // Health
  async checkHealth(): Promise<{ status: string; geminiConfigured: boolean; timestamp: string }> {
    const res = await fetch('/api/health');
    return res.json();
  }
};
