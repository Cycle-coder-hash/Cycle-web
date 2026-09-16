import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath } = options ?? {};
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Synchronously extract token from hash if present
  if (typeof window !== "undefined" && !localStorage.getItem("cycle_session_token")) {
    const hash = window.location.hash;
    if (hash.includes("access_token=")) {
      const params = new URLSearchParams(hash.replace(/^#/, ""));
      const token = params.get("access_token");
      if (token) {
        try {
          localStorage.setItem("cycle_session_token", token);
        } catch {}
      }
    }
  }

  // Sync Supabase Auth listener
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.access_token) {
        localStorage.setItem("cycle_session_token", session.access_token);
        try {
          await utils.auth.me.invalidate();
          await meQuery.refetch();
        } catch {}
      } else if (event === "SIGNED_OUT") {
        localStorage.removeItem("cycle_session_token");
        sessionStorage.removeItem("manus-cookie");
        utils.auth.me.setData(undefined, null);
        try {
          await utils.auth.me.invalidate();
        } catch {}
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [utils]);

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        return;
      }
    } finally {
      try {
        localStorage.removeItem("cycle_session_token");
        sessionStorage.removeItem("manus-cookie");
      } catch {}
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

  const state = useMemo(() => {
    if (meQuery.data) {
      localStorage.setItem("manus-runtime-user-info", JSON.stringify(meQuery.data));
    }
    let resolvedUser = meQuery.data ?? null;
    if (!resolvedUser && typeof window !== "undefined") {
      const token = localStorage.getItem("cycle_session_token");
      if (token) {
        const cached = localStorage.getItem("manus-runtime-user-info");
        if (cached && cached !== "null" && cached !== "undefined") {
          try {
            resolvedUser = JSON.parse(cached);
          } catch {}
        }
        if (!resolvedUser) {
          try {
            const base64Url = token.split(".")[1];
            if (base64Url) {
              const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
              const jsonPayload = decodeURIComponent(
                atob(base64)
                  .split("")
                  .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                  .join("")
              );
              const payload = JSON.parse(jsonPayload);
              if (payload && (payload.sub || payload.email)) {
                resolvedUser = {
                  id: 1,
                  openId: payload.sub,
                  name:
                    payload.user_metadata?.name ||
                    payload.user_metadata?.full_name ||
                    payload.email?.split("@")[0] ||
                    "Trader",
                  email: payload.email,
                  passwordHash: null,
                  phone: payload.user_metadata?.phone || null,
                  role: "user",
                  loginMethod: "supabase",
                  avatar:
                    payload.user_metadata?.avatar_url ||
                    payload.user_metadata?.avatar ||
                    payload.user_metadata?.picture ||
                    null,
                  language: payload.user_metadata?.language || "en",
                  emailVerified: true,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  lastSignedIn: new Date(),
                } as any;
              }
            }
          } catch {}
        }
      }
    }

    return {
      user: resolvedUser,
      loading: meQuery.isLoading || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(resolvedUser),
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || logoutMutation.isPending) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (redirectPath && window.location.pathname === redirectPath) return;

    // Navigate at this moment only. startLogin() mints the nonce + cookie itself.
    if (redirectPath) {
      window.location.href = redirectPath;
    } else {
      startLogin();
    }
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    state.user,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
