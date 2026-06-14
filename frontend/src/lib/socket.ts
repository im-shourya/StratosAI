"use client";

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

class SocketClient {
  private socket: Socket | null = null;
  private url: string;

  constructor() {
    this.url = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
  }

  connect() {
    if (!this.socket) {
      this.socket = io(this.url, {
        transports: ['websocket'],
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('Connected to StratosAI WebSocket');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from StratosAI WebSocket');
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }
}

export const socketClient = new SocketClient();

// Hook for components to use the socket
export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = socketClient.connect();

    return () => {
      // Don't disconnect globally on unmount, just remove component-specific listeners if needed
    };
  }, []);

  return socketRef.current;
}
