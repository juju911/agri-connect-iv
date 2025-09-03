import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Sprout, 
  Package, 
  Users, 
  TrendingUp, 
  MapPin, 
  Phone, 
  Mail,
  Plus,
  Search,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';

interface Produit {
  id: string;
  nom: string;
  quantite: number;
  unite: string;
  localisation: string;
  prix: number;
  agriculteur: string;
  telephone: string;
  status: 'disponible' | 'reserve';
}

interface Demande {
  id: string;
  produit: string;
  quantite: number;
  prix_max: number;
  acheteur: string;
  telephone: string;
  localisation: string;
  status: 'active' | 'satisfaite';
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('agriculteur');
  const { toast } = useToast();

  // États pour les agriculteurs
  const [produits, setProduits] = useState<Produit[]>([
    {
      id: '1',
      nom: 'Maïs',
      quantite: 500,
      unite: 'kg',
      localisation: 'Yamoussoukro',
      prix: 300,
      agriculteur: 'Kouassi Yao',
      telephone: '+225 07 XX XX XX',
      status: 'disponible'
    },
    {
      id: '2',
      nom: 'Café',
      quantite: 200,
      unite: 'kg',
      localisation: 'Daloa',
      prix: 800,
      agriculteur: 'Adjoua Marie',
      telephone: '+225 05 XX XX XX',
      status: 'reserve'
    }
  ]);

  const [nouvelleCulture, setNouvelleCulture] = useState({
    nom: '',
    quantite: '',
    localisation: '',
    prix: ''
  });

  // États pour les acheteurs  
  const [demandes, setDemandes] = useState<Demande[]>([
    {
      id: '1',
      produit: 'Cacao',
      quantite: 1000,
      prix_max: 1200,
      acheteur: 'COPACI SA',
      telephone: '+225 27 XX XX XX',
      localisation: 'Abidjan',
      status: 'active'
    }
  ]);

  const [rechercheTerme, setRechercheTerme] = useState('');

  const handleAjouterCulture = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nouvelleCulture.nom || !nouvelleCulture.quantite || !nouvelleCulture.localisation || !nouvelleCulture.prix) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    const nouveauProduit: Produit = {
      id: Date.now().toString(),
      nom: nouvelleCulture.nom,
      quantite: Number(nouvelleCulture.quantite),
      unite: 'kg',
      localisation: nouvelleCulture.localisation,
      prix: Number(nouvelleCulture.prix),
      agriculteur: 'Votre nom', // À remplacer par l'utilisateur connecté
      telephone: '+225 XX XX XX XX', // À remplacer par le téléphone de l'utilisateur
      status: 'disponible'
    };

    setProduits([...produits, nouveauProduit]);
    setNouvelleCulture({ nom: '', quantite: '', localisation: '', prix: '' });
    
    toast({
      title: "Culture ajoutée !",
      description: "Votre produit est maintenant visible par les acheteurs.",
    });
  };

  const produitsAffiches = produits.filter(p => 
    p.nom.toLowerCase().includes(rechercheTerme.toLowerCase()) ||
    p.localisation.toLowerCase().includes(rechercheTerme.toLowerCase())
  );

  return (
    <Layout>
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Tableau de bord AgriChain+
            </h1>
            <p className="text-muted-foreground">
              Gérez vos cultures ou trouvez des produits agricoles
            </p>
          </div>

          {/* Mode Selection */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
              <TabsTrigger value="agriculteur" className="flex items-center gap-2">
                <Sprout className="w-4 h-4" />
                Agriculteur
              </TabsTrigger>
              <TabsTrigger value="acheteur" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Acheteur
              </TabsTrigger>
            </TabsList>

            {/* Vue Agriculteur */}
            <TabsContent value="agriculteur" className="space-y-8">
              {/* Prévisions IA */}
              <Card className="border-2 border-agri-green/20 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-agri-green">
                    <TrendingUp className="w-5 h-5" />
                    Prévisions IA du marché
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-agri-green-light rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-5 h-5 text-agri-green" />
                        <span className="font-semibold">Forte demande prévue</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Le maïs aura une forte demande le mois prochain (+35%)
                      </p>
                      <Badge variant="secondary" className="bg-agri-green text-white">
                        Recommandé
                      </Badge>
                    </div>
                    <div className="p-4 bg-agri-orange-light rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-5 h-5 text-agri-orange" />
                        <span className="font-semibold">Prix en hausse</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Le café devrait voir ses prix augmenter de 15%
                      </p>
                      <Badge variant="outline" className="border-agri-orange text-agri-orange">
                        Opportunité
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ajouter une culture */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Ajouter une culture
                  </CardTitle>
                  <CardDescription>
                    Ajoutez vos produits disponibles à la vente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAjouterCulture} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nom">Nom du produit</Label>
                        <Input
                          id="nom"
                          placeholder="ex: Maïs, Café, Cacao..."
                          value={nouvelleCulture.nom}
                          onChange={(e) => setNouvelleCulture({...nouvelleCulture, nom: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="quantite">Quantité (kg)</Label>
                        <Input
                          id="quantite"
                          type="number"
                          placeholder="500"
                          value={nouvelleCulture.quantite}
                          onChange={(e) => setNouvelleCulture({...nouvelleCulture, quantite: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="localisation">Localisation</Label>
                        <Input
                          id="localisation"
                          placeholder="ex: Yamoussoukro"
                          value={nouvelleCulture.localisation}
                          onChange={(e) => setNouvelleCulture({...nouvelleCulture, localisation: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="prix">Prix par kg (FCFA)</Label>
                        <Input
                          id="prix"
                          type="number"
                          placeholder="300"
                          value={nouvelleCulture.prix}
                          onChange={(e) => setNouvelleCulture({...nouvelleCulture, prix: e.target.value})}
                        />
                      </div>
                    </div>
                    <Button type="submit" className="bg-gradient-hero">
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter le produit
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Acheteurs potentiels */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-agri-orange">
                    <Users className="w-5 h-5" />
                    Acheteurs intéressés
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {demandes.map((demande) => (
                      <div key={demande.id} className="p-4 border rounded-lg border-agri-orange/20 bg-agri-orange-light/20">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{demande.acheteur}</h4>
                            <p className="text-sm text-muted-foreground">
                              Recherche: {demande.produit} - {demande.quantite}kg
                            </p>
                            <p className="text-sm text-agri-orange font-medium">
                              Prix max: {demande.prix_max} FCFA/kg
                            </p>
                          </div>
                          <Button size="sm" variant="outline" className="border-agri-orange text-agri-orange">
                            Contacter
                          </Button>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {demande.localisation}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {demande.telephone}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Vue Acheteur */}
            <TabsContent value="acheteur" className="space-y-8">
              {/* Recherche */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Rechercher des produits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Input
                      placeholder="Rechercher par produit ou localisation..."
                      value={rechercheTerme}
                      onChange={(e) => setRechercheTerme(e.target.value)}
                      className="flex-1"
                    />
                    <Button className="bg-gradient-hero">
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Produits disponibles */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-agri-green">
                    <Package className="w-5 h-5" />
                    Produits disponibles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {produitsAffiches.map((produit) => (
                      <div key={produit.id} className="p-4 border rounded-lg border-agri-green/20 bg-agri-green-light/20">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold flex items-center gap-2">
                              {produit.nom}
                              {produit.status === 'disponible' ? (
                                <CheckCircle className="w-4 h-4 text-agri-green" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-agri-orange" />
                              )}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {produit.quantite} {produit.unite} disponibles
                            </p>
                            <p className="text-lg font-semibold text-agri-green">
                              {produit.prix} FCFA/kg
                            </p>
                          </div>
                          <Badge 
                            variant={produit.status === 'disponible' ? 'default' : 'secondary'}
                            className={produit.status === 'disponible' ? 'bg-agri-green' : ''}
                          >
                            {produit.status === 'disponible' ? 'Disponible' : 'Réservé'}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            {produit.localisation}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-3 h-3" />
                            {produit.agriculteur}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3" />
                            {produit.telephone}
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full" 
                          disabled={produit.status !== 'disponible'}
                          variant={produit.status === 'disponible' ? 'default' : 'secondary'}
                        >
                          {produit.status === 'disponible' ? 'Contacter l\'agriculteur' : 'Non disponible'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;