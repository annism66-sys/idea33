

## Fix: Account Name Not Showing After Login

### Problem
After logging in (especially via Google OAuth), the user's account name no longer appears in the navbar on the homepage. Instead, it still shows "Sign In" / "Get Started" buttons.

### Root Cause
The `useAuth` hook has overly aggressive session-clearing logic that was added to fix "Failed to fetch" / "LockManager timeout" errors. Specifically:

1. **`clearStaleAuthData()` runs on every module import** -- it checks `expires_at` on the stored token and removes it if expired. However, after an OAuth redirect, the Supabase client may not have finished setting up the new session yet, and this function could interfere with the token exchange process.

2. **The 5-second safety timeout clears the session AND removes the token from localStorage** -- if `getSession()` takes slightly longer (common after OAuth redirects), this timeout fires, wipes the valid session, and sets user to `null`.

3. **Error handlers in `getSession()` also call `signOut()` and clear localStorage** -- any transient network hiccup during session retrieval causes a full sign-out, losing the session permanently.

The net effect: the session is established by the OAuth callback, but the aggressive clearing logic destroys it before the UI can read it.

### Solution

Simplify `useAuth.ts` to stop aggressively destroying valid sessions:

1. **Remove `clearStaleAuthData()` entirely** -- the Supabase client already handles expired tokens by refreshing them automatically. Deleting the token preemptively prevents the client from using the refresh token.

2. **Keep the safety timeout but only set `loading = false`** -- don't clear the session or remove localStorage data. If `getSession()` hangs, just stop showing the loading spinner and let the `onAuthStateChange` listener handle it when it resolves.

3. **Simplify error handling in `getSession()`** -- on error, just set loading to false and log the warning. Don't call `signOut()` or remove tokens, as the `onAuthStateChange` listener will handle state correctly.

4. **Remove aggressive localStorage clearing from `Auth.tsx`** -- the `clearStaleSession` effect on the Auth page also removes tokens unnecessarily. Simplify it to just check for an existing session and redirect if found, without clearing storage on errors.

### Files to Change

**`src/hooks/useAuth.ts`**
- Remove `clearStaleAuthData()` function and its module-level call
- Simplify the timeout to only toggle `loading` to false (no token/session clearing)
- Simplify `getSession()` error handling: log warning, set loading false, but don't sign out or clear storage

**`src/pages/Auth.tsx`**  
- Simplify the `clearStaleSession` effect: remove the `catch` block that clears localStorage. Just check for existing session and redirect.

### Technical Details

Updated `useAuth.ts` pattern:
```typescript
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    // Safety timeout -- only stop loading spinner, don't destroy session
    const timeout = setTimeout(() => {
      setLoading(false);
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
```

Updated `Auth.tsx` effect:
```typescript
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) navigate("/portfolio");
  });
}, [navigate]);
```

No UI changes are made -- only the auth state management logic is cleaned up.
