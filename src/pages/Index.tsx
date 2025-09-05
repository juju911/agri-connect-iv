import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import HeroSection from '@/components/HeroSection';
import HowItWorksSection from '@/components/HowItWorksSection';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <HowItWorksSection />
      
      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Prêt à transformer votre activité agricole ?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d'agriculteurs et d'acheteurs qui utilisent AgriChain+ pour optimiser leur chaîne d'approvisionnement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/auth"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-agri-green font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Commencer
            </Link>
            <Link 
              to="/auth"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-agri-green transition-colors"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
