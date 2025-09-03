import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Package, Users, ArrowRight } from 'lucide-react';
import logisticsIcon from '@/assets/logistics-icon.jpg';
import dataAnalytics from '@/assets/data-analytics.jpg';

const HowItWorksSection = () => {
  const steps = [
    {
      id: 1,
      icon: TrendingUp,
      title: "Prévoir la demande",
      description: "Notre IA analyse les tendances du marché et prédit la demande pour vos cultures.",
      image: dataAnalytics,
      color: "text-agri-green",
      bgColor: "bg-agri-green-light"
    },
    {
      id: 2,
      icon: Package,
      title: "Gérer les stocks",
      description: "Optimisez vos récoltes et réduisez les pertes grâce à une gestion intelligente.",
      image: logisticsIcon,
      color: "text-agri-orange",
      bgColor: "bg-agri-orange-light"
    },
    {
      id: 3,
      icon: Users,
      title: "Trouver les acheteurs",
      description: "Connectez-vous directement avec les acheteurs intéressés par vos produits.",
      image: logisticsIcon,
      color: "text-primary",
      bgColor: "bg-primary/10"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Trois étapes simples pour transformer votre activité agricole
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              <Card className="h-full border-2 border-border hover:shadow-card transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-8">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-8 w-8 h-8 rounded-full bg-gradient-hero text-white flex items-center justify-center font-bold text-sm">
                    {step.id}
                  </div>
                  
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl ${step.bgColor} flex items-center justify-center mb-6 mt-4`}>
                    <step.icon className={`w-8 h-8 ${step.color}`} />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {step.description}
                  </p>
                  
                  {/* Image */}
                  <div className="aspect-video rounded-lg overflow-hidden mb-4">
                    <img 
                      src={step.image} 
                      alt={step.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Arrow between steps (hidden on mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-8 h-8 text-muted-foreground/50" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-hero text-white rounded-full font-medium">
            <span>Prêt à commencer ?</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;