"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // Asigură-te că backend-ul rulează

export default function ChatRoom() {
  const { id: chatId } = useParams(); // Extragem ID-ul chatului din URL
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<{ user: string; text: string }[]>([]);
  const [message, setMessage] = useState("");
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Inițializare WebRTC
    const setupWebRTC = async () => {
      peerConnection.current = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      localStream.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream.current;
      }

      localStream.current.getTracks().forEach((track) => {
        peerConnection.current?.addTrack(track, localStream.current!);
      });

      peerConnection.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", { chatId, candidate: event.candidate });
        }
      };
    };

    setupWebRTC();

    socket.emit("join-room", chatId);

    socket.on("offer", async (offer) => {
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.emit("answer", { chatId, answer });
      }
    });

    socket.on("answer", async (answer) => {
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (peerConnection.current) {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    // Eveniment pentru chat text
    socket.on("chat-message", (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      peerConnection.current?.close();
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("chat-message");
    };
  }, [chatId]);

  const startCall = async () => {
    if (peerConnection.current) {
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      socket.emit("offer", { chatId, offer });
      setIsConnected(true);
    }
  };

  // Trimiterea unui mesaj text
  const sendMessage = () => {
    if (message.trim() !== "") {
      const msg = { user: "You", text: message };
      setMessages((prevMessages) => [...prevMessages, msg]);
      socket.emit("chat-message", { chatId, message });
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-white">
      <h1 className="text-2xl font-bold mb-4">Chat Room: {chatId}</h1>
      <div className="flex space-x-4">
        <video ref={localVideoRef} autoPlay playsInline className="w-64 h-48 bg-black" />
        <video ref={remoteVideoRef} autoPlay playsInline className="w-64 h-48 bg-black" />
      </div>
      {!isConnected && (
        <button
          onClick={startCall}
          className="mt-6 px-6 py-2 bg-green-500 rounded-lg hover:bg-green-600"
        >
          Start Call
        </button>
      )}

      {/* Chat Box */}
      <div className="w-96 mt-6 p-4 bg-gray-800 rounded-lg">
        <h2 className="text-lg font-bold mb-2">Chat</h2>
        <div className="h-40 overflow-y-auto border-b border-gray-600 mb-2 p-2">
          {messages.map((msg, index) => (
            <p key={index} className="text-sm">
              <span className="font-bold">{msg.user}:</span> {msg.text}
            </p>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 p-2 text-black rounded-l-lg"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            className="px-4 bg-blue-500 rounded-r-lg hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
