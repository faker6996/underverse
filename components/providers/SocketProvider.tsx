"use client";

import React, { createContext, useContext, useEffect, useMemo } from "react";
import type { Socket } from "socket.io-client";
import { getSocket } from "@/realtime/client/socket";

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socket = useMemo(() => getSocket(), []);

  useEffect(() => {
    if (!socket.connected) socket.connect();
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export function useSocket() {
  return useContext(SocketContext);
}
