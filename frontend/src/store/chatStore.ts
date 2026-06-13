import { create } from 'zustand';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatState {
  messages: Message[];
  isStreaming: boolean;
  addMessage: (msg: Message) => void;
  appendStreamChunk: (chunk: string) => void;
  setStreaming: (isStreaming: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isStreaming: false,
  
  addMessage: (msg: Message) => set((state) => ({
    messages: [...state.messages, msg]
  })),

  appendStreamChunk: (chunk: string) => set((state) => {
    const lastMsg = state.messages[state.messages.length - 1];
    if (lastMsg && lastMsg.role === 'assistant') {
      const newMessages = [...state.messages];
      newMessages[newMessages.length - 1] = {
        ...lastMsg,
        content: lastMsg.content + chunk
      };
      return { messages: newMessages };
    }
    // If last message isn't assistant, create a new one
    return {
      messages: [...state.messages, { role: 'assistant', content: chunk }]
    };
  }),

  setStreaming: (isStreaming: boolean) => set({ isStreaming }),
  clearMessages: () => set({ messages: [], isStreaming: false }),
}));
