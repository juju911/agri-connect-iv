import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Create Paystack subscription function started');
    
    // Get authenticated user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Header d'autorisation manquant");
    }

    const token = authHeader.replace("Bearer ", "");
    console.log('Token extracted, getting user...');
    
    const { data, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError) {
      console.error('Auth error:', authError);
      throw new Error("Erreur d'authentification: " + authError.message);
    }
    
    const user = data.user;

    if (!user?.email) {
      throw new Error("Utilisateur non authentifié");
    }

    console.log('User authenticated:', user.email);

    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Profile error:', profileError);
      throw new Error("Erreur lors de la récupération du profil: " + profileError.message);
    }

    if (!profile) {
      console.error('No profile found for user:', user.id);
      throw new Error("Profil utilisateur non trouvé. Veuillez vous reconnecter.");
    }

    console.log('Profile found:', profile.role);

    const { plan_type, amount } = await req.json();
    
    if (!plan_type || !amount) {
      throw new Error("Type de plan et montant requis");
    }

    // Convert from F CFA to kobo (CFA centimes)
    const amountInKobo = amount * 100;

    // Generate unique reference
    const reference = `agrichain_${user.id}_${Date.now()}`;

    // Initialize Paystack transaction
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PAYSTACK_SECRET_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount: amountInKobo,
        reference: reference,
        currency: 'XOF', // West African CFA franc
        callback_url: `${req.headers.get('origin')}/payment-success?reference=${reference}`,
        metadata: {
          user_id: user.id,
          plan_type: plan_type,
          user_name: profile.name,
          user_phone: profile.phone
        }
      }),
    });

    if (!paystackResponse.ok) {
      const errorData = await paystackResponse.text();
      console.error('Paystack API error:', errorData);
      throw new Error('Erreur lors de l\'initialisation du paiement Paystack');
    }

    const paystackData: PaystackInitializeResponse = await paystackResponse.json();

    if (!paystackData.status) {
      throw new Error(paystackData.message || 'Échec de l\'initialisation Paystack');
    }

    // Create pending subscription record
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    await supabaseService.from('subscriptions').insert({
      user_id: user.id,
      plan_type: plan_type,
      amount: amountInKobo,
      status: 'pending',
      paystack_subscription_id: reference
    });

    return new Response(
      JSON.stringify({
        authorization_url: paystackData.data.authorization_url,
        reference: reference
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in create-paystack-subscription:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erreur interne du serveur' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});