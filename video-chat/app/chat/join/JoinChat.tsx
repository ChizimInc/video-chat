"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinChat() {
  const [chatId, setChatId] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleJoinChat = () => {
    if (!chatId.trim()) {
      setError("Please enter a valid chat ID");
      return;
    }
    router.push(`/chat/${chatId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-white">
      <h2 className="text-2xl font-bold mb-6">Join a Chat</h2>
      <input
        type="text"
        placeholder="Enter Chat ID"
        value={chatId}
        onChange={(e) => setChatId(e.target.value)}
        className="p-2 text-black rounded-lg mb-4 w-80"
      />
      {error && <p className="text-red-500">{error}</p>}
      <button
        onClick={handleJoinChat}
        className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
      >
        Join Chat
      </button>
    </div>
  );
}
