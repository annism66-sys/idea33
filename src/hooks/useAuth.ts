import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

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
          // Clear corrupted/stale session from localStorage to stop retry loops
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
        // Clear corrupted/stale session from localStorage to stop retry loops
        supabase.auth.signOut().catch(() => {});
        setSession(null);
        setUser(null);
        setLoading(false);
      });

    // Safety timeout - if loading takes too long, clear state
    const timeout = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          console.warn("Auth loading timed out, clearing state");
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
