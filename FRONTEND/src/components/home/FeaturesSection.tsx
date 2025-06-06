import React from 'react';
import { Utensils, Wifi, CarFront, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const Feature: React.FC<FeatureProps> = ({ icon, title, description, delay }) => {
  return (
    <div 
      className="bg-white dark:bg-brand-dark p-6 rounded-xl shadow-sm border border-brand-accent/30 hover:shadow-md transition-all duration-300 group animate-fade-up opacity-0"
      style={{ animationDelay: `${delay * 0.1}s` }}
    >
      <div className="w-12 h-12 bg-brand-accent/20 dark:bg-brand-accent/30 rounded-full flex items-center justify-center text-brand-dark mb-4 group-hover:bg-brand-accent/30 dark:group-hover:bg-brand-accent/40 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2 text-brand-dark dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
};

const FeaturesSection: React.FC = () => {
  const features = [
    { 
      icon: <Utensils size={24} />, 
      title: 'Café da Manhã', 
      description: 'Buffet matinal completo com opções internacionais e especialidades locais das 6h às 09h.'
    },
    { 
      icon: <Wifi size={24} />, 
      title: 'Wi-Fi de Alta Velocidade', 
      description: 'Conexão gratuita em todas as áreas do hotel para sua conveniência.'
    },
    { 
      icon: <CarFront size={24} />, 
      title: 'Estacionamento', 
      description: 'Estacionamento seguro para seu veículo.'
    },
    { 
      icon: <Clock size={24} />, 
      title: 'Recepção 24h', 
      description: 'Atendimento personalizado a qualquer hora do dia ou da noite.'
    },
  ];

  return (
    <section className="py-20 bg-brand-dark dark:bg-brand-dark text-white">
      <div className="section-container">
        <div className="text-center mb-16 animate-fade-up opacity-0">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Comodidades Exclusivas
          </h2>
          <p className="text-brand-accent max-w-xl mx-auto">
            Cada aspecto do Hotel Vitória foi cuidadosamente pensado para proporcionar uma experiência excepcional aos nossos hóspedes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Feature 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index + 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
