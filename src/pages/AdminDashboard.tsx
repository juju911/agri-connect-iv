import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Package,
  Crown,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Brain
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';

interface Stats {
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  totalProducts: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  subscription_status?: string;
  subscription_amount?: number;
  created_at: string;
}

const AdminDashboard = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    totalProducts: 0
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPrediction, setNewPrediction] = useState({
    product_name: '',
    prediction_type: 'demand_increase' as 'demand_increase' | 'demand_decrease' | 'price_increase' | 'price_decrease',
    confidence_level: 75,
    prediction_text: '',
    valid_until: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const { data: profiles } = await supabase.from('profiles').select('*');
      const { data: subscriptions } = await supabase.from('subscriptions').select('*').eq('status', 'active');
      const { data: products } = await supabase.from('products').select('*');

      const totalRevenue = subscriptions?.reduce((sum, sub) => sum + (sub.amount || 0), 0) || 0;

      setStats({
        totalUsers: profiles?.length || 0,
        activeSubscriptions: subscriptions?.length || 0,
        totalRevenue: totalRevenue / 100, // Convert from kobo to F CFA
        totalProducts: products?.length || 0
      });

      // Fetch users with subscription info
      const { data: usersData } = await supabase
        .from('profiles')
        .select(`
          *,
          subscriptions!inner(status, amount)
        `);

      if (usersData) {
        const formattedUsers = usersData.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.user_id, // We'll need to join with auth.users for email
          role: user.role,
          subscription_status: user.subscriptions?.[0]?.status || null,
          subscription_amount: user.subscriptions?.[0]?.amount || null,
          created_at: user.created_at
        }));
        setUsers(formattedUsers);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du tableau de bord",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPrediction.product_name || !newPrediction.prediction_text || !newPrediction.valid_until) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.from('market_predictions').insert({
        product_name: newPrediction.product_name,
        prediction_type: newPrediction.prediction_type,
        confidence_level: newPrediction.confidence_level,
        prediction_text: newPrediction.prediction_text,
        valid_until: new Date(newPrediction.valid_until).toISOString(),
        created_by: profile?.user_id
      });

      if (error) throw error;

      toast({
        title: "Prévision créée !",
        description: "La prévision IA a été ajoutée avec succès",
      });

      // Reset form
      setNewPrediction({
        product_name: '',
        prediction_type: 'demand_increase',
        confidence_level: 75,
        prediction_text: '',
        valid_until: ''
      });

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la prévision",
        variant: "destructive"
      });
    }
  };

  const suspendUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Utilisateur suspendu",
        description: "L'abonnement a été annulé",
      });

      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de suspendre l'utilisateur",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-agri-green mx-auto mb-4"></div>
            <p>Chargement du tableau de bord...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Crown className="w-8 h-8 text-agri-orange" />
                Tableau de bord Administrateur
              </h1>
              <p className="text-muted-foreground mt-2">
                Gérez votre plateforme AgriChain+
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Utilisateurs inscrits
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Abonnements actifs</CardTitle>
                <CheckCircle className="h-4 w-4 text-agri-green" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
                <p className="text-xs text-muted-foreground">
                  Paiements en cours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenus mensuels</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} F</div>
                <p className="text-xs text-muted-foreground">
                  CFA par mois
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Produits</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  En vente
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* AI Predictions Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-agri-green" />
                  Créer une prévision IA
                </CardTitle>
                <CardDescription>
                  Ajoutez des prévisions de marché pour guider les agriculteurs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreatePrediction} className="space-y-4">
                  <div>
                    <Label>Produit</Label>
                    <Input
                      placeholder="ex: Maïs, Café, Cacao"
                      value={newPrediction.product_name}
                      onChange={(e) => setNewPrediction({...newPrediction, product_name: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label>Type de prévision</Label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={newPrediction.prediction_type}
                      onChange={(e) => setNewPrediction({...newPrediction, prediction_type: e.target.value as any})}
                    >
                      <option value="demand_increase">Hausse de la demande</option>
                      <option value="demand_decrease">Baisse de la demande</option>
                      <option value="price_increase">Hausse des prix</option>
                      <option value="price_decrease">Baisse des prix</option>
                    </select>
                  </div>

                  <div>
                    <Label>Niveau de confiance (%)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={newPrediction.confidence_level}
                      onChange={(e) => setNewPrediction({...newPrediction, confidence_level: parseInt(e.target.value)})}
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Expliquez la prévision..."
                      value={newPrediction.prediction_text}
                      onChange={(e) => setNewPrediction({...newPrediction, prediction_text: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label>Valide jusqu'au</Label>
                    <Input
                      type="date"
                      value={newPrediction.valid_until}
                      onChange={(e) => setNewPrediction({...newPrediction, valid_until: e.target.value})}
                    />
                  </div>

                  <Button type="submit" className="w-full bg-gradient-hero">
                    Créer la prévision
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Users Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Gestion des utilisateurs
                </CardTitle>
                <CardDescription>
                  Gérez les abonnements et accès des utilisateurs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {users.map((user) => (
                    <div key={user.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{user.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {user.role}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge 
                            variant={user.subscription_status === 'active' ? 'default' : 'secondary'}
                            className={user.subscription_status === 'active' ? 'bg-agri-green' : ''}
                          >
                            {user.subscription_status || 'Aucun'}
                          </Badge>
                        </div>
                      </div>
                      
                      {user.subscription_amount && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {(user.subscription_amount / 100).toLocaleString()} F CFA/mois
                        </p>
                      )}

                      {user.subscription_status === 'active' && user.role !== 'admin' && (
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => suspendUser(user.id)}
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Suspendre
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;