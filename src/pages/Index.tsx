import React from 'react';
import Layout from '@/components/Layout';
import HeroSection from '@/components/HeroSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import SignupForm from '@/components/SignupForm';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <HowItWorksSection />
      <SignupForm />
    </Layout>
  );
};

export default Index;
