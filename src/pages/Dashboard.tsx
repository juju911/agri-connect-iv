import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import AdminDashboard from './AdminDashboard';
import FarmerDashboard from './FarmerDashboard';
import BuyerDashboard from './BuyerDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import Layout from '@/components/Layout';

const Dashboard = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-agri-green mx-auto mb-4"></div>
            <p>Chargement...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Profil non trouvé</h3>
              <p className="text-muted-foreground">
                Impossible de charger votre profil. Veuillez vous reconnecter.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Route to appropriate dashboard based on user role
  switch (profile.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'agriculteur':
      return <FarmerDashboard />;
    case 'acheteur':
      return <BuyerDashboard />;
    default:
      return (
        <Layout>
          <div className="min-h-screen bg-background flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardContent className="p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Rôle non reconnu</h3>
                <p className="text-muted-foreground">
                  Votre rôle utilisateur n'est pas valide. Contactez l'administrateur.
                </p>
              </CardContent>
            </Card>
          </div>
        </Layout>
      );
  }
};

export default Dashboard;