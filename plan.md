```markdown
# Detailed Implementation Plan for Remote Classroom Platform

This plan outlines the step-by-step changes and file additions required to build a low-bandwidth remote classroom platform optimized for rural students and resource-constrained institutes using free/open-source technologies.

---

## 1. Project Dependency Updates

- **package.json**
  - Add dependencies:
    - "socket.io-client" (for real-time client communication)
    - "socket.io" (if a dedicated socket server is needed)
    - "next-pwa" (to enable Progressive Web App features)
  - Example update:
    ```json
    {
      "dependencies": {
        "socket.io-client": "^4.0.0",
        "next-pwa": "^5.6.0"
      }
    }
    ```

---

## 2. PWA and Next.js Configuration

- **next.config.ts**
  - Import next-pwa and wrap the configuration:
    ```typescript
    const withPWA = require("next-pwa")({
      dest: "public",
      disable: process.env.NODE_ENV === "development",
    });
    module.exports = withPWA({
      // Other Next.js configuration options
      reactStrictMode: true,
    });
    ```
- **public/manifest.json** (New File)
  - Create a manifest file with minimal fields:
    ```json
    {
      "name": "Remote Classroom",
      "short_name": "Classroom",
      "start_url": "/",
      "display": "standalone",
      "background_color": "#ffffff",
      "theme_color": "#1976d2"
    }
    ```

---

## 3. Global Styling Enhancements

- **src/app/globals.css**
  - Update styles to include a modern, minimal, and mobile-friendly look:
    - Define base typography (e.g., font-family, font sizes)
    - Set a consistent color palette (e.g., primary blue `#1976d2`, neutral grays)
    - Add spacing utility classes and responsive media queries for entry-level smartphones
    - Include classes for error states (e.g., `.error-message { color: red; }`)

---

## 4. Custom Hook for Real-time Communication

- **src/hooks/useSocket.ts**
  - Create a React hook to initialize a WebSocket connection using socket.io-client:
    ```typescript
    import { useEffect, useState } from "react";
    import io, { Socket } from "socket.io-client";

    const SOCKET_SERVER_URL = "http://localhost:3000"; // Adjust as needed for deployment

    export const useSocket = () => {
      const [socket, setSocket] = useState<Socket | null>(null);
      const [error, setError] = useState<string>("");

      useEffect(() => {
        const socketIo = io(SOCKET_SERVER_URL, {
          reconnectionAttempts: 5,
          transports: ["websocket"]
        });

        socketIo.on("connect", () => console.log("Socket connected"));
        socketIo.on("connect_error", (err: any) => {
          console.error("Connection error:", err);
          setError("Connection error. Please try again later.");
        });
        socketIo.on("disconnect", () => console.warn("Socket disconnected"));

        setSocket(socketIo);

        return () => {
          socketIo.disconnect();
        };
      }, []);

      return { socket, error };
    };
    ```

---

## 5. Remote Classroom UI Components

### Teacher Interface
- **src/components/RemoteClassroom/TeacherInterface.tsx**
  - Create a functional component that:
    - Uses the `useSocket` hook for real-time updates.
    - Renders controls: “Start Session”, “Toggle Microphone”, “Record Lecture”, “End Session”.
    - Displays connection status and error messages.
    - Uses modern HTML elements styled via globals.css.
    - Example button:
      ```jsx
      <button className="btn-primary" onClick={startSession}>Start Session</button>
      ```

### Student Interface
- **src/components/RemoteClassroom/StudentInterface.tsx**
  - Create a functional component that:
    - Uses the `useSocket` hook to connect.
    - Displays a live audio stream (using an HTML5 `<audio>` element) and a simple chat panel.
    - Renders interactive sections for polls and discussion boards.
    - Provides error notifications if connection lags or fails.
  
### Interactive Quiz Component
- **src/components/InteractiveQuiz.tsx**
  - Build a component that:
    - Receives a question, answer options, and an onSubmit callback as props.
    - Renders the question text and a set of styled answer buttons.
    - Includes basic error handling for missing props.
    - Example structure:
      ```jsx
      <div className="quiz-container">
        <h3>{question}</h3>
        {options.map((option, i) => (
          <button key={i} onClick={() => submitAnswer(option)}>{option}</button>
        ))}
      </div>
      ```

---

## 6. Page-Level Implementations

### Teacher Page (Live Session)
- **src/app/classroom/page.tsx**
  - Create a page that imports and renders the `TeacherInterface`.
  - Include a header (e.g., “Teacher Classroom”) and brief session instructions.
  - Ensure proper error boundaries are in place for connection issues.

### Student Page (Live Classroom)
- **src/app/student/page.tsx**
  - Create a page that imports and renders the `StudentInterface`.
  - Add a section to list available recordings (fetched from an API endpoint) for asynchronous access.
  - Provide a minimalistic layout with clear typography and spacing.

---

## 7. API Endpoint for Lecture Recordings

- **src/app/api/recordings/route.ts**
  - Implement API handlers for GET and POST requests:
    - GET: Return a JSON list of available recordings.
    - POST: Accept and store recordings (simulate file handling with proper content-type checks).
  - Include try/catch blocks for robust error handling:
    ```typescript
    import { NextResponse } from "next/server";

    export async function GET() {
      try {
        // Simulated recordings list
        const recordings = [{ id: 1, title: "Lecture 1", url: "/recordings/lecture1.mp3" }];
        return NextResponse.json(recordings);
      } catch (error) {
        return NextResponse.error();
      }
    }

    export async function POST(request: Request) {
      try {
        const data = await request.json();
        // Validate and save the recording data
        return NextResponse.json({ success: true, data });
      } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
    }
    ```

---

## 8. Optional: Dedicated Socket Server

- **server/socketServer.js** (Optional File)
  - Create a standalone Node.js server (using Express) to handle socket connections if Next.js serverless functions cannot maintain persistent WebSocket connections.
  - Example snippet:
    ```javascript
    const express = require("express");
    const http = require("http");
    const { Server } = require("socket.io");

    const app = express();
    const server = http.createServer(app);
    const io = new Server(server, { cors: { origin: "*" } });

    io.on("connection", (socket) => {
      console.log("New client connected");
      socket.on("message", (data) => socket.broadcast.emit("message", data));
      socket.on("disconnect", () => console.log("Client disconnected"));
    });

    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => console.log(`Socket server running on port ${PORT}`));
    ```

---

## Summary

- Updated package.json to include socket.io-client and next-pwa to suit low-bandwidth real-time needs.
- Configured next.config.ts with next-pwa and added a minimal manifest.json.
- Enhanced globals.css for a clean, modern, mobile-friendly interface.
- Developed a custom useSocket hook for real-time communication with robust error handling.
- Created separate TeacherInterface, StudentInterface, and InteractiveQuiz components for live sessions and interactivity.
- Built teacher and student pages to integrate UI components and asynchronous lecture recordings.
- Implemented an API endpoint for lecture recordings with proper error management.
- Optionally, provided a dedicated socket server for persistent WebSocket handling.
