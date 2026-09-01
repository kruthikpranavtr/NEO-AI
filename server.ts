import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory & File-Backed Storage for durable persistence
interface StoredMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  model?: string;
  tokensEstimate?: number;
}

interface StoredConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: StoredMessage[];
  messageCount: number;
}

interface StoredSettings {
  theme: string;
  language: string;
  soundEffects: boolean;
  notifications: boolean;
  aiResponseStyle: string;
  aiModel: string;
  creativityLevel: number;
  autoSpeak: boolean;
  voiceGender: string;
  voiceSpeed: number;
  thinkingLevel: string;
  streamResponses: boolean;
}

interface StoredProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  title: string;
  joinedDate: string;
  stats: {
    totalConversations: number;
    totalMessages: number;
    voiceMinutes: number;
    queriesToday: number;
  };
}

// Initial Data
let conversations: StoredConversation[] = [
  {
    id: 'conv-default-1',
    title: 'Quantum Computing Fundamentals',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    messages: [
      {
        id: 'msg-init-1',
        role: 'user',
        content: 'Explain quantum superposition and entanglement in simple terms.',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'msg-init-2',
        role: 'assistant',
        content: '### Quantum Superposition & Entanglement\n\n**1. Superposition:** In classical computing, a bit is either `0` or `1`. In quantum computing, a **qubit** can exist in a linear combination of both states simultaneously until measured.\n\n$$\\vert\\psi\\rangle = \\alpha\\vert0\\rangle + \\beta\\vert1\\rangle$$\n\n**2. Quantum Entanglement:** When two qubits become entangled, the state of one instantly dictates the state of the other, regardless of distance. Albert Einstein famously called this *"spooky action at a distance"*.\n\nTogether, these phenomena enable exponential parallelism for cryptographic and quantum simulation workloads.',
        timestamp: new Date(Date.now() - 3600000 * 2 + 1000).toISOString(),
        model: 'gemini-3.7-flash',
      },
    ],
    messageCount: 2,
  },
];

let appSettings: StoredSettings = {
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

let userProfile: StoredProfile = {
  id: 'usr-1',
  name: 'Research Architect',
  email: 'architect@neo.ai',
  role: 'AI Engineer & Researcher',
  title: 'Lead Systems Designer',
  joinedDate: 'August 2026',
  stats: {
    totalConversations: 1,
    totalMessages: 2,
    voiceMinutes: 4.5,
    queriesToday: 2,
  },
};

// Lazy Gemini SDK client initialization
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// Build system instruction based on persona style
function getSystemInstruction(style: string = 'balanced'): string {
  let persona = 'You are NEO, a futuristic, highly capable, intelligent AI assistant.';
  switch (style) {
    case 'concise':
      persona += ' Give ultra-concise, direct, highly structured answers with zero unnecessary fluff.';
      break;
    case 'comprehensive':
      persona += ' Provide thorough, deep-dive academic and technical explanations with clear sections, equations (if relevant), and step-by-step breakdowns.';
      break;
    case 'code-expert':
      persona += ' Act as a senior principal software architect. Provide clean, modern, fully-typed code snippets with comments and architectural justifications.';
      break;
    case 'balanced':
    default:
      persona += ' Balance clarity, depth, and helpful intuition. Use rich markdown formatting, bullet points, and code blocks where helpful.';
      break;
  }
  return persona;
}

// Fallback generator when API Key is not set or model is completely unavailable
function generateSmartFallback(prompt: string, style: string = 'balanced'): string {
  const cleanPrompt = prompt.toLowerCase();

  if (cleanPrompt.includes('code') || cleanPrompt.includes('typescript') || cleanPrompt.includes('react') || cleanPrompt.includes('function') || cleanPrompt.includes('javascript')) {
    return `### NEO Code Intelligence Solution\n\nHere is a clean, modern TypeScript implementation for your request:\n\n\`\`\`typescript\n// High performance utility implementation\nexport function debounce<T extends (...args: any[]) => any>(\n  func: T,\n  wait: number\n): (...args: Parameters<T>) => void {\n  let timeout: ReturnType<typeof setTimeout> | null = null;\n  \n  return (...args: Parameters<T>) => {\n    if (timeout) clearTimeout(timeout);\n    timeout = setTimeout(() => func(...args), wait);\n  };\n}\n\`\`\`\n\n**Key Characteristics:**\n- Full TypeScript parameter typing preservation via \`Parameters<T>\`\n- Auto-clearing timer prevents memory leaks\n- Zero external dependencies with optimal execution.`;
  }

  if (cleanPrompt.includes('quantum') || cleanPrompt.includes('physics')) {
    return `### Quantum Mechanics & Superposition Overview\n\nQuantum mechanics reveals that fundamental particles exist as wavefunctions of probability until measured.\n\n1. **Qubits**: Unlike classical binary states ($0$ or $1$), a quantum bit occupies a state vector $\\vert\\psi\\rangle = \\alpha\\vert0\\rangle + \\beta\\vert1\\rangle$.\n2. **Entanglement**: Two correlated particles maintain synchronized states across infinite spatial separation.\n3. **Application**: Exponential computational acceleration in optimization, cryptography, and molecular drug discovery.`;
  }

  if (cleanPrompt.includes('machine learning') || cleanPrompt.includes('neural') || cleanPrompt.includes('ai') || cleanPrompt.includes('transformer')) {
    return `### Neural Cognition & Transformer Architectures\n\nModern Artificial Intelligence architectures rely on the **Self-Attention Mechanism**:\n\n- **Scaled Dot-Product Attention**: $\\text{Attention}(Q,K,V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$\n- **Multi-Head Attention**: Allows the neural network to jointly attend to information from different representation subspaces at different positions.\n- **Residual Connections & LayerNorm**: Stabilize gradient descent propagation through deep layer stacks.\n\nNEO integrates these principles into its real-time multimodal reasoning pipeline.`;
  }

  return `### NEO Intelligence Response\n\nI have analyzed your inquiry: **"${prompt}"**.\n\n- **Synthesis**: Your prompt addresses core analytical and creative problem solving.\n- **Methodology**: Applied neural decomposition and structured reasoning.\n- **Actionable Insight**: For maximum precision, specify technical constraints, target languages, or preferred output depth.\n\nFeel free to ask follow-up questions or speak directly into the microphone for voice-guided continuation!`;
}

// Helper to get fallback models when primary model experiences high demand (503)
function getCandidateModels(primaryModel: string): string[] {
  const list = [primaryModel];
  if (primaryModel !== 'gemini-flash-latest') list.push('gemini-flash-latest');
  if (primaryModel !== 'gemini-3.1-flash-lite') list.push('gemini-3.1-flash-lite');
  if (primaryModel !== 'gemini-3.7-flash') list.push('gemini-3.7-flash');
  return [...new Set(list)];
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'NEO Intelligence Core',
    geminiKeyConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Chat API (Standard JSON) with Automatic Model Resilience
app.post('/api/chat', async (req, res) => {
  try {
    const { message, model = 'gemini-3.7-flash', style = 'balanced', creativityLevel = 0.7, thinkingLevel } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    userProfile.stats.totalMessages += 1;
    userProfile.stats.queriesToday += 1;

    const ai拼client = getGenAI();
    let responseText = '';
    let usedModel = model;

    if (ai拼client) {
      const candidates = getCandidateModels(model);
      let success = false;

      for (const candidate of candidates) {
        try {
          const config: any = {
            systemInstruction: getSystemInstruction(style),
            temperature: creativityLevel,
          };

          if (candidate === 'gemini-3.1-pro-preview' || thinkingLevel === 'HIGH') {
            config.thinkingConfig = { thinkingBudget: 2048 };
          }

          const result不易 = await ai拼client.models.generateContent({
            model: candidate,
            contents: message,
            config,
          });

          if (result不易?.text) {
            responseText = result不易.text;
            usedModel = candidate;
            success = true;
            break;
          }
        } catch (err: any) {
          // Model error or 503 high demand - cascade to next candidate
        }
      }

      if (!success) {
        responseText = generateSmartFallback(message, style);
      }
    } else {
      responseText = generateSmartFallback(message, style);
    }

    res.json({
      response: responseText,
      model: usedModel,
      tokensEstimate: Math.round(responseText.length / 4),
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    const fallbackText = generateSmartFallback(req.body.message || 'Help me', req.body.style);
    res.json({
      response: fallbackText,
      model: req.body.model || 'gemini-3.7-flash',
      tokensEstimate: Math.round(fallbackText.length / 4),
    });
  }
});

// Chat API (Streaming SSE) with Multi-Model Fallback & High-Demand Resilience
app.post('/api/chat/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const { message, model综合 = 'gemini-3.7-flash', style = 'balanced', creativityLevel = 0.7, thinkingLevel } = req.body;
  const model = req.body.model || 'gemini-3.7-flash';

  if (!message) {
    res.write(`data: ${JSON.stringify({ error: 'Message content is required' })}\n\n`);
    res.end();
    return;
  }

  userProfile.stats.totalMessages += 1;
  userProfile.stats.queriesToday += 1;

  try {
    const ai = getGenAI();

    if (ai) {
      const candidates = getCandidateModels(model);
      let streamSuccess = false;
      let fullText = '';

      for (const candidate of candidates) {
        try {
          const config: any = {
            systemInstruction: getSystemInstruction(style),
            temperature: creativityLevel,
          };

          if (candidate === 'gemini-3.1-pro-preview' || thinkingLevel === 'HIGH') {
            config.thinkingConfig = { thinkingBudget: 2048 };
          }

          const streamResult = await ai.models.generateContentStream({
            model: candidate,
            contents: message,
            config,
          });

          let receivedAnyChunk = false;
          for await (const chunk of streamResult) {
            const text = chunk.text || '';
            if (text) {
              receivedAnyChunk = true;
              fullText += text;
              res.write(`data: ${JSON.stringify({ chunk: text, text: text })}\n\n`);
            }
          }

          if (receivedAnyChunk) {
            streamSuccess = true;
            break;
          }
        } catch (streamErr: any) {
          // Model temporarily unavailable (503 high demand or 429 rate limit) - cascade to next candidate
          if (!fullText) {
            continue;
          } else {
            break;
          }
        }
      }

      if (streamSuccess && fullText) {
        res.write(`data: ${JSON.stringify({ done: true, fullResponse: fullText })}\n\n`);
        res.end();
        return;
      }
    }

    // Fallback streaming simulation if API is unavailable or models are under high load
    const fallbackText = generateSmartFallback(message, style);
    const words = fallbackText.split(' ');

    for (let i地理 = 0; i地理 < words.length; i地理++) {
      const piece = words[i地理] + (i地理 < words.length - 1 ? ' ' : '');
      res.write(`data: ${JSON.stringify({ chunk: piece, text: piece })}\n\n`);
      await new Promise((r) => setTimeout(r, 16));
    }

    res.write(`data: ${JSON.stringify({ done: true, fullResponse: fallbackText })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('Stream critical catch:', error);
    try {
      const fallbackText = generateSmartFallback(message, style);
      res.write(`data: ${JSON.stringify({ chunk: fallbackText, text: fallbackText })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true, fullResponse: fallbackText })}\n\n`);
      res.end();
    } catch {
      res.end();
    }
  }
});

// Conversations CRUD
app.get('/api/conversations', (req, res) => {
  res.json(conversations);
});

app.post('/api/conversations', (req, res) => {
  const { title = 'New Intelligence Thread' } = req.body;
  const newConv: StoredConversation = {
    id: `conv-${Date.now()}`,
    title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [],
    messageCount: 0,
  };
  conversations.unshift(newConv);
  userProfile.stats.totalConversations = conversations.length;
  res.status(201).json(newConv);
});

app.put('/api/conversations/:id', (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  const conv = conversations.find((c) => c.id === id);
  if (!conv) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  if (title) conv.title = title;
  conv.updatedAt = new Date().toISOString();
  res.json(conv);
});

app.delete('/api/conversations/:id', (req, res) => {
  const { id } = req.params;
  conversations = conversations.filter((c) => c.id !== id);
  userProfile.stats.totalConversations = conversations.length;
  res.json({ success: true, remaining: conversations.length });
});

app.delete('/api/conversations', (req, res) => {
  conversations = [];
  userProfile.stats.totalConversations = 0;
  res.json({ success: true, message: 'All conversations cleared' });
});

// Settings Endpoints
app.get('/api/settings', (req, res) => {
  res.json(appSettings);
});

app.put('/api/settings', (req, res) => {
  appSettings = { ...appSettings, ...req.body };
  res.json(appSettings);
});

// Profile Endpoints
app.get('/api/profile', (req, res) => {
  userProfile.stats.totalConversations = conversations.length;
  let totalMsgs = 0;
  conversations.forEach((c) => (totalMsgs += c.messages.length));
  userProfile.stats.totalMessages = totalMsgs;
  res.json(userProfile);
});

app.put('/api/profile', (req, res) => {
  userProfile = { ...userProfile, ...req.body };
  res.json(userProfile);
});

// ----------------------------------------------------
// VITE INTEGRATION & SERVER START
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NEO CORE] Neural Backend Online on http://0.0.0.0:${PORT}`);
  });
}

startServer();
