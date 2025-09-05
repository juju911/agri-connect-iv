import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSubscription?: boolean;
  allowedRoles?: ('admin' | 'agriculteur' | 'acheteur')[];
}

const ProtectedRoute = ({ 
  children, 
  requireSubscription = false, 
  allowedRoles 
}: ProtectedRouteProps) => {
  const { user, profile, subscription, loading } = useAuth();
  const { toast } = useToast();
  const [paymentLoading, setPaymentLoading] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-agri-green" />
            <h3 className="text-lg font-semibold mb-2">Chargement...</h3>
            <p className="text-muted-foreground">
              Vérification de votre authentification
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2 text-destructive">
              Profil manquant
            </h3>
            <p className="text-muted-foreground">
              Votre profil n'a pas pu être chargé. Veuillez contacter le support.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check role permissions
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2 text-destructive">
              Accès non autorisé
            </h3>
            <p className="text-muted-foreground">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle direct payment based on user role
  const handleDirectPayment = async () => {
    if (!profile) return;

    setPaymentLoading(true);
    
    try {
      // Determine price based on role
      const planPrices = {
        'agriculteur': 500,
        'acheteur': 1000
      };
      
      const amount = planPrices[profile.role as keyof typeof planPrices] || 1000;
      
      // Invoke Paystack payment function
      const { data, error } = await supabase.functions.invoke('create-paystack-subscription', {
        body: {
          plan_type: profile.role,
          amount: amount
        }
      });

      if (error) {
        throw error;
      }

      if (data?.authorization_url) {
        // Redirect to Paystack payment page
        window.location.href = data.authorization_url;
      } else {
        throw new Error('URL de paiement non reçue');
      }
    } catch (error: any) {
      toast({
        title: "Erreur de paiement",
        description: error.message || "Impossible de créer la session de paiement",
        variant: "destructive"
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  // CRITICAL: Vérification obligatoire du paiement pour tous les non-admins
  if (profile.role !== 'admin' && (!subscription || subscription.status !== 'active')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md border-2 border-red-200">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-red-800">
              🔒 Paiement requis
            </h3>
            <p className="text-red-700 mb-4 text-sm">
              <strong>Accès bloqué :</strong> Votre inscription n'est pas finalisée.
              <br />
              Vous devez effectuer le paiement Paystack pour accéder aux fonctionnalités AgriChain+.
            </p>
            <div className="space-y-2">
              <button
                onClick={handleDirectPayment}
                disabled={paymentLoading}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {paymentLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Finaliser le paiement
                {profile?.role === 'agriculteur' ? ' (500 F CFA/mois)' : ' (1000 F CFA/mois)'}
              </button>
              <p className="text-xs text-red-600">
                Aucun accès sans paiement confirmé
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check subscription requirement (pour les routes spécifiques nécessitant un abonnement)
  if (requireSubscription && profile.role !== 'admin' && (!subscription || subscription.status !== 'active')) {
    return <Navigate to="/subscription" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;