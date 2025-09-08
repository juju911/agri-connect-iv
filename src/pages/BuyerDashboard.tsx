import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  Search, 
  Package,
  MapPin,
  Phone,
  ShoppingCart,
  CheckCircle,
  Clock,
  XCircle
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
  user_profile: {
    name: string;
    phone?: string;
  };
}

interface Order {
  id: string;
  quantity: number;
  total_amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  message?: string;
  created_at: string;
  product: {
    name: string;
    price_per_unit: number;
    user_profile: {
      name: string;
    };
  };
}

const BuyerDashboard = () => {
  const { profile, subscription } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderForm, setOrderForm] = useState({
    quantity: '',
    message: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch available products from subscribed farmers
      const { data: productsData } = await supabase
        .from('products')
        .select(`
          *,
          user_profile:profiles!products_user_id_fkey(name, phone)
        `)
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (productsData) {
        const typedProducts = productsData.map(p => ({
          ...p,
          status: p.status as 'available' | 'reserved' | 'sold'
        }));
        setProducts(typedProducts as any);
      }

      // Fetch user's orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          *,
          product:products(
            name, 
            price_per_unit,
            user_profile:profiles!products_user_id_fkey(name)
          )
        `)
        .eq('buyer_id', profile?.user_id)
        .order('created_at', { ascending: false });

      if (ordersData) setOrders(ordersData as any);

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

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.user_profile.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct || !orderForm.quantity) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const quantity = parseInt(orderForm.quantity);
    if (quantity > selectedProduct.quantity) {
      toast({
        title: "Erreur",
        description: "Quantité demandée supérieure au stock disponible",
        variant: "destructive"
      });
      return;
    }

    try {
      const totalAmount = quantity * selectedProduct.price_per_unit;
      
      const { error } = await supabase.from('orders').insert({
        buyer_id: profile?.user_id,
        product_id: selectedProduct.id,
        quantity: quantity,
        total_amount: totalAmount,
        message: orderForm.message || null
      });

      if (error) throw error;

      toast({
        title: "Commande passée !",
        description: "Votre commande a été envoyée à l'agriculteur",
      });

      // Reset form and close modal
      setOrderForm({ quantity: '', message: '' });
      setSelectedProduct(null);
      fetchData();

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de passer la commande",
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
                  <Users className="w-8 h-8 text-agri-orange" />
                  Tableau de bord Acheteur
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
                        📋 Plan {subscription?.plan_type === 'acheteur' ? 'Acheteur' : 'Agriculteur'} - Abonnement annuel
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {subscription?.amount ? `${subscription.amount.toLocaleString()} F CFA/an` : '1000 F CFA/an'}
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

          {/* Search */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Rechercher des produits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="Rechercher par produit, localisation ou agriculteur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button className="bg-gradient-hero">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Available Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-agri-green">
                  <Package className="w-5 h-5" />
                  Produits disponibles
                </CardTitle>
                <CardDescription>
                  {filteredProducts.length} produits trouvés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="p-4 border rounded-lg border-agri-green/20 bg-agri-green-light/20">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold flex items-center gap-2">
                            {product.name}
                            <CheckCircle className="w-4 h-4 text-agri-green" />
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {product.quantity} {product.unit} disponibles
                          </p>
                          <p className="text-lg font-semibold text-agri-green">
                            {(product.price_per_unit / 100).toLocaleString()} F CFA/kg
                          </p>
                        </div>
                        <Badge className="bg-agri-green">
                          Disponible
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          {product.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-3 h-3" />
                          {product.user_profile.name}
                        </div>
                        {product.user_profile.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3" />
                            {product.user_profile.phone}
                          </div>
                        )}
                      </div>
                      
                      {product.description && (
                        <p className="text-sm text-muted-foreground mb-4">
                          {product.description}
                        </p>
                      )}
                      
                      <Button 
                        className="w-full bg-gradient-hero"
                        onClick={() => setSelectedProduct(product)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Commander
                      </Button>
                    </div>
                  ))}
                  
                  {filteredProducts.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Aucun produit trouvé</p>
                      <p className="text-sm">Essayez d'autres termes de recherche</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* My Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Mes commandes
                </CardTitle>
                <CardDescription>
                  Suivi de vos commandes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {orders.map((order) => (
                    <div key={order.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{order.product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Chez {order.product.user_profile.name}
                          </p>
                          <p className="text-sm">
                            {order.quantity} kg • {(order.total_amount / 100).toLocaleString()} F CFA
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
                          {order.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                          {order.status === 'accepted' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {order.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                          {order.status === 'pending' ? 'En attente' :
                           order.status === 'accepted' ? 'Acceptée' :
                           order.status === 'rejected' ? 'Refusée' : 'Terminée'}
                        </Badge>
                      </div>
                      
                      {order.message && (
                        <p className="text-sm text-muted-foreground">
                          Message: {order.message}
                        </p>
                      )}
                      
                      <p className="text-xs text-muted-foreground mt-2">
                        Commandé le {new Date(order.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  ))}
                  
                  {orders.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Aucune commande passée</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Modal */}
          {selectedProduct && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Commander {selectedProduct.name}</CardTitle>
                  <CardDescription>
                    Chez {selectedProduct.user_profile.name} • {selectedProduct.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePlaceOrder} className="space-y-4">
                    <div>
                      <Label>Quantité (kg) *</Label>
                      <Input
                        type="number"
                        placeholder={`Max: ${selectedProduct.quantity} kg`}
                        value={orderForm.quantity}
                        onChange={(e) => setOrderForm({...orderForm, quantity: e.target.value})}
                        max={selectedProduct.quantity}
                        min="1"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Prix: {(selectedProduct.price_per_unit / 100).toLocaleString()} F CFA/kg
                      </p>
                    </div>

                    <div>
                      <Label>Message (optionnel)</Label>
                      <Textarea
                        placeholder="Message pour l'agriculteur..."
                        value={orderForm.message}
                        onChange={(e) => setOrderForm({...orderForm, message: e.target.value})}
                      />
                    </div>

                    {orderForm.quantity && (
                      <div className="p-3 bg-agri-green-light rounded-lg">
                        <p className="font-semibold">
                          Total: {((parseInt(orderForm.quantity) || 0) * selectedProduct.price_per_unit / 100).toLocaleString()} F CFA
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setSelectedProduct(null)}
                        className="flex-1"
                      >
                        Annuler
                      </Button>
                      <Button type="submit" className="flex-1 bg-gradient-hero">
                        Confirmer la commande
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BuyerDashboard;