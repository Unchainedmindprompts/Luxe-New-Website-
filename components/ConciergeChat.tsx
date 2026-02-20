"use client";

import { useState, useRef, useEffect } from "react";
import { BUSINESS } from "@/lib/constants";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const INITIAL_USER_MESSAGE: Message = {
  role: "user",
  content: "Hi, I'm interested in window treatments for my home.",
};

async function fetchChat(messages: Message[]): Promise<{ reply: string; error: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
      signal: controller.signal,
    });

    const rawText = await res.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      return { reply: "", error: `Non-JSON response (${res.status}): ${rawText.slice(0, 100)}` };
    }

    if (data.message) {
      return { reply: data.message, error: "" };
    }
    return { reply: "", error: data.error || `Unexpected response (${res.status})` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("abort")) {
      return { reply: "", error: "Request timed out (25s)" };
    }
    return { reply: "", error: `Network error: ${msg}` };
  } finally {
    clearTimeout(timeout);
  }
}

export default function ConciergeChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      startConversation();
    }
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const getFallbackGreeting = () => {
    return `Hey there! Welcome to Luxe Window Works. I'd love to help you figure out the right window treatments for your home. What room or area are you thinking about? And if you'd rather talk to Mark directly, you can always call him at ${BUSINESS.phone}.`;
  };

  const getFallbackError = () => {
    return `I'm having a little trouble right now. Why don't you give Mark a call at ${BUSINESS.phone}? He'd be happy to help you directly.`;
  };

  const startConversation = async () => {
    setIsLoading(true);
    try {
      const { reply, error } = await fetchChat([INITIAL_USER_MESSAGE]);
      if (error) {
        console.error("[ConciergeChat] API error on greeting:", error);
      }
      setMessages([
        INITIAL_USER_MESSAGE,
        { role: "assistant", content: reply || getFallbackGreeting() },
      ]);
    } catch (err) {
      console.error("[ConciergeChat] Unexpected error on greeting:", err);
      setMessages([
        INITIAL_USER_MESSAGE,
        { role: "assistant", content: getFallbackGreeting() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const { reply, error } = await fetchChat(updatedMessages);
      if (error) {
        console.error("[ConciergeChat] API error on message:", error);
      }
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: reply || getFallbackError() },
      ]);
    } catch (err) {
      console.error("[ConciergeChat] Unexpected error on message:", err);
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: getFallbackError() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat trigger button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-3 bg-gold hover:bg-gold-dark text-white font-semibold px-8 py-4 rounded-full text-lg transition-all hover:shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Let&apos;s Figure Out What You Need
        </button>
      )}

      {/* Chat interface */}
      {isOpen && (
        <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-warm-gray-200/60 overflow-hidden">
          {/* Chat header */}
          <div className="bg-charcoal text-white px-6 py-4 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-semibold">Window Treatment Concierge</h3>
              <p className="text-warm-gray-400 text-xs mt-0.5">Powered by Mark&apos;s 20 years of expertise</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-warm-gray-400 hover:text-white transition-colors p-1"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages h-80 sm:h-96 overflow-y-auto p-6 space-y-4 bg-cream/30">
            {messages.slice(1).map((msg, i) => (
              <div
                key={i}
                className={`chat-message-enter flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === "user"
                      ? "bg-charcoal text-white rounded-br-md"
                      : "bg-white text-charcoal border border-warm-gray-200 rounded-bl-md shadow-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start chat-message-enter">
                <div className="bg-white border border-warm-gray-200 rounded-2xl rounded-bl-md px-5 py-4 shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="typing-dot w-2 h-2 bg-warm-gray-400 rounded-full" />
                    <span className="typing-dot w-2 h-2 bg-warm-gray-400 rounded-full" />
                    <span className="typing-dot w-2 h-2 bg-warm-gray-400 rounded-full" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="p-4 border-t border-warm-gray-200/60 bg-white">
            <div className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-cream/50 border border-warm-gray-200 rounded-full px-5 py-3 text-sm text-charcoal placeholder:text-warm-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-gold hover:bg-gold-dark disabled:bg-warm-gray-300 text-white rounded-full px-5 py-3 transition-colors"
                aria-label="Send message"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-center text-xs text-warm-gray-400 mt-3">
              Or call Mark directly:{" "}
              <a href={BUSINESS.phoneHref} className="text-gold hover:text-gold-dark font-medium">
                {BUSINESS.phone}
              </a>
            </p>
          </form>
        </div>
      )}
    </>
  );
}
