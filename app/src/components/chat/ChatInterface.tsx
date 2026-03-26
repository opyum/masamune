"use client";

import { useState, useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  siteId: string;
  initialMessages?: Message[];
  briefExtracted?: boolean;
}

export default function ChatInterface({
  siteId,
  initialMessages = [],
  briefExtracted = false,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isComplete, setIsComplete] = useState(briefExtracted);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send initial greeting if no messages
  useEffect(() => {
    if (messages.length === 0 && !isComplete) {
      sendMessage("Bonjour");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendMessage(content: string) {
    // Add user message to UI
    const userMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);

    // Add empty assistant message for streaming
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const response = await fetch(`/api/chat/${siteId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) throw new Error("Chat request failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No reader");

      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        // Update the last (assistant) message
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: fullText,
          };
          return updated;
        });
      }

      // Check if brief was extracted (contains brief_json block)
      if (fullText.includes("```brief_json")) {
        setIsComplete(true);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Désolée, une erreur est survenue. Pouvez-vous réessayer ?",
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages
          .filter((m) => m.role !== "user" || m.content !== "Bonjour")
          .map((message, index) => (
            <ChatMessage
              key={index}
              role={message.role}
              content={
                message.role === "assistant"
                  ? message.content.replace(/```brief_json[\s\S]*?```/g, "").trim()
                  : message.content
              }
              isStreaming={isStreaming && index === messages.length - 1}
            />
          ))}
        <div ref={messagesEndRef} />
      </div>

      {isComplete ? (
        <div className="p-4 bg-green-50 border-t border-green-200 text-center">
          <p className="text-green-800 font-medium">
            Votre site est en cours de création !
          </p>
          <p className="text-green-600 text-sm mt-1">
            Vous serez notifié dès qu&apos;il sera prêt.
          </p>
        </div>
      ) : (
        <ChatInput
          onSend={sendMessage}
          disabled={isStreaming}
          placeholder="Répondez ici..."
          siteId={siteId}
        />
      )}
    </div>
  );
}
