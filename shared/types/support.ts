/**
 * shared/types/support.ts
 * Shared DTOs and types for Customer Support Messaging and Intelligence Workspace.
 */

export interface SupportCustomerProfile {
  id: number;
  openId?: string | null;
  displayId?: string;
  name: string;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  username?: string | null;
  role?: string;
  accountStatus?: string;
  createdAt: string | null;
}

export interface SupportConversationRecord {
  id: number;
  customerId: number;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string | null;
}

export interface SupportMessageRecord {
  id: number;
  conversationId: number;
  senderId: number;
  senderRole: "customer" | "admin" | "user" | "support";
  message: string;
  readAt: string | null;
  createdAt: string;
}

export interface AdminSupportConversationSummary {
  id: number;
  customerId: number;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string | null;
  customer: SupportCustomerProfile;
  lastMessage: SupportMessageRecord | null;
  unreadCount: number;
  totalMessages: number;
}

export interface CustomerSupportContext {
  customer: SupportCustomerProfile;
  entitlements: Array<{
    id: number;
    orderId?: number;
    productId?: number;
    bundleId?: number;
    scope: string;
    productTitle?: string;
    grantedAt: string;
  }>;
  orders: Array<{
    id: number;
    amount: string;
    currency: string;
    paymentMethod: string;
    paymentStatus: string;
    orderStatus: string;
    bundleId?: number | null;
    productId?: number | null;
    selectedPdfIds?: number[];
    createdAt: string;
  }>;
  stats: {
    totalSpend: number;
    totalOrders: number;
    activeEntitlementsCount: number;
  };
}
