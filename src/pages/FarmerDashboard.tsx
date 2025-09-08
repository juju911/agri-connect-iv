import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Sprout, 
  Package, 
  TrendingUp, 
  Plus,
  MapPin,
  Users,
  AlertCircle,
  CheckCircle,
  X,
  Check
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';

interface Product {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  location: string;
  status: 'available' | 'reserved' | 'sold';
  description?: string;
  created_at: string;
}

interface Order {
  id: string;
  quantity: number;
  total_amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  message?: string;
  created_at: string;
  buyer_profile: {
    name: string;
    phone?: string;
  };
  product: {
    name: string;
    price_per_unit: number;
  };
}

interface Prediction {
  id: string;
  product_name: string;
  prediction_type: 'demand_increase' | 'demand_decrease' | 'price_increase' | 'price_decrease';
  confidence_level: number;
  prediction_text: string;
  valid_until: string;
}

const FarmerDashboard = () => {
  const { profile, subscription } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    quantity: '',
    price_per_unit: '',
    location: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch user's products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', profile?.user_id)
        .order('created_at', { ascending: false });

      if (productsData) {
        const typedProducts = productsData.map(p => ({
          ...p,
          status: p.status as 'available' | 'reserved' | 'sold'
        }));
        setProducts(typedProducts);
      }

      // Fetch orders for user's products
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          *,
          buyer_profile:profiles!orders_buyer_id_fkey(name, phone),
          product:products(name, price_per_unit)
        `)
        .in('product_id', productsData?.map(p => p.id) || [])
        .order('created_at', { ascending: false });

      if (ordersData) setOrders(ordersData as any);

      // Fetch relevant market predictions
      const { data: predictionsData } = await supabase
        .from('market_predictions')
        .select('*')
        .gt('valid_until', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (predictionsData) {
        const typedPredictions = predictionsData.map(p => ({
          ...p,
          prediction_type: p.prediction_type as 'demand_increase' | 'demand_decrease' | 'price_increase' | 'price_decrease'
        }));
        setPredictions(typedPredictions);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProduct.name || !newProduct.quantity || !newProduct.price_per_unit || !newProduct.location) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.from('products').insert({
        user_id: profile?.user_id,
        name: newProduct.name,
        quantity: parseInt(newProduct.quantity),
        price_per_unit: parseInt(newProduct.price_per_unit) * 100, // Convert to kobo
        location: newProduct.location,
        description: newProduct.description
      });

      if (error) throw error;

      toast({
        title: "Produit ajouté !",
        description: "Votre produit est maintenant visible par les acheteurs",
      });

      // Reset form and refresh data
      setNewProduct({ name: '', quantity: '', price_per_unit: '', location: '', description: '' });
      fetchData();

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le produit",
        variant: "destructive"
      });
    }
  };

  const handleOrderResponse = async (orderId: string, status: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: status === 'accepted' ? "Commande acceptée" : "Commande refusée",
        description: "Le statut de la commande a été mis à jour",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour la commande",
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
            <p>Chargement de votre tableau de bord...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header with Subscription Status */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                  <Sprout className="w-8 h-8 text-agri-green" />
                  Tableau de bord Agriculteur
                </h1>
                <p className="text-muted-foreground mt-2">
                  Bienvenue {profile?.name}
                </p>
              </div>
            </div>
            
            {/* Subscription Status Card */}
            <Card className="mt-4 border-2 border-agri-green/20 bg-agri-green-light/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-agri-green animate-pulse"></div>
                    <div>
                      <p className="font-semibold text-agri-green">
                        📋 Plan {subscription?.plan_type === 'agriculteur' ? 'Agriculteur' : 'Acheteur'} - Abonnement annuel
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {subscription?.amount ? `${subscription.amount.toLocaleString()} F CFA/an` : '500 F CFA/an'}
                        {subscription?.current_period_end && (
                          <span className="ml-2">
                            • Expire le {new Date(subscription.current_period_end).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={subscription?.status === 'active' ? 'default' : 'secondary'}
                    className={subscription?.status === 'active' ? 'bg-agri-green' : 'bg-red-500'}
                  >
                    {subscription?.status === 'active' ? '✅ Actif' : '❌ Inactif'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Market Predictions */}
          <Card className="mb-8 border-2 border-agri-green/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-agri-green">
                <TrendingUp className="w-5 h-5" />
                Prévisions IA du marché
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {predictions.slice(0, 4).map((prediction) => (
                  <div key={prediction.id} className="p-4 bg-agri-green-light rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-agri-green" />
                      <span className="font-semibold text-sm">
                        {prediction.product_name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {prediction.confidence_level}% confiance
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {prediction.prediction_text}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Add Product */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Ajouter un produit
                </CardTitle>
                <CardDescription>
                  Ajoutez vos produits disponibles à la vente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div>
                    <Label>Nom du produit *</Label>
                    <Input
                      placeholder="ex: Maïs, Café, Cacao..."
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Quantité (kg) *</Label>
                      <Input
                        type="number"
                        placeholder="500"
                        value={newProduct.quantity}
                        onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Prix par kg (F CFA) *</Label>
                      <Input
                        type="number"
                        placeholder="300"
                        value={newProduct.price_per_unit}
                        onChange={(e) => setNewProduct({...newProduct, price_per_unit: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Localisation *</Label>
                    <Input
                      placeholder="ex: Yamoussoukro"
                      value={newProduct.location}
                      onChange={(e) => setNewProduct({...newProduct, location: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Décrivez votre produit..."
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    />
                  </div>

                  <Button type="submit" className="w-full bg-gradient-hero">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter le produit
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Orders Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Commandes reçues
                </CardTitle>
                <CardDescription>
                  Gérez les commandes de vos produits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {orders.map((order) => (
                    <div key={order.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{order.buyer_profile.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {order.product.name} - {order.quantity} kg
                          </p>
                          <p className="text-sm font-medium text-agri-green">
                            {(order.total_amount / 100).toLocaleString()} F CFA
                          </p>
                        </div>
                        <Badge 
                          variant={
                            order.status === 'pending' ? 'secondary' :
                            order.status === 'accepted' ? 'default' :
                            order.status === 'rejected' ? 'destructive' : 'outline'
                          }
                          className={order.status === 'accepted' ? 'bg-agri-green' : ''}
                        >
                          {order.status === 'pending' ? 'En attente' :
                           order.status === 'accepted' ? 'Acceptée' :
                           order.status === 'rejected' ? 'Refusée' : 'Terminée'}
                        </Badge>
                      </div>
                      
                      {order.message && (
                        <p className="text-sm text-muted-foreground mb-3">
                          Message: {order.message}
                        </p>
                      )}

                      {order.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleOrderResponse(order.id, 'accepted')}
                            className="bg-agri-green hover:bg-agri-green/90"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Accepter
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleOrderResponse(order.id, 'rejected')}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Refuser
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {orders.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Aucune commande reçue</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* My Products */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-agri-green" />
                Mes produits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div key={product.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{product.name}</h4>
                      <Badge 
                        variant={product.status === 'available' ? 'default' : 'secondary'}
                        className={product.status === 'available' ? 'bg-agri-green' : ''}
                      >
                        {product.status === 'available' ? 'Disponible' : 
                         product.status === 'reserved' ? 'Réservé' : 'Vendu'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>{product.quantity} {product.unit}</p>
                      <p className="font-medium text-agri-green">
                        {(product.price_per_unit / 100).toLocaleString()} F CFA/kg
                      </p>
                      <p className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {product.location}
                      </p>
                    </div>
                    
                    {product.description && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>
                ))}
                
                {products.length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    <Sprout className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun produit ajouté</p>
                    <p className="text-sm">Commencez par ajouter vos produits agricoles</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default FarmerDashboard;