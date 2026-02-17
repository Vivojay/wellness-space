import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onIdTokenChanged, getIdToken, signOut } from "firebase/auth";
import { auth } from "./firebase";

const AuthContext = createContext(null);

const getAdminEmails = () => {
  const raw = import.meta.env.VITE_ADMIN_EMAILS || "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (nextUser) => {
      setUser(nextUser || null);
      if (nextUser) {
        const idToken = await getIdToken(nextUser, true);
        setToken(idToken);
      } else {
        setToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = useMemo(() => {
    if (!user?.email) return false;
    return getAdminEmails().includes(user.email.toLowerCase());
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAdmin,
      signOut: () => signOut(auth),
    }),
    [user, token, loading, isAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
