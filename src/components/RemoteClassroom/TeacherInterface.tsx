"use client";

import { useState, useRef, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

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

export default function TeacherInterface() {
  const { socket, isConnected, error, sendMessage, joinRoom } = useSocket();
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isMicrophoneOn, setIsMicrophoneOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [connectedStudents, setConnectedStudents] = useState(0);
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const roomId = "classroom-main";

  useEffect(() => {
    if (socket) {
      socket.on("student-joined", (count: number) => {
        setConnectedStudents(count);
      });

      socket.on("student-left", (count: number) => {
        setConnectedStudents(count);
      });

      socket.on("chat-message", (message: Message) => {
        setMessages(prev => [...prev, message]);
      });

      socket.on("poll-response", (response: { option: string }) => {
        if (currentPoll) {
          setCurrentPoll(prev => ({
            ...prev!,
            responses: {
              ...prev!.responses,
              [response.option]: (prev!.responses[response.option] || 0) + 1
            }
          }));
        }
      });

      return () => {
        socket.off("student-joined");
        socket.off("student-left");
        socket.off("chat-message");
        socket.off("poll-response");
      };
    }
  }, [socket, currentPoll]);

  const startSession = async () => {
    try {
      joinRoom(roomId);
      setIsSessionActive(true);
      sendMessage("session-started", { roomId });
      
      // Initialize audio for low-bandwidth streaming
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000, // Lower sample rate for bandwidth optimization
        }
      });
      
      if (audioRef.current) {
        audioRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error starting session:", err);
    }
  };

  const endSession = () => {
    setIsSessionActive(false);
    setIsMicrophoneOn(false);
    setIsRecording(false);
    sendMessage("session-ended", { roomId });
    
    if (audioRef.current && audioRef.current.srcObject) {
      const stream = audioRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const toggleMicrophone = () => {
    setIsMicrophoneOn(!isMicrophoneOn);
    sendMessage("microphone-toggle", { isOn: !isMicrophoneOn, roomId });
  };

  const startRecording = () => {
    setIsRecording(true);
    sendMessage("recording-started", { roomId });
    // In a real implementation, you would start actual recording here
  };

  const stopRecording = () => {
    setIsRecording(false);
    sendMessage("recording-stopped", { roomId });
    // In a real implementation, you would stop recording and save the file
  };

  const sendChatMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage,
        sender: "Teacher",
        timestamp: new Date()
      };
      sendMessage("chat-message", message);
      setMessages(prev => [...prev, message]);
      setNewMessage("");
    }
  };

  const createPoll = () => {
    if (pollQuestion && pollOptions.filter(opt => opt.trim()).length >= 2) {
      const poll: Poll = {
        question: pollQuestion,
        options: pollOptions.filter(opt => opt.trim()),
        responses: {}
      };
      setCurrentPoll(poll);
      sendMessage("poll-created", poll);
      setPollQuestion("");
      setPollOptions(["", ""]);
    }
  };

  const closePoll = () => {
    sendMessage("poll-closed", {});
    setCurrentPoll(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Teacher Dashboard</span>
              <div className="flex items-center gap-4">
                <Badge variant={isConnected ? "default" : "destructive"}>
                  {isConnected ? "Connected" : "Disconnected"}
                </Badge>
                <Badge variant="outline">
                  Students: {connectedStudents}
                </Badge>
              </div>
            </CardTitle>
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Session Controls */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Session Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {!isSessionActive ? (
                  <Button 
                    onClick={startSession} 
                    disabled={!isConnected}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Start Session
                  </Button>
                ) : (
                  <Button 
                    onClick={endSession}
                    variant="destructive"
                  >
                    End Session
                  </Button>
                )}
                
                <Button
                  onClick={toggleMicrophone}
                  disabled={!isSessionActive}
                  variant={isMicrophoneOn ? "default" : "outline"}
                >
                  {isMicrophoneOn ? "Mute" : "Unmute"} Microphone
                </Button>
                
                {!isRecording ? (
                  <Button
                    onClick={startRecording}
                    disabled={!isSessionActive}
                    variant="outline"
                  >
                    Start Recording
                  </Button>
                ) : (
                  <Button
                    onClick={stopRecording}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Stop Recording
                  </Button>
                )}
              </div>
              
              <audio ref={audioRef} autoPlay muted className="hidden" />
              
              {isSessionActive && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-green-800 font-medium">Session is live!</p>
                  <p className="text-green-600 text-sm">
                    Students can now join and participate in the class.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat */}
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
                  />
                  <Button onClick={sendChatMessage} size="sm">
                    Send
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Poll Section */}
        <Card>
          <CardHeader>
            <CardTitle>Interactive Polls</CardTitle>
          </CardHeader>
          <CardContent>
            {!currentPoll ? (
              <div className="space-y-4">
                <Input
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="Enter poll question..."
                />
                {pollOptions.map((option, index) => (
                  <Input
                    key={index}
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...pollOptions];
                      newOptions[index] = e.target.value;
                      setPollOptions(newOptions);
                    }}
                    placeholder={`Option ${index + 1}`}
                  />
                ))}
                <div className="flex gap-2">
                  <Button
                    onClick={() => setPollOptions([...pollOptions, ""])}
                    variant="outline"
                    size="sm"
                  >
                    Add Option
                  </Button>
                  <Button onClick={createPoll} disabled={!pollQuestion}>
                    Create Poll
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-medium">{currentPoll.question}</h3>
                <div className="space-y-2">
                  {currentPoll.options.map((option, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{option}</span>
                      <Badge variant="outline">
                        {currentPoll.responses[option] || 0} votes
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button onClick={closePoll} variant="outline">
                  Close Poll
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
