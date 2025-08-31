import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

const SOCKET_SERVER_URL = process.env.NODE_ENV === 'production' 
  ? "https://your-production-domain.com" 
  : "http://localhost:3001";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const socketIo = io(SOCKET_SERVER_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ["websocket", "polling"], // Fallback to polling for low bandwidth
      timeout: 20000,
      forceNew: true,
    });

    socketIo.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
      setError("");
    });

    socketIo.on("connect_error", (err: any) => {
      console.error("Connection error:", err);
      setError("Connection error. Retrying...");
      setIsConnected(false);
    });

    socketIo.on("disconnect", (reason) => {
      console.warn("Socket disconnected:", reason);
      setIsConnected(false);
      if (reason === "io server disconnect") {
        // Server disconnected, try to reconnect
        socketIo.connect();
      }
    });

    socketIo.on("reconnect", (attemptNumber) => {
      console.log("Reconnected after", attemptNumber, "attempts");
      setIsConnected(true);
      setError("");
    });

    socketIo.on("reconnect_error", (err) => {
      console.error("Reconnection failed:", err);
      setError("Reconnection failed. Check your internet connection.");
    });

    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, []);

  const sendMessage = (event: string, data: any) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    } else {
      setError("Cannot send message. Not connected to server.");
    }
  };

  const joinRoom = (roomId: string) => {
    if (socket && isConnected) {
      socket.emit("join-room", roomId);
    }
  };

  const leaveRoom = (roomId: string) => {
    if (socket && isConnected) {
      socket.emit("leave-room", roomId);
    }
  };

  return { 
    socket, 
    isConnected, 
    error, 
    sendMessage, 
    joinRoom, 
    leaveRoom 
  };
};
