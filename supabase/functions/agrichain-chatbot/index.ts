import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AGRICHAIN_CONTEXT = `
Tu es l'assistant virtuel d'AgriChain+, une plateforme SaaS intelligente pour optimiser la chaîne d'approvisionnement agricole en Côte d'Ivoire.

## À propos d'AgriChain+

AgriChain+ est une plateforme payante qui connecte les agriculteurs et les acheteurs grâce à l'intelligence artificielle. 

### Fonctionnalités principales :
1. **Matching intelligent** : Connecte automatiquement agriculteurs et acheteurs
2. **Prévisions IA** : Prédit la demande et les prix des produits agricoles
3. **Gestion des stocks** : Suivi en temps réel des produits disponibles
4. **Système de commandes** : Processus de commande simplifié avec acceptation/refus
5. **Abonnements payants** : Accès premium aux fonctionnalités avancées

### Plans d'abonnement :
- **Plan Agriculteur** : 500 F CFA/mois
  - Publication de produits
  - Prévisions IA du marché
  - Gestion des commandes
  - Outils d'analyse des ventes

- **Plan Acheteur** : 1000 F CFA/mois
  - Recherche de produits agricoles
  - Contact direct avec agriculteurs
  - Historique des commandes
  - Support client prioritaire

### Rôles utilisateurs :
- **Administrateur** : Gestion complète, stats, prévisions IA
- **Agriculteur** : Vente de produits, gestion des stocks, commandes
- **Acheteur** : Recherche et achat de produits agricoles

### Paiements :
- Intégration Paystack sécurisée
- Paiement en F CFA (Franc CFA)
- Abonnement mensuel renouvelable

### Support :
- WhatsApp : +225 05 66 99 77 85
- Email : support@agrichain.com

Ton rôle est d'aider les utilisateurs à comprendre et utiliser la plateforme selon leur contexte actuel.
`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    // Get authenticated user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    let userContext = "Visiteur non connecté";
    let userRole = "visiteur";

    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const { data } = await supabaseClient.auth.getUser(token);
        
        if (data.user) {
          // Get user profile
          const { data: profile } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('user_id', data.user.id)
            .maybeSingle();

          if (profile) {
            userContext = `Utilisateur connecté : ${profile.name} (${profile.role})`;
            userRole = profile.role;
          }
        }
      } catch (error) {
        console.log('User not authenticated or invalid token');
      }
    }

    const { message, currentPage, pageContext } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    // Build context-aware system prompt
    let contextualPrompt = AGRICHAIN_CONTEXT;
    
    contextualPrompt += `\n\n## Contexte actuel :\n`;
    contextualPrompt += `- Utilisateur : ${userContext}\n`;
    contextualPrompt += `- Page actuelle : ${currentPage || 'Page inconnue'}\n`;
    
    if (pageContext) {
      contextualPrompt += `- Contexte de la page : ${pageContext}\n`;
    }

    // Add page-specific guidance
    switch (currentPage) {
      case '/':
        contextualPrompt += `\n## Tu es sur la page d'accueil. Aide l'utilisateur à :
        - Comprendre les avantages d'AgriChain+
        - Choisir entre le rôle agriculteur ou acheteur
        - S'inscrire sur la plateforme
        - Découvrir les fonctionnalités principales`;
        break;
        
      case '/auth':
        contextualPrompt += `\n## Tu es sur la page d'authentification. Aide l'utilisateur à :
        - Créer un compte (inscription)
        - Se connecter à son compte existant
        - Choisir le bon rôle (agriculteur/acheteur)
        - Comprendre les avantages de chaque plan`;
        break;
        
      case '/subscription':
        contextualPrompt += `\n## Tu es sur la page d'abonnement. Aide l'utilisateur à :
        - Comprendre les différences entre les plans
        - Choisir le plan adapté à ses besoins
        - Effectuer le paiement via Paystack
        - Gérer son abonnement existant`;
        break;
        
      case '/dashboard':
        if (userRole === 'admin') {
          contextualPrompt += `\n## Tu es sur le tableau de bord administrateur. Aide l'utilisateur à :
          - Gérer les utilisateurs et abonnements
          - Créer des prévisions IA pour les marchés
          - Analyser les statistiques de la plateforme
          - Suspendre ou réactiver des comptes`;
        } else if (userRole === 'agriculteur') {
          contextualPrompt += `\n## Tu es sur le tableau de bord agriculteur. Aide l'utilisateur à :
          - Ajouter et gérer ses produits agricoles
          - Comprendre les prévisions IA du marché
          - Gérer les commandes reçues (accepter/refuser)
          - Optimiser ses ventes`;
        } else if (userRole === 'acheteur') {
          contextualPrompt += `\n## Tu es sur le tableau de bord acheteur. Aide l'utilisateur à :
          - Rechercher des produits agricoles
          - Passer des commandes aux agriculteurs
          - Suivre l'état de ses commandes
          - Contacter les agriculteurs`;
        }
        break;
        
      default:
        contextualPrompt += `\n## Page générale. Aide l'utilisateur avec toutes les questions sur AgriChain+`;
    }

    contextualPrompt += `\n\n## Instructions :
    - Réponds UNIQUEMENT en français
    - Sois précis et utile selon le contexte
    - Si l'utilisateur n'est pas connecté et pose des questions sur le dashboard, invite-le à s'inscrire
    - Encourage l'utilisation des fonctionnalités payantes
    - Donne des conseils pratiques pour l'agriculture en Côte d'Ivoire
    - Si tu ne connais pas une information, oriente vers le support WhatsApp
    - Utilise des émojis pour rendre les réponses plus conviviales`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { 
            role: 'system', 
            content: contextualPrompt
          },
          { 
            role: 'user', 
            content: message 
          }
        ],
        max_completion_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const botResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        response: botResponse,
        context: {
          page: currentPage,
          userRole: userRole,
          timestamp: new Date().toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in agrichain-chatbot function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erreur interne du serveur',
        fallbackResponse: 'Désolé, je rencontre une difficulté technique. Contactez notre support WhatsApp au +225 05 66 99 77 85 pour une assistance immédiate. 📱'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});