import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Sprout, Phone, Mail, User, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    role: 'agriculteur'
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulation d'envoi (à remplacer par l'intégration Supabase)
    console.log('Données du formulaire:', formData);
    
    // Afficher un toast de succès
    toast({
      title: "Inscription réussie !",
      description: "Nous vous contacterons bientôt pour configurer votre compte.",
    });
    
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        nom: '',
        email: '',
        telephone: '',
        role: 'agriculteur'
      });
    }, 3000);
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-hero border-2 border-agri-green/20">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-agri-green-light rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-agri-green" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Merci pour votre inscription !
          </h3>
          <p className="text-muted-foreground mb-6">
            Notre équipe vous contactera dans les 24h pour configurer votre compte AgriChain+.
          </p>
          <div className="text-sm text-agri-green font-medium">
            Vérifiez votre email pour plus d'informations
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Rejoignez AgriChain+
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Inscrivez-vous gratuitement et transformez votre activité agricole dès aujourd'hui
          </p>
        </div>

        <Card className="w-full max-w-md mx-auto shadow-hero border-2 border-agri-green/20">
          <CardHeader className="text-center pb-4">
            <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Créer un compte</CardTitle>
            <CardDescription>
              Commencez votre transformation numérique agricole
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nom */}
              <div className="space-y-2">
                <Label htmlFor="nom" className="text-sm font-medium flex items-center">
                  <User className="w-4 h-4 mr-2 text-muted-foreground" />
                  Nom complet
                </Label>
                <Input
                  id="nom"
                  type="text"
                  placeholder="Votre nom complet"
                  value={formData.nom}
                  onChange={(e) => handleChange('nom', e.target.value)}
                  required
                  className="transition-all focus:ring-2 focus:ring-agri-green/20"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  className="transition-all focus:ring-2 focus:ring-agri-green/20"
                />
              </div>

              {/* Téléphone */}
              <div className="space-y-2">
                <Label htmlFor="telephone" className="text-sm font-medium flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                  Téléphone
                </Label>
                <Input
                  id="telephone"
                  type="tel"
                  placeholder="+225 XX XX XX XX"
                  value={formData.telephone}
                  onChange={(e) => handleChange('telephone', e.target.value)}
                  required
                  className="transition-all focus:ring-2 focus:ring-agri-green/20"
                />
              </div>

              {/* Rôle */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Vous êtes :</Label>
                <RadioGroup
                  value={formData.role}
                  onValueChange={(value) => handleChange('role', value)}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="agriculteur" id="agriculteur" />
                    <Label htmlFor="agriculteur" className="text-sm cursor-pointer">
                      Agriculteur
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="acheteur" id="acheteur" />
                    <Label htmlFor="acheteur" className="text-sm cursor-pointer">
                      Acheteur
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-hero hover:opacity-90 text-white font-medium py-3"
                size="lg"
              >
                Créer mon compte gratuitement
              </Button>

              {/* Terms */}
              <p className="text-xs text-center text-muted-foreground mt-4">
                En vous inscrivant, vous acceptez nos{' '}
                <a href="#" className="text-agri-green hover:underline">
                  conditions d'utilisation
                </a>{' '}
                et notre{' '}
                <a href="#" className="text-agri-green hover:underline">
                  politique de confidentialité
                </a>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default SignupForm;