"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateChat() {
  const [chatId, setChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Funcție pentru generarea unui UUID
  const generateUUID = () => {
    return crypto.randomUUID();
  };

  // Funcție pentru crearea unui chat
  const handleCreateChat = async () => {
    setLoading(true);
    const newChatId = generateUUID();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatId: newChatId }),
      });

      if (response.ok) {
        setChatId(newChatId);
      } else {
        console.error("Failed to create chat session");
      }
    } catch (error) {
      console.error("Error creating chat:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-white">
      <h2 className="text-2xl font-bold mb-6">Create a Chat Room</h2>
      {!chatId ? (
        <button
          onClick={handleCreateChat}
          className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Chat"}
        </button>
      ) : (
        <div className="mt-6 text-center">
          <p className="text-lg">Your chat link:</p>
          <input
            type="text"
            readOnly
            value={`${window.location.origin}/chat/${chatId}`}
            className="mt-2 p-2 w-full text-white rounded-lg"
          />
          <button
            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/chat/${chatId}`)}
            className="mt-3 px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600"
          >
            Copy Link
          </button>
          <button
            onClick={() => router.push(`/chat/${chatId}`)}
            className="mt-3 ml-3 px-4 py-2 bg-purple-500 rounded-lg hover:bg-purple-600"
          >
            Go to Chat
          </button>
        </div>
      )}
    </div>
  );
}
