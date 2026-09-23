import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "wouter";
import {
  MessageSquare,
  Send,
  ShieldCheck,
  CheckCheck,
  Check,
  Clock,
  ArrowLeft,
  Headphones,
  Sparkles,
  User,
  Sun,
  Moon,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { TopNavLinks } from "@/components/TopNavLinks";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function SupportPage() {
  const { user, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, language, isRTL } = useLanguage();
  const isBn = language === "bn";

  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // tRPC Queries & Mutations
  const {
    data: supportData,
    isLoading: isLoadingConversation,
    refetch: refetchConversation,
  } = trpc.support.getConversation.useQuery(undefined, {
    enabled: !!user,
    refetchInterval: 2500, // Background fallback polling
  });

  const sendMessageMutation = trpc.support.sendMessage.useMutation({
    onSuccess: () => {
      setMessageText("");
      refetchConversation();
      scrollToBottom();
    },
    onError: (err) => {
      toast.error(err.message || (isBn ? "মেসেজ পাঠাতে সমস্যা হয়েছে" : "Failed to send message"));
    },
  });

  const markReadMutation = trpc.support.markRead.useMutation();

  const conversation = supportData?.conversation;
  const messages = supportData?.messages || [];

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]);

  // Mark admin messages as read when conversation is open
  useEffect(() => {
    if (conversation?.id && messages.length > 0) {
      const hasUnreadAdminMsg = messages.some(
        (m: any) => (m.senderRole === "admin" || m.senderRole === "support") && !m.readAt
      );
      if (hasUnreadAdminMsg) {
        markReadMutation.mutate({ conversationId: conversation.id });
      }
    }
  }, [conversation?.id, messages]);

  // Real-time Supabase Broadcast Channel Listener
  useEffect(() => {
    if (!conversation?.id) return;

    const channelName = `support_chat_${conversation.id}`;
    const channel = supabase
      .channel(channelName)
      .on("broadcast", { event: "new_message" }, () => {
        refetchConversation();
      })
      .on("broadcast", { event: "messages_read" }, () => {
        refetchConversation();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation?.id, refetchConversation]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = messageText.trim();
    if (!trimmed || sendMessageMutation.isPending) return;

    sendMessageMutation.mutate({ message: trimmed });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const formatDateHeader = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const today = new Date();
      if (d.toDateString() === today.toDateString()) {
        return isBn ? "আজ" : "Today";
      }
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      if (d.toDateString() === yesterday.toDateString()) {
        return isBn ? "গতকাল" : "Yesterday";
      }
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { dateKey: string; messages: any[] }[] = [];
    for (const msg of messages) {
      const dateKey = new Date(msg.createdAt).toDateString();
      const existing = groups.find((g) => g.dateKey === dateKey);
      if (existing) {
        existing.messages.push(msg);
      } else {
        groups.push({ dateKey, messages: [msg] });
      }
    }
    return groups;
  }, [messages]);

  return (
    <div
      className={`min-h-screen flex flex-col bg-[#070e1b] text-slate-100 ${
        isBn ? "font-bangla" : ""
      }`}
    >
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#070e1b]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <BrandLogo size={34} />
              <div className="flex flex-col">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white group-hover:text-sky-400 transition-colors">
                  Cycle of Chart
                </span>
                <span className="text-[10px] font-mono tracking-widest uppercase text-sky-400">
                  Direct Support
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            <LanguageSelector variant="compact" />

            <Link href={user ? "/dashboard" : "/login"}>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-slate-700 bg-slate-800/80 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white"
              >
                <ArrowLeft size={14} />
                <span className="hidden sm:inline">
                  {user ? (isBn ? "ড্যাশবোর্ড" : "Dashboard") : isBn ? "লগইন" : "Sign In"}
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Support Container */}
      <main className="flex-1 flex flex-col mx-auto w-full max-w-4xl p-3 sm:p-6">
        {/* Not Logged In State */}
        {!user && !authLoading && (
          <div className="m-auto w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 text-center shadow-2xl backdrop-blur-xl">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20 mb-4">
              <Headphones size={28} />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-white">
              {isBn ? "সরাসরি সাপোর্ট চ্যাট" : "Direct Support Chat"}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
              {isBn
                ? "আমাদের সাপোর্ট টিমের সাথে সরাসরি মেসেজ করতে আপনার অ্যাকাউন্টে সাইন ইন করুন। আপনার সব মেসেজ সুরক্ষিত থাকবে।"
                : "Sign in to connect directly with the Cycle of Chart administration. Your conversation history is permanently saved."}
            </p>
            <div className="mt-6 flex flex-col gap-2.5">
              <Link href="/login">
                <Button className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-black tracking-wide">
                  {isBn ? "লগইন করে চ্যাট শুরু করুন" : "Sign In to Chat"}
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  variant="outline"
                  className="w-full border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-800 font-bold"
                >
                  {isBn ? "নতুন অ্যাকাউন্ট তৈরি করুন" : "Create an Account"}
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Logged In Support Interface */}
        {user && (
          <div className="flex-1 flex flex-col rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden min-h-[580px] sm:min-h-[640px]">
            {/* Chat Workspace Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-4 py-3.5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex size-10 sm:size-11 items-center justify-center rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 font-black">
                    <Headphones size={20} />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                      {isBn ? "Cycle of Chart সাপোর্ট টিম" : "Cycle Support Team"}
                    </h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {isBn ? "অনলাইন" : "Active"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {isBn
                      ? "সাধারণত কয়েক মিনিটের মধ্যে উত্তর দেওয়া হয়"
                      : "Direct response from the official Cycle admin"}
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-right">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-300">
                    {user.name || "Trader"}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {user.email || `ID #${user.id}`}
                  </span>
                </div>
                <div className="flex size-8 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs">
                  {user.name ? user.name[0].toUpperCase() : "T"}
                </div>
              </div>
            </div>

            {/* Message Thread Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {isLoadingConversation ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-500 py-16">
                  <Loader2 size={28} className="animate-spin text-sky-400" />
                  <span className="text-xs font-bold tracking-wider uppercase">
                    {isBn ? "সাপোর্ট হিস্ট্রি লোড হচ্ছে..." : "Loading conversation..."}
                  </span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center py-16 px-4">
                  <div className="flex size-14 items-center justify-center rounded-3xl bg-slate-800/80 border border-slate-700 text-sky-400 mb-4 shadow-inner">
                    <MessageSquare size={26} />
                  </div>
                  <h4 className="text-base font-extrabold text-white">
                    {isBn ? "সরাসরি মেসেজ করুন" : "Need help? Send us a message"}
                  </h4>
                  <p className="mt-1.5 max-w-sm text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {isBn
                      ? "পেমেন্ট ভেরিফিকেশন, কোর্স অ্যাক্সেস বা যেকোনো প্রয়োজনে সরাসরি মেসেজ পাঠান। আমাদের টিম দ্রুত রিপ্লাই দেবে।"
                      : "Our team will reply directly to this conversation. All messages are stored permanently in your account."}
                  </p>

                  <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-md">
                    {[
                      isBn ? "কোর্স অ্যাক্সেস সংক্রান্ত প্রশ্ন" : "Question about course access",
                      isBn ? "পেমেন্ট ভেরিফিকেশন স্ট্যাটাস" : "Payment verification check",
                      isBn ? "স্টাডি ম্যাটেরিয়াল ও ই-বুক" : "Study materials inquiry",
                    ].map((promptText, i) => (
                      <button
                        key={i}
                        onClick={() => setMessageText(promptText)}
                        className="rounded-full border border-slate-700/80 bg-slate-800/40 px-3 py-1.5 text-xs text-slate-300 hover:border-sky-500/50 hover:bg-slate-800 hover:text-white transition"
                      >
                        {promptText}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                groupedMessages.map((group) => (
                  <div key={group.dateKey} className="space-y-4">
                    {/* Date Separator */}
                    <div className="flex items-center justify-center">
                      <span className="rounded-full bg-slate-800/80 border border-slate-700/50 px-3 py-0.5 text-[10px] font-bold text-slate-400 tracking-wider">
                        {formatDateHeader(group.messages[0].createdAt)}
                      </span>
                    </div>

                    {/* Speech Bubbles */}
                    {group.messages.map((msg: any) => {
                      const isCustomer = msg.senderRole === "customer" || msg.senderRole === "user";
                      return (
                        <div
                          key={msg.id}
                          className={`flex items-end gap-2.5 ${
                            isCustomer ? "justify-end" : "justify-start"
                          }`}
                        >
                          {!isCustomer && (
                            <div
                              className="size-7 rounded-full bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0 mb-1"
                              title="Support Specialist"
                            >
                              <ShieldCheck size={14} />
                            </div>
                          )}

                          <div
                            className={`group relative max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 shadow-md ${
                              isCustomer
                                ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white rounded-br-xs"
                                : "bg-slate-800/90 border border-slate-700/70 text-slate-100 rounded-bl-xs"
                            }`}
                          >
                            {!isCustomer && (
                              <div className="text-[10px] font-extrabold uppercase tracking-wider text-sky-400 mb-1">
                                {isBn ? "সাপোর্ট স্পেশালিস্ট" : "Support Specialist"}
                              </div>
                            )}

                            <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed break-words">
                              {msg.message}
                            </p>

                            <div
                              className={`mt-1.5 flex items-center justify-end gap-1 text-[10px] font-mono ${
                                isCustomer ? "text-sky-100/80" : "text-slate-400"
                              }`}
                            >
                              <span>{formatMessageTime(msg.createdAt)}</span>
                              {isCustomer && (
                                <span title={msg.readAt ? "Seen by Admin" : "Sent"}>
                                  {msg.readAt ? (
                                    <CheckCheck size={13} className="text-white" />
                                  ) : (
                                    <Check size={13} className="text-sky-200" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Text-Only Input Bottom Area */}
            <div className="border-t border-slate-800 bg-slate-950/80 p-3 sm:p-4">
              <form onSubmit={handleSendMessage} className="space-y-2">
                <div className="flex items-center gap-2">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      isBn
                        ? "আপনার মেসেজ লিখুন... (Enter চাপুন পাঠাতে)"
                        : "Type your message here... (Press Enter to send)"
                    }
                    className="flex-1 min-h-[46px] max-h-[140px] resize-none rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                  />

                  <Button
                    type="submit"
                    disabled={!messageText.trim() || sendMessageMutation.isPending}
                    className="size-11 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold shrink-0 disabled:opacity-40 transition-all"
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                  <span>
                    {isBn
                      ? "সরাসরি টেক্সট মেসেজিং • কোনো ফাইল বা ছবি আপলোড প্রয়োজন নেই"
                      : "Text-only direct support • All conversations are private & secured"}
                  </span>
                  <span className="hidden sm:inline font-mono">
                    Shift + Enter for new line
                  </span>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
