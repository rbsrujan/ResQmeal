import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'donor' | 'volunteer' | 'receiver';
  phone?: string;
  city?: string;
  profile_completed?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, session: null, profile: null,
  loading: true, signOut: async () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (user: User) => {
    let attempts = 0;

    while (attempts < 5) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (data?.role) {
        setProfile(data as Profile);
        return;
      }

      if (error) console.error('Error fetching profile:', error.message);
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }

    // SELF-HEAL: If profile missing, but we have metadata, repair it
    const metadata = user.user_metadata;
    if (metadata?.role) {
      console.log('Profile missing but metadata found. Self-healing...');
      const { data: repairedProfile, error: repairError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          full_name: metadata.full_name || 'User',
          role: metadata.role
        })
        .select()
        .single();

      if (!repairError && repairedProfile) {
        setProfile(repairedProfile as Profile);
        console.log('Profile self-healed successfully.');
      } else {
        console.error('Profile self-healing failed:', repairError?.message);
      }
    } else {
      console.warn('Could not load profile and no metadata available for user:', user.id);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) fetchProfile(session.user);
        else setProfile(null);
        setLoading(false);
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null); setSession(null); setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// Resubmission commit update
