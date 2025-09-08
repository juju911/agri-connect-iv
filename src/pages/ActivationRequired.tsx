import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sprout, Users, Check, AlertTriangle, Loader2, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { useNavigate } from 'react-router-dom';

const ActivationRequired = () => {
  const { profile, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Prix annuels selon le rôle
  const getActivationPlan = () => {
    if (profile?.role === 'acheteur') {
      return {
        type: 'acheteur' as const,
        name: 'Plan Acheteur',
        price: 1000, // 1000 F CFA annuel
        period: 'annuel',
        description: 'Accédez aux produits agricoles de qualité',
        icon: Users,
        features: [
          'Recherche de produits agricoles par nom, quantité, prix et localisation',
          'Liste complète des agriculteurs disponibles',
          'Messagerie/contact direct avec les producteurs',
          'Historique des commandes et transactions',
          'Support client prioritaire'
        ]
      };
    } else {
      return {
        type: 'agriculteur' as const,
        name: 'Plan Agriculteur',
        price: 500, // 500 F CFA annuel
        period: 'annuel',
        description: 'Vendez vos produits et optimisez vos revenus',
        icon: Sprout,
        features: [
          'Ajout et gestion de vos cultures',
          'Prévisions IA de la demande du marché',
          'Liste des acheteurs intéressés par vos produits',
          'Outils d\'analyse et statistiques de vente',
          'Support technique agricole'
        ]
      };
    }
  };

  const plan = getActivationPlan();
  const Icon = plan.icon;

  const handleActivateAccount = async () => {
    if (!profile) return;

    setLoading(true);
    
    try {
      // Créer la session de paiement Paystack
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

  if (!profile) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement du profil...</p>
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
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              🔒 Activation Obligatoire
            </h1>
            <div className="mb-6 p-6 bg-red-50 border-2 border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-red-800 font-semibold mb-2">
                    Compte non activé - Paiement requis
                  </p>
                  <div className="text-red-700 text-sm space-y-1">
                    <p>Bonjour <strong>{profile.name}</strong>,</p>
                    <p>Votre compte <strong>{profile.role}</strong> a été créé avec succès.</p>
                    <p>Pour accéder aux fonctionnalités AgriChain+, vous devez finaliser votre inscription en effectuant le paiement d'activation annuel.</p>
                    <p className="font-medium mt-2">Aucun accès aux données ne sera autorisé sans abonnement actif.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activation Plan */}
          <Card className="border-2 border-agri-green shadow-hero mb-8">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl text-agri-green">{plan.name}</CardTitle>
              <CardDescription>
                {plan.description}
              </CardDescription>
              <div className="pt-4">
                <span className="text-4xl font-bold text-agri-green">
                  {plan.price.toLocaleString()}
                </span>
                <span className="text-muted-foreground"> F CFA</span>
                <Badge className="ml-2 bg-agri-green text-white">
                  Abonnement {plan.period}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Valable 1 an à partir de la date de paiement
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3 text-agri-green">
                  🎯 Fonctionnalités incluses :
                </h3>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-agri-green mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-green-800 text-sm">
                  <strong>💳 Paiement sécurisé via Paystack</strong><br/>
                  Votre abonnement sera activé immédiatement après confirmation du paiement.
                  Vous serez automatiquement redirigé vers votre tableau de bord.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full bg-gradient-hero hover:opacity-90 text-lg py-6"
                  disabled={loading}
                  onClick={handleActivateAccount}
                >
                  {loading && (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  )}
                  🚀 Procéder au paiement - {plan.price.toLocaleString()} F CFA
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full border-gray-300 text-gray-600"
                  onClick={handleLogout}
                >
                  Se déconnecter et réessayer plus tard
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Footer Note */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              🔒 Paiement sécurisé • 📞 Support client : support@agrichain.com
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ActivationRequired;