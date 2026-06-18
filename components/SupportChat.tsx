"use client";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Zap, Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  ts: string;
}

const BOT_NAME = "LumiAssist";

const QUICK_REPLIES = [
  "How do I dim a zone?",
  "Why is my schedule not working?",
  "Can I integrate with Zendesk?",
];

const AI_RESPONSES: Record<string, string> = {
  default:
    "Thanks for reaching out! I'm here to help with your LumiGlow setup. Could you give me a few more details so I can point you in the right direction?",
  dim: "To dim a zone, open your **Dashboard → Buildings**, select the zone, and drag the brightness slider. You can also set scheduled dim levels under **Automation → Schedules**.",
  schedule:
    "Schedule issues are usually caused by a timezone mismatch. Head to **Settings → Building Preferences** and confirm the building timezone matches your local time. If the issue persists, try toggling the schedule off and back on.",
  zendesk:
    "Yes! LumiGlow integrates natively with Zendesk. Navigate to **Settings → Integrations → Zendesk**, enter your Zendesk subdomain and API key, and incidents will automatically open tickets. You can find the full guide in our [Docs](#docs).",
  hi: "Hey there! 👋 I'm LumiAssist, your AI-powered support agent. Ask me anything about your LumiGlow system — I'm happy to help!",
  hello:
    "Hi! 👋 How can I help you with LumiGlow today? You can ask about zones, schedules, integrations, or anything else.",
};

function getBotReply(text: string): string {
  const lower = text.toLowerCase();
  if (lower.match(/\b(hi|hey|hello|howdy)\b/)) return AI_RESPONSES.hi;
  if (lower.match(/\b(dim|brightness|brighten|lower|fade)\b/)) return AI_RESPONSES.dim;
  if (lower.match(/\bschedule\b/)) return AI_RESPONSES.schedule;
  if (lower.match(/\bzendesk\b/)) return AI_RESPONSES.zendesk;
  return AI_RESPONSES.default;
}

function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "0",
    role: "assistant",
    text: "Hi! 👋 I'm **LumiAssist**, your AI support agent. How can I help you today?",
    ts: now(),
  },
];

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", text: trimmed, ts: now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(
      () => {
        const reply = getBotReply(trimmed);
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: reply,
          ts: now(),
        };
        setMessages((m) => [...m, botMsg]);
        setTyping(false);
        if (!open) setUnread((n) => n + 1);
      },
      800 + Math.random() * 600
    );
  }

  function renderText(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
    return parts.map((part, i) => {
      const bold = part.match(/^\*\*(.+)\*\*$/);
      if (bold) return <strong key={i}>{bold[1]}</strong>;
      const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link) return <a key={i} href={link[2]} className="underline underline-offset-2">{link[1]}</a>;
      return <span key={i}>{part}</span>;
    });
  }

  return (
    <>
      {/* Floating button */}
      <button
        aria-label={open ? "Close support chat" : "Open support chat"}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-6 right-6 z-[200] w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-200",
          open
            ? "bg-slate-700 hover:bg-slate-600"
            : "bg-gradient-to-br from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 shadow-amber-500/40"
        )}
      >
        {open ? (
          <ChevronDown size={22} className="text-white" />
        ) : (
          <>
            <MessageCircle size={24} className="text-white" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unread}
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          role="dialog"
          aria-label="AI Support Chat"
          className="fixed bottom-24 right-6 z-[199] w-[360px] max-w-[calc(100vw-2rem)] flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-900/20 dark:shadow-slate-950/60 overflow-hidden animate-slide-up"
          style={{ height: 520 }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 shrink-0">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Zap size={16} className="text-white" fill="white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white leading-tight">{BOT_NAME}</p>
              <p className="text-[11px] text-amber-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block" />
                AI-powered · Typically replies instantly
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn("flex gap-2 items-end", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
              >
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 mb-0.5">
                    <Zap size={11} className="text-white" fill="white" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-amber-500 text-white rounded-br-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm"
                  )}
                >
                  {renderText(msg.text)}
                  <p
                    className={cn(
                      "text-[10px] mt-1 text-right",
                      msg.role === "user" ? "text-amber-100" : "text-slate-400 dark:text-slate-500"
                    )}
                  >
                    {msg.ts}
                  </p>
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex gap-2 items-end">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                  <Zap size={11} className="text-white" fill="white" />
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          {messages.length <= 2 && !typing && (
            <div className="px-4 pb-2 flex gap-2 flex-wrap shrink-0">
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-[11px] font-medium px-2.5 py-1.5 rounded-full border border-amber-300 dark:border-amber-600 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3 pt-2 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about LumiGlow…"
                className="flex-1 min-w-0 px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                aria-label="Send message"
                className="w-9 h-9 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shrink-0 transition-all"
              >
                {typing ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              </button>
            </form>
            <p className="text-[10px] text-center text-slate-400 mt-1.5">
              Powered by LumiGlow AI · Responses are simulated
            </p>
          </div>
        </div>
      )}
    </>
  );
}
