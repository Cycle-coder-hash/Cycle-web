import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  MessageSquare,
  Search,
  Send,
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  PackageCheck,
  Receipt,
  ShieldCheck,
  CheckCheck,
  Check,
  Clock,
  ArrowUpRight,
  Loader2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface SupportTabProps {
  [key: string]: any;
}

export const SupportTab: React.FC<SupportTabProps> = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadOnlyFilter, setUnreadOnlyFilter] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch conversations list
  const {
    data: conversations = [],
    isLoading: isLoadingConversations,
    refetch: refetchConversations,
  } = trpc.admin.supportConversations.useQuery(undefined, {
    refetchInterval: 3000,
  });

  // Auto-select first conversation if none selected
  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  const activeConversation = useMemo(() => {
    return conversations.find((c: any) => c.id === selectedConversationId) || null;
  }, [conversations, selectedConversationId]);

  // 2. Fetch messages for active conversation
  const {
    data: messages = [],
    isLoading: isLoadingMessages,
    refetch: refetchMessages,
  } = trpc.admin.conversationMessages.useQuery(
    { conversationId: selectedConversationId || 0 },
    {
      enabled: !!selectedConversationId,
      refetchInterval: 2500,
    }
  );

  // 3. Fetch customer context (Profile, Entitlements, Order History)
  const {
    data: customerContext,
    isLoading: isLoadingContext,
    refetch: refetchContext,
  } = trpc.admin.customerContext.useQuery(
    { customerId: activeConversation?.customerId || 0 },
    {
      enabled: !!activeConversation?.customerId,
    }
  );

  // 4. Mutations
  const replyMutation = trpc.admin.replyMessage.useMutation({
    onSuccess: () => {
      setReplyMessage("");
      refetchMessages();
      refetchConversations();
      setTimeout(scrollToBottom, 100);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to send admin reply");
    },
  });

  const markReadMutation = trpc.admin.markConversationRead.useMutation({
    onSuccess: () => {
      refetchConversations();
    },
  });

  // Auto mark read when opening a conversation with unread customer messages
  useEffect(() => {
    if (selectedConversationId && activeConversation && activeConversation.unreadCount > 0) {
      markReadMutation.mutate({ conversationId: selectedConversationId });
    }
  }, [selectedConversationId, activeConversation?.unreadCount]);

  // Real-time Supabase Broadcast Channel Listener
  useEffect(() => {
    if (!selectedConversationId) return;

    const channel = supabase
      .channel(`support_chat_${selectedConversationId}`)
      .on("broadcast", { event: "new_message" }, () => {
        refetchMessages();
        refetchConversations();
      })
      .on("broadcast", { event: "messages_read" }, () => {
        refetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversationId, refetchMessages, refetchConversations]);

  // Global admin inbox notification channel
  useEffect(() => {
    const adminInboxChannel = supabase
      .channel("admin_support_inbox")
      .on("broadcast", { event: "conversation_updated" }, () => {
        refetchConversations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(adminInboxChannel);
    };
  }, [refetchConversations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]);

  const handleSendReply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = replyMessage.trim();
    if (!trimmed || !selectedConversationId || replyMutation.isPending) return;

    replyMutation.mutate({
      conversationId: selectedConversationId,
      message: trimmed,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  // Filtered conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter((c: any) => {
      if (unreadOnlyFilter && c.unreadCount === 0) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = c.customer?.name?.toLowerCase().includes(q);
        const emailMatch = c.customer?.email?.toLowerCase().includes(q);
        const lastMsgMatch = c.lastMessage?.message?.toLowerCase().includes(q);
        return nameMatch || emailMatch || lastMsgMatch;
      }
      return true;
    });
  }, [conversations, unreadOnlyFilter, searchQuery]);

  const formatTime = (dateStr?: string | null) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
            <MessageSquare className="size-6 text-sky-500" />
            <span>Support Messages</span>
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Real-time direct customer messaging with integrated profile, purchased products, and order history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              refetchConversations();
              if (selectedConversationId) refetchMessages();
            }}
            className="gap-1.5 text-xs font-bold border-slate-300 dark:border-slate-800"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* 3-PANEL WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[720px] rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xl">
        {/* PANEL 1: CONVERSATIONS LIST (3 Cols on desktop) */}
        <div className="lg:col-span-3 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full bg-slate-50/60 dark:bg-slate-950/40">
          {/* Search & Filter Header */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student or message..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-3 py-1.5 text-xs outline-none focus:border-sky-500 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setUnreadOnlyFilter(!unreadOnlyFilter)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                  unreadOnlyFilter
                    ? "bg-amber-500 text-slate-950 font-black"
                    : "bg-slate-200/70 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                <span>Unread Only</span>
                {conversations.filter((c: any) => c.unreadCount > 0).length > 0 && (
                  <span className="size-4 rounded-full bg-amber-600 text-white text-[9px] flex items-center justify-center font-mono">
                    {conversations.filter((c: any) => c.unreadCount > 0).length}
                  </span>
                )}
              </button>

              <span className="text-[11px] font-mono text-slate-400">
                {filteredConversations.length} Active
              </span>
            </div>
          </div>

          {/* Conversations Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {isLoadingConversations ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400">
                <Loader2 size={24} className="animate-spin text-sky-500" />
                <span className="text-xs font-bold">Loading chats...</span>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No conversations found.
              </div>
            ) : (
              filteredConversations.map((conv: any) => {
                const isSelected = conv.id === selectedConversationId;
                const hasUnread = conv.unreadCount > 0;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversationId(conv.id)}
                    className={`w-full p-3.5 text-left transition-all flex items-start gap-3 relative ${
                      isSelected
                        ? "bg-sky-50 dark:bg-sky-950/40 border-l-4 border-sky-500"
                        : "hover:bg-slate-100/70 dark:hover:bg-slate-800/50 border-l-4 border-transparent"
                    }`}
                  >
                    {/* Customer Avatar */}
                    <div className="relative shrink-0 mt-0.5">
                      {conv.customer?.avatar ? (
                        <img
                          src={conv.customer.avatar}
                          alt={conv.customer.name}
                          className="size-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div className="size-9 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs flex items-center justify-center border border-slate-300 dark:border-slate-700">
                          {conv.customer?.name ? conv.customer.name[0].toUpperCase() : "C"}
                        </div>
                      )}
                      {hasUnread && (
                        <span className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                          {conv.customer?.name || `Customer #${conv.customerId}`}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {formatTime(conv.lastMessageAt || conv.createdAt)}
                        </span>
                      </div>

                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {conv.lastMessage ? (
                          <>
                            {conv.lastMessage.senderRole === "admin" && (
                              <span className="font-bold text-sky-500 dark:text-sky-400 mr-1">You:</span>
                            )}
                            {conv.lastMessage.message}
                          </>
                        ) : (
                          <span className="italic text-slate-400">No messages yet</span>
                        )}
                      </p>

                      {hasUnread && (
                        <div className="mt-1.5 flex items-center justify-between">
                          <span className="rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.2 text-[10px] font-black">
                            {conv.unreadCount} unread
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* PANEL 2: ACTIVE CHAT THREAD (6 Cols on desktop) */}
        <div className="lg:col-span-6 flex flex-col h-full bg-white dark:bg-slate-900">
          {!activeConversation ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <MessageSquare size={36} className="text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-sm font-bold">Select a conversation to start messaging</p>
            </div>
          ) : (
            <>
              {/* Chat Thread Header */}
              <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 font-bold text-xs">
                    {activeConversation.customer?.name
                      ? activeConversation.customer.name[0].toUpperCase()
                      : "C"}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {activeConversation.customer?.name}
                    </h3>
                    <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      {activeConversation.customer?.email || `Customer #${activeConversation.customerId}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Direct Thread
                  </span>
                </div>
              </div>

              {/* Chat Messages Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/30 dark:bg-slate-950/20">
                {isLoadingMessages ? (
                  <div className="flex h-full items-center justify-center py-16 gap-2 text-slate-400">
                    <Loader2 size={24} className="animate-spin text-sky-500" />
                    <span className="text-xs font-bold">Loading messages...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 text-xs">
                    <MessageSquare size={32} className="text-slate-300 dark:text-slate-700 mb-2" />
                    <p>No messages yet in this conversation.</p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Send a message below to greet this student.
                    </p>
                  </div>
                ) : (
                  messages.map((msg: any) => {
                    const isAdmin = msg.senderRole === "admin" || msg.senderRole === "support";
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-end gap-2 ${
                          isAdmin ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!isAdmin && (
                          <div className="size-6 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-200 shrink-0 mb-1">
                            {activeConversation.customer?.name?.[0] || "C"}
                          </div>
                        )}

                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm text-xs sm:text-sm ${
                            isAdmin
                              ? "bg-sky-600 text-white rounded-br-xs"
                              : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-xs"
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed break-words">
                            {msg.message}
                          </p>

                          <div
                            className={`mt-1 flex items-center justify-end gap-1 text-[10px] font-mono ${
                              isAdmin ? "text-sky-200" : "text-slate-400"
                            }`}
                          >
                            <span>{formatTime(msg.createdAt)}</span>
                            {isAdmin && (
                              <span>
                                {msg.readAt ? (
                                  <CheckCheck size={12} className="text-white" />
                                ) : (
                                  <Check size={12} className="text-sky-200" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Reply Box */}
              <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <form onSubmit={handleSendReply} className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <textarea
                      rows={2}
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your official reply... (Enter to send, Shift+Enter for newline)"
                      className="flex-1 resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-sky-500"
                    />

                    <Button
                      type="submit"
                      disabled={!replyMessage.trim() || replyMutation.isPending}
                      className="h-full px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black gap-1.5 shrink-0"
                    >
                      {replyMutation.isPending ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Send size={16} />
                      )}
                      <span className="hidden sm:inline">Reply</span>
                    </Button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                    <span>
                      Replies trigger instant in-app notification & customer email notification
                    </span>
                    <span className="font-mono">Text only</span>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>

        {/* PANEL 3: CUSTOMER INFORMATION PANEL (3 Cols on desktop) */}
        <div className="lg:col-span-3 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full bg-slate-50/60 dark:bg-slate-950/40 overflow-y-auto p-4 space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <User size={13} className="text-sky-500" />
              <span>Customer Context Panel</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live account history & purchased packages
            </p>
          </div>

          {!customerContext ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              {isLoadingContext ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 size={20} className="animate-spin text-sky-500" />
                  <span>Loading customer context...</span>
                </div>
              ) : (
                "Select a conversation to see customer profile."
              )}
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              {/* Profile Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 space-y-2.5 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="size-10 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-500 flex items-center justify-center font-black text-sm">
                    {customerContext.customer.name?.[0] || "C"}
                  </div>
                  <div>
                    <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {customerContext.customer.name}
                    </h5>
                    <span className="text-[10px] font-mono text-slate-400">
                      ID: #{customerContext.customer.id} • {customerContext.customer.role}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Mail size={12} className="text-slate-400 shrink-0" />
                    <span className="truncate">{customerContext.customer.email || "No email"}</span>
                  </div>
                  {customerContext.customer.phone && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Phone size={12} className="text-slate-400 shrink-0" />
                      <span>{customerContext.customer.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Calendar size={12} className="text-slate-400 shrink-0" />
                    <span>Joined: {formatDate(customerContext.customer.createdAt)}</span>
                  </div>
                </div>

                {/* KPI Summary */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Spent</div>
                    <div className="font-black text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                      ৳{customerContext.stats.totalSpend.toLocaleString()}
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Orders</div>
                    <div className="font-black text-xs text-sky-500 mt-0.5">
                      {customerContext.stats.totalOrders}
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Entitlements & Unlocked Products */}
              <div className="space-y-2">
                <h5 className="font-extrabold text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <PackageCheck size={13} className="text-emerald-500" />
                  <span>Purchased Access ({customerContext.entitlements.length})</span>
                </h5>

                {customerContext.entitlements.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-3 text-center text-slate-400 text-[11px]">
                    No active entitlements.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {customerContext.entitlements.map((ent: any) => (
                      <div
                        key={ent.id}
                        className="rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs text-emerald-950 dark:text-emerald-200">
                            {ent.productTitle}
                          </span>
                          <span className="text-[9px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-200/50 dark:bg-emerald-900/50 px-1.5 py-0.5 rounded">
                            ACTIVE
                          </span>
                        </div>
                        <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          Unlocked: {formatDate(ent.grantedAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order History */}
              <div className="space-y-2">
                <h5 className="font-extrabold text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Receipt size={13} className="text-sky-500" />
                  <span>Order History ({customerContext.orders.length})</span>
                </h5>

                {customerContext.orders.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-3 text-center text-slate-400 text-[11px]">
                    No orders placed.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customerContext.orders.map((ord: any) => (
                      <div
                        key={ord.id}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs font-mono">
                            #COC-{ord.id}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                              ord.orderStatus === "approved"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                : ord.orderStatus === "rejected"
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                            }`}
                          >
                            {ord.orderStatus}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>
                            ৳{Number(ord.amount).toLocaleString()} ({ord.paymentMethod})
                          </span>
                          <span className="text-[10px] font-mono">
                            {formatDate(ord.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
