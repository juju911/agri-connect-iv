import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RefreshCw, Loader2, Users, Sprout } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { useNavigate } from 'react-router-dom';

const SubscriptionExpired = () => {
  const { profile, subscription, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Calculer les jours d'expiration
  const getDaysExpired = () => {
    if (!subscription?.current_period_end) return 0;
    const expireDate = new Date(subscription.current_period_end);
    const today = new Date();
    const diffTime = today.getTime() - expireDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getRenewalPlan = () => {
    if (profile?.role === 'acheteur') {
      return {
        type: 'acheteur' as const,
        name: 'Plan Acheteur',
        price: 1000,
        icon: Users,
      };
    } else {
      return {
        type: 'agriculteur' as const,
        name: 'Plan Agriculteur',
        price: 500,
        icon: Sprout,
      };
    }
  };

  const plan = getRenewalPlan();
  const Icon = plan.icon;
  const daysExpired = getDaysExpired();

  const handleRenewSubscription = async () => {
    if (!profile) return;

    setLoading(true);
    
    try {
      // Créer la session de paiement Paystack pour le renouvellement
      const { data, error } = await supabase.functions.invoke('create-paystack-subscription', {
        body: {
          plan_type: profile.role,
          amount: plan.price
        }
      });

      if (error) {
        throw error;
      }

      if (data?.authorization_url) {
        // Redirection vers Paystack pour le paiement
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
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  if (!profile || !subscription) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Alert Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              ⏰ Abonnement Expiré
            </h1>
            <div className="mb-6 p-6 bg-red-50 border-2 border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-red-800 font-semibold mb-2">
                    Accès suspendu - Renouvellement requis
                  </p>
                  <div className="text-red-700 text-sm space-y-1">
                    <p>Bonjour <strong>{profile.name}</strong>,</p>
                    <p>Votre abonnement <strong>{subscription.plan_type}</strong> a expiré 
                       {subscription.current_period_end && (
                         <span> le {new Date(subscription.current_period_end).toLocaleDateString('fr-FR', {
                           day: '2-digit',
                           month: 'long',
                           year: 'numeric'
                         })}</span>
                       )}
                       {daysExpired > 0 && (
                         <span> (il y a {daysExpired} jour{daysExpired > 1 ? 's' : ''})</span>
                       )}.
                    </p>
                    <p className="font-medium mt-2">
                      🔒 L'accès aux données AgriChain+ est désormais bloqué jusqu'au renouvellement de votre abonnement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Renewal Plan */}
          <Card className="border-2 border-agri-green shadow-hero mb-8">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl text-agri-green">
                Renouveler {plan.name}
              </CardTitle>
              <CardDescription>
                Retrouvez l'accès à toutes vos fonctionnalités
              </CardDescription>
              <div className="pt-4">
                <span className="text-4xl font-bold text-agri-green">
                  {plan.price.toLocaleString()}
                </span>
                <span className="text-muted-foreground"> F CFA</span>
                <Badge className="ml-2 bg-agri-green text-white">
                  Renouvellement annuel
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Valable 1 an à partir de la date de paiement
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-green-800 text-sm">
                  <strong>🚀 Renouvelez maintenant et retrouvez immédiatement :</strong><br/>
                  • Accès complet à votre tableau de bord<br/>
                  • Toutes les fonctionnalités {profile.role}<br/>
                  • Données sauvegardées intactes<br/>
                  • Support client prioritaire
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full bg-gradient-hero hover:opacity-90 text-lg py-6"
                  disabled={loading}
                  onClick={handleRenewSubscription}
                >
                  {loading && (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  )}
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Renouveler maintenant - {plan.price.toLocaleString()} F CFA
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full border-gray-300 text-gray-600"
                  onClick={handleLogout}
                >
                  Se déconnecter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="border border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs">ℹ</span>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-blue-800 mb-1">
                    Vos données sont conservées en sécurité
                  </p>
                  <p className="text-blue-700">
                    Toutes vos informations, produits et commandes sont sauvegardés. 
                    Dès le renouvellement, vous retrouverez l'accès à l'intégralité de vos données.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer Note */}
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              🔒 Paiement sécurisé • 📞 Support client : support@agrichain.com
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SubscriptionExpired;