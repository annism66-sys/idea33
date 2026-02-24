import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// Clear any stale Supabase auth locks and tokens on module load
// This prevents the "Navigator LockManager lock timed out" error
function clearStaleAuthData() {
  try {
    const storageKey = `sb-${import.meta.env.VITE_SUPABASE_PROJECT_ID}-auth-token`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // If the token is expired, clear it to prevent lock timeouts
        if (parsed?.expires_at && parsed.expires_at * 1000 < Date.now()) {
          localStorage.removeItem(storageKey);
          console.warn("Cleared expired auth token from storage");
        }
      } catch {
        // Corrupted data, clear it
        localStorage.removeItem(storageKey);
      }
    }
  } catch {
    // Ignore storage access errors
  }
}

// Run immediately on import
clearStaleAuthData();

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session with error handling
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.warn("Session retrieval failed, clearing state:", error.message);
          supabase.auth.signOut().catch(() => {});
          setSession(null);
          setUser(null);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Auth getSession error:", err);
        // Clear corrupted session data to prevent lock timeouts on next load
        try {
          const storageKey = `sb-${import.meta.env.VITE_SUPABASE_PROJECT_ID}-auth-token`;
          localStorage.removeItem(storageKey);
        } catch {}
        setSession(null);
        setUser(null);
        setLoading(false);
      });

    // Safety timeout - if loading takes too long (e.g. lock timeout), clear state
    const timeout = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          console.warn("Auth loading timed out, clearing state");
          try {
            const storageKey = `sb-${import.meta.env.VITE_SUPABASE_PROJECT_ID}-auth-token`;
            localStorage.removeItem(storageKey);
          } catch {}
          setSession(null);
          setUser(null);
          return false;
        }
        return prev;
      });
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, session, loading, signOut };
}
