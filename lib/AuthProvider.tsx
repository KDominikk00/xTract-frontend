"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Session, User } from "@supabase/supabase-js";

type AuthContextType = {
  session: Session | null;
  user: User | null;
};

const AuthContext = createContext<AuthContextType>({ session: null, user: null });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let isMounted = true;

    const syncAuth = async (nextSession?: Session | null) => {
      const sessionToUse = typeof nextSession === "undefined"
        ? (await supabase.auth.getSession()).data.session
        : nextSession;

      if (!isMounted) return;
      setSession(sessionToUse);

      if (!sessionToUse) {
        setUser(null);
        return;
      }

      // Fetch fresh user metadata so plan/tier badges stay accurate after billing changes.
      const { data } = await supabase.auth.getUser();
      if (!isMounted) return;
      setUser(data.user ?? sessionToUse.user ?? null);
    };

    void syncAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncAuth(session);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
