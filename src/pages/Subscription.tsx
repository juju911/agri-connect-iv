import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sprout, Users, Check, Crown, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { useNavigate } from 'react-router-dom';

const Subscription = () => {
  const { profile, subscription, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<'agriculteur' | 'acheteur' | null>(null);

  const plans = [
    {
      type: 'acheteur' as const,
      name: 'Plan Acheteur',
      price: 1000,
      description: 'Accédez aux produits agricoles de qualité',
      icon: Users,
      features: [
        'Recherche de produits agricoles',
        'Contact direct avec les agriculteurs',
        'Historique des commandes',
        'Support client prioritaire'
      ]
    },
    {
      type: 'agriculteur' as const,
      name: 'Plan Agriculteur',
      price: 500,
      description: 'Vendez vos produits et optimisez vos revenus',
      icon: Sprout,
      features: [
        'Publication de vos produits',
        'Prévisions IA du marché',
        'Gestion des commandes',
        'Outils d\'analyse des ventes'
      ]
    }
  ];

  const handleSubscribe = async (planType: 'agriculteur' | 'acheteur') => {
    if (!profile) return;

    setLoading(planType);
    
    try {
      // Invoke Paystack payment function
      const { data, error } = await supabase.functions.invoke('create-paystack-subscription', {
        body: {
          plan_type: planType,
          amount: plans.find(p => p.type === planType)?.price || 0
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
      setLoading(null);
    }
  };

  const handleManageSubscription = () => {
    toast({
      title: "Gestion d'abonnement",
      description: "Contactez le support pour gérer votre abonnement",
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-6">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {!subscription || subscription.status !== 'active' ? 
                '🔒 Finalisation inscription AgriChain+' : 
                'Choisissez votre plan'
              }
            </h1>
            {!subscription || subscription.status !== 'active' ? (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium mb-1">
                  🔒 <strong>Paiement obligatoire requis</strong>
                </p>
                <p className="text-red-700 text-sm">
                  <strong>Votre inscription ne sera finalisée qu'après confirmation du paiement via Paystack.</strong>
                  <br />
                  Aucun accès aux fonctionnalités AgriChain+ ne sera autorisé sans abonnement actif.
                  <br />
                  Sélectionnez le plan correspondant à votre rôle pour démarrer le processus de paiement.
                </p>
              </div>
            ) : null}
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Débloquez tout le potentiel d'AgriChain+ avec un abonnement adapté à votre rôle
            </p>
          </div>

          {/* Current Subscription Status */}
          {subscription && (
            <Card className="mb-8 border-2 border-agri-green/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-agri-green">
                  <Check className="w-5 h-5" />
                  Abonnement actuel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">
                      Plan {subscription.plan_type === 'agriculteur' ? 'Agriculteur' : 'Acheteur'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(subscription.amount / 100).toLocaleString()} F CFA/mois
                    </p>
                    <Badge 
                      variant={subscription.status === 'active' ? 'default' : 'secondary'}
                      className={subscription.status === 'active' ? 'bg-agri-green' : ''}
                    >
                      {subscription.status === 'active' ? 'Actif' : subscription.status}
                    </Badge>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleManageSubscription}
                    className="border-agri-green text-agri-green"
                  >
                    Gérer l'abonnement
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pricing Plans */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrentPlan = subscription?.plan_type === plan.type && subscription?.status === 'active';
              const isRecommended = profile?.role === plan.type;
              
              return (
                <Card 
                  key={plan.type} 
                  className={`relative border-2 ${
                    isRecommended 
                      ? 'border-agri-green shadow-hero' 
                      : 'border-border hover:border-agri-green/50'
                  } transition-all duration-300`}
                >
                  {isRecommended && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-agri-green text-white px-3 py-1">
                        Recommandé pour vous
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      isRecommended ? 'bg-gradient-hero' : 'bg-muted'
                    }`}>
                      <Icon className={`w-6 h-6 ${isRecommended ? 'text-white' : 'text-muted-foreground'}`} />
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {plan.description}
                    </CardDescription>
                    <div className="pt-4">
                      <span className="text-3xl font-bold text-agri-green">
                        {plan.price.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground"> F CFA/mois</span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-agri-green mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="w-full bg-gradient-hero hover:opacity-90"
                      disabled={isCurrentPlan || loading === plan.type}
                      onClick={() => handleSubscribe(plan.type)}
                    >
                      {loading === plan.type && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      {isCurrentPlan 
                        ? 'Abonnement actuel' 
                        : `S'abonner - ${plan.price.toLocaleString()} F CFA/mois`
                      }
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground">
              Paiement sécurisé via Paystack • Résiliation possible à tout moment
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Support client : <span className="text-agri-green">support@agrichain.com</span>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Subscription;