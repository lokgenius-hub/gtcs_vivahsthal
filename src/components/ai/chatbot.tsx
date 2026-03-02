"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

function getMessageText(message: { parts: Array<{ type: string; text?: string }> }): string {
  return message.parts
    .filter((p) => p.type === "text" && p.text)
    .map((p) => p.text)
    .join("");
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialMsgs: UIMessage[] = [
    {
      id: "welcome",
      role: "assistant",
      parts: [
        {
          type: "text" as const,
          text: "Namaste! 🙏 I'm your VivahSthal Wedding Assistant. Congratulations on your upcoming celebration! 🎉\n\nI can help you:\n• Find the perfect venue by city, budget & capacity\n• Check availability for auspicious dates\n• Connect you with our specialist team\n\nWhat are you looking for?",
        },
      ],
    },
  ];

  const { messages, sendMessage, status, error } = useChat({
    id: "vivahsthal-chat",
    messages: initialMsgs,
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    const text = inputValue;
    setInputValue("");
    await sendMessage({ text });
  };

  const handleSuggestionClick = async (suggestion: string) => {
    setInputValue("");
    await sendMessage({ text: suggestion });
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-gold shadow-2xl flex items-center justify-center hover:shadow-3xl hover:scale-105 transition-all group"
          >
            <MessageCircle className="h-6 w-6 text-white" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[var(--color-accent)] animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-gold p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">
                    Wedding Assistant
                  </h3>
                  <p className="text-white/70 text-xs">
                    AI-powered by VivahSthal
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.map((message) => {
                const text = getMessageText(message as { parts: Array<{ type: string; text?: string }> });
                if (!text) return null;
                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-2.5",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="h-7 w-7 rounded-full bg-gradient-gold flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                        message.role === "user"
                          ? "bg-[var(--color-charcoal)] text-white rounded-br-md"
                          : "bg-gray-100 text-gray-800 rounded-bl-md"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{text}</p>
                    </div>
                    {message.role === "user" && (
                      <div className="h-7 w-7 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                      </div>
                    )}
                  </div>
                );
              })}
              {isLoading && (
                <div className="flex gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-gradient-gold flex items-center justify-center shrink-0">
                    <Bot className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {[
                  "Find venues in Patna",
                  "Auspicious dates 2026",
                  "Budget under ₹3 Lakh",
                  "Banquet for 300 guests",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-[11px] px-3 py-1.5 bg-[var(--color-primary)]/5 text-[var(--color-primary)] rounded-full hover:bg-[var(--color-primary)]/10 transition-colors border border-[var(--color-primary)]/10"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={handleFormSubmit}
              className="p-3 border-t border-gray-100 flex gap-2 shrink-0"
            >
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 h-10 px-4 rounded-full bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 placeholder:text-gray-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="h-10 w-10 rounded-full bg-gradient-gold flex items-center justify-center text-white disabled:opacity-50 hover:brightness-110 transition-all shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
