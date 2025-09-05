import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'verifying'>('verifying');

  useEffect(() => {
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref');
    
    if (reference || trxref) {
      verifyPayment(reference || trxref);
    } else {
      setPaymentStatus('failed');
      setVerifying(false);
    }
  }, [searchParams]);

  const verifyPayment = async (reference: string | null) => {
    if (!reference) {
      setPaymentStatus('failed');
      setVerifying(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('verify-paystack-payment', {
        body: { reference }
      });

      if (error) {
        throw error;
      }

      if (data?.verified && data?.subscription_active) {
        setPaymentStatus('success');
        
        // Refresh user profile to get updated subscription
        await refreshProfile();
        
        toast({
          title: "Paiement réussi !",
          description: "Votre abonnement est maintenant actif.",
        });
      } else {
        setPaymentStatus('failed');
        toast({
          title: "Échec du paiement",
          description: data?.message || "Le paiement n'a pas pu être vérifié.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      setPaymentStatus('failed');
      toast({
        title: "Erreur de vérification",
        description: "Impossible de vérifier le paiement. Contactez le support.",
        variant: "destructive"
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleContinue = () => {
    navigate('/dashboard');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md shadow-hero">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
              {verifying && (
                <div className="w-16 h-16 border-4 border-agri-green/20 border-t-agri-green rounded-full animate-spin">
                  <Loader2 className="w-8 h-8 text-agri-green" />
                </div>
              )}
              {paymentStatus === 'success' && (
                <div className="w-16 h-16 bg-agri-green-light rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-agri-green" />
                </div>
              )}
              {paymentStatus === 'failed' && (
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-destructive" />
                </div>
              )}
            </div>
            
            <CardTitle className="text-2xl font-bold">
              {verifying && "Vérification du paiement..."}
              {paymentStatus === 'success' && "Paiement réussi !"}
              {paymentStatus === 'failed' && "Échec du paiement"}
            </CardTitle>
            
            <CardDescription>
              {verifying && "Veuillez patienter pendant que nous vérifions votre paiement."}
              {paymentStatus === 'success' && "Votre abonnement AgriChain+ est maintenant actif."}
              {paymentStatus === 'failed' && "Le paiement n'a pas pu être traité."}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            {paymentStatus === 'success' && (
              <div className="space-y-4">
                <div className="p-4 bg-agri-green-light rounded-lg">
                  <p className="text-sm text-agri-green font-medium">
                    ✓ Abonnement activé
                  </p>
                  <p className="text-sm text-agri-green font-medium">
                    ✓ Accès complet débloqué
                  </p>
                  <p className="text-sm text-agri-green font-medium">
                    ✓ Prêt à utiliser la plateforme
                  </p>
                </div>
                
                <Button 
                  onClick={handleContinue}
                  className="w-full bg-gradient-hero hover:opacity-90"
                >
                  Accéder au tableau de bord
                </Button>
              </div>
            )}
            
            {paymentStatus === 'failed' && (
              <div className="space-y-4">
                <div className="p-4 bg-destructive/10 rounded-lg">
                  <p className="text-sm text-destructive">
                    Le paiement n'a pas abouti. Veuillez réessayer ou contacter le support.
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => navigate('/subscription')}
                    variant="outline"
                    className="flex-1"
                  >
                    Réessayer
                  </Button>
                  <Button 
                    onClick={() => navigate('/dashboard')}
                    className="flex-1"
                  >
                    Continuer
                  </Button>
                </div>
              </div>
            )}

            {verifying && (
              <p className="text-sm text-muted-foreground">
                Cette vérification peut prendre quelques secondes...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PaymentSuccess;