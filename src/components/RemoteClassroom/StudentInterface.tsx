"use client";

import { useState, useRef, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
}

interface Poll {
  question: string;
  options: string[];
  responses: { [key: string]: number };
}

interface Recording {
  id: number;
  title: string;
  url: string;
  duration?: string;
  size?: string;
}

export default function StudentInterface() {
  const { socket, isConnected, error, sendMessage, joinRoom } = useSocket();
  const [isInClass, setIsInClass] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
  const [selectedPollOption, setSelectedPollOption] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [audioVolume, setAudioVolume] = useState(0.8);
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'fair' | 'poor'>('good');
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const roomId = "classroom-main";
  const studentName = `Student_${Math.floor(Math.random() * 1000)}`;

  useEffect(() => {
    // Fetch available recordings
    fetchRecordings();
    
    if (socket) {
      socket.on("session-started", () => {
        setSessionActive(true);
      });

      socket.on("session-ended", () => {
        setSessionActive(false);
        setIsInClass(false);
      });

      socket.on("chat-message", (message: Message) => {
        setMessages(prev => [...prev, message]);
      });

      socket.on("poll-created", (poll: Poll) => {
        setCurrentPoll(poll);
        setHasVoted(false);
        setSelectedPollOption("");
      });

      socket.on("poll-closed", () => {
        setCurrentPoll(null);
        setHasVoted(false);
      });

      socket.on("microphone-toggle", (data: { isOn: boolean }) => {
        // Handle teacher microphone status
        console.log("Teacher microphone:", data.isOn ? "ON" : "OFF");
      });

      socket.on("recording-started", () => {
        console.log("Recording started");
      });

      socket.on("recording-stopped", () => {
        console.log("Recording stopped");
        // Refresh recordings list
        fetchRecordings();
      });

      // Simulate connection quality monitoring
      const qualityInterval = setInterval(() => {
        const qualities: ('good' | 'fair' | 'poor')[] = ['good', 'fair', 'poor'];
        const randomQuality = qualities[Math.floor(Math.random() * 3)];
        setConnectionQuality(randomQuality);
      }, 10000);

      return () => {
        socket.off("session-started");
        socket.off("session-ended");
        socket.off("chat-message");
        socket.off("poll-created");
        socket.off("poll-closed");
        socket.off("microphone-toggle");
        socket.off("recording-started");
        socket.off("recording-stopped");
        clearInterval(qualityInterval);
      };
    }
  }, [socket]);

  const fetchRecordings = async () => {
    try {
      const response = await fetch('/api/recordings');
      if (response.ok) {
        const data = await response.json();
        setRecordings(data);
      }
    } catch (err) {
      console.error("Error fetching recordings:", err);
    }
  };

  const joinClass = () => {
    joinRoom(roomId);
    setIsInClass(true);
    sendMessage("student-joined", { name: studentName, roomId });
  };

  const leaveClass = () => {
    setIsInClass(false);
    sendMessage("student-left", { name: studentName, roomId });
  };

  const sendChatMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage,
        sender: studentName,
        timestamp: new Date()
      };
      sendMessage("chat-message", message);
      setMessages(prev => [...prev, message]);
      setNewMessage("");
    }
  };

  const submitPollResponse = () => {
    if (selectedPollOption && !hasVoted) {
      sendMessage("poll-response", { option: selectedPollOption });
      setHasVoted(true);
    }
  };

  const getConnectionColor = () => {
    switch (connectionQuality) {
      case 'good': return 'bg-green-500';
      case 'fair': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const downloadRecording = (recording: Recording) => {
    // In a real implementation, this would handle the actual download
    // For now, we'll simulate it
    const link = document.createElement('a');
    link.href = recording.url;
    link.download = recording.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Student Dashboard</span>
              <div className="flex items-center gap-4">
                <Badge variant={isConnected ? "default" : "destructive"}>
                  {isConnected ? "Connected" : "Disconnected"}
                </Badge>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getConnectionColor()}`}></div>
                  <span className="text-sm capitalize">{connectionQuality}</span>
                </div>
              </div>
            </CardTitle>
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Class Section */}
          <Card>
            <CardHeader>
              <CardTitle>Live Class</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isInClass ? (
                <div className="text-center space-y-4">
                  <p className="text-gray-600">
                    {sessionActive ? "Class is in session!" : "Waiting for class to start..."}
                  </p>
                  <Button 
                    onClick={joinClass} 
                    disabled={!isConnected || !sessionActive}
                    className="w-full"
                  >
                    Join Class
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-green-800 font-medium">You're in the class!</p>
                    <p className="text-green-600 text-sm">
                      Listen to your teacher and participate actively.
                    </p>
                  </div>
                  
                  {/* Audio Controls */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Audio Volume</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={audioVolume}
                      onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <audio ref={audioRef} controls className="w-full" />
                  
                  <Button onClick={leaveClass} variant="outline" className="w-full">
                    Leave Class
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat Section */}
          <Card>
            <CardHeader>
              <CardTitle>Class Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-48 overflow-y-auto border rounded p-2 bg-gray-50">
                  {messages.map((message) => (
                    <div key={message.id} className="mb-2">
                      <div className="text-xs text-gray-500">
                        {message.sender} - {message.timestamp.toLocaleTimeString()}
                      </div>
                      <div className="text-sm">{message.text}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    disabled={!isInClass}
                  />
                  <Button onClick={sendChatMessage} size="sm" disabled={!isInClass}>
                    Send
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Poll Section */}
        {currentPoll && (
          <Card>
            <CardHeader>
              <CardTitle>Live Poll</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="font-medium">{currentPoll.question}</h3>
                {!hasVoted ? (
                  <div className="space-y-3">
                    {currentPoll.options.map((option, index) => (
                      <label key={index} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="poll-option"
                          value={option}
                          checked={selectedPollOption === option}
                          onChange={(e) => setSelectedPollOption(e.target.value)}
                          className="text-blue-600"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                    <Button 
                      onClick={submitPollResponse} 
                      disabled={!selectedPollOption}
                      className="w-full"
                    >
                      Submit Vote
                    </Button>
                  </div>
                ) : (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-green-800">Thank you for voting!</p>
                    <p className="text-green-600 text-sm">Your response has been recorded.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recordings Section */}
        <Card>
          <CardHeader>
            <CardTitle>Previous Lectures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recordings.length === 0 ? (
                <p className="text-gray-600 text-center py-4">
                  No recordings available yet.
                </p>
              ) : (
                recordings.map((recording) => (
                  <div key={recording.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{recording.title}</h4>
                      {recording.duration && (
                        <p className="text-sm text-gray-600">Duration: {recording.duration}</p>
                      )}
                      {recording.size && (
                        <p className="text-sm text-gray-600">Size: {recording.size}</p>
                      )}
                    </div>
                    <Button 
                      onClick={() => downloadRecording(recording)}
                      size="sm"
                      variant="outline"
                    >
                      Download
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Connection Tips */}
        {connectionQuality === 'poor' && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  !
                </div>
                <div>
                  <h4 className="font-medium text-yellow-800">Poor Connection Detected</h4>
                  <p className="text-yellow-700 text-sm mt-1">
                    Try moving closer to your router, closing other apps, or switching to audio-only mode for better performance.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
