import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Users, Bed } from 'lucide-react';
import { cn } from '@/lib/utils';
import SearchBar from './SearchBar';

const HeroSection: React.FC = () => {
  const [searchActive, setSearchActive] = useState(false);

  return (
    <section className="relative h-screen flex items-end justify-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1496307653780-42ee777d4833?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          alt="Hotel Vitória"
          className="w-full h-full object-cover object-center animate-blur-in"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center mb-32 px-4 w-full max-w-4xl mx-auto animate-stagger">
        <div className="animate-fade-up opacity-0">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4 text-gray-900 dark:text-white">
            Hotel Vitória
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-900 dark:text-white">
            Um refúgio de luxo onde cada detalhe é pensado para proporcionar momentos inesquecíveis
          </p>
        </div>
      </div>

      {/* Search bar */}
      <SearchBar />
    </section>
  );
};

export default HeroSection;
