import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft } from 'lucide-react';
import Layout from '@/components/Layout';

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md shadow-hero">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Paiement annulé
            </CardTitle>
            <CardDescription>
              Votre paiement a été annulé. Aucun frais n'a été prélevé.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Vous pouvez reprendre le processus d'abonnement à tout moment.
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => navigate('/subscription')}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Finaliser le paiement
              </Button>
              <Button 
                onClick={() => navigate('/auth')}
                className="flex-1 bg-gradient-hero"
              >
                Se déconnecter
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PaymentCancel;