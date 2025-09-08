import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  phone?: string;
  role: 'admin' | 'agriculteur' | 'acheteur';
  location?: string;
}

interface Subscription {
  id: string;
  user_id: string;
  plan_type: 'agriculteur' | 'acheteur';
  amount: number;
  status: 'pending' | 'active' | 'cancelled' | 'expired';
  current_period_start?: string;
  current_period_end?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  subscription: Subscription | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  subscription: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      // Si le profil n'existe pas et qu'on a une session active, 
      // cela signifie que l'utilisateur a été supprimé de la DB mais a encore une session
      if (!profileData && !profileError) {
        console.log('Profil introuvable pour un utilisateur connecté. Déconnexion forcée pour recréer le compte.');
        await supabase.auth.signOut();
        return;
      }

      if (profileError) {
        console.error('Erreur lors de la récupération du profil:', profileError);
        setProfile(null);
        return;
      }

      if (profileData) {
        setProfile({
          ...profileData,
          role: profileData.role as 'admin' | 'agriculteur' | 'acheteur'
        });
        
        // Fetch subscription
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')
          .maybeSingle();
        
        if (subscriptionData) {
          // Vérifier si l'abonnement est vraiment encore valide
          const now = new Date();
          const expiryDate = subscriptionData.current_period_end ? new Date(subscriptionData.current_period_end) : null;
          
          if (expiryDate && now > expiryDate) {
            // L'abonnement a expiré, mettre à jour le statut
            await supabase
              .from('subscriptions')
              .update({ status: 'expired' })
              .eq('id', subscriptionData.id);
            
            setSubscription({
              ...subscriptionData,
              plan_type: subscriptionData.plan_type as 'agriculteur' | 'acheteur',
              status: 'expired' as 'pending' | 'active' | 'cancelled' | 'expired'
            });
          } else {
            setSubscription({
              ...subscriptionData,
              plan_type: subscriptionData.plan_type as 'agriculteur' | 'acheteur',
              status: subscriptionData.status as 'pending' | 'active' | 'cancelled' | 'expired'
            });
          }
        } else {
          // Chercher aussi les abonnements expirés pour afficher l'info
          const { data: expiredSubscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .in('status', ['expired', 'cancelled'])
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          
          if (expiredSubscription) {
            setSubscription({
              ...expiredSubscription,
              plan_type: expiredSubscription.plan_type as 'agriculteur' | 'acheteur',
              status: expiredSubscription.status as 'pending' | 'active' | 'cancelled' | 'expired'
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setSubscription(null);
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setSubscription(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    session,
    profile,
    subscription,
    loading,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};