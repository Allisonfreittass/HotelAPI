import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Users, Bed } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReservationDialog from '../reservation/ReservationDialog'; // Assumindo que isso será usado no futuro para a reserva

const SearchBar: React.FC = () => {
  const [searchActive, setSearchActive] = useState(false);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20">
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <div 
          className={cn(
            "bg-brand-dark/90 backdrop-blur-lg rounded-xl shadow-xl transition-all duration-500 overflow-hidden",
            searchActive ? "p-6" : "p-4"
          )}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              className="bg-brand-accent/20 p-4 rounded-lg cursor-pointer hover:bg-brand-accent/30 transition-colors"
              onClick={() => setSearchActive(true)}
            >
              <div className="flex items-center text-white">
                <CalendarIcon className="mr-2 h-5 w-5 text-brand-accent" />
                <div>
                  <p className="text-sm font-medium">Check-in / Check-out</p>
                  <p className="text-xs text-white/80">Selecione as datas</p>
                </div>
              </div>
            </div>

            <div 
              className="bg-brand-accent/20 p-4 rounded-lg cursor-pointer hover:bg-brand-accent/30 transition-colors"
              onClick={() => setSearchActive(true)}
            >
              <div className="flex items-center text-white">
                <Users className="mr-2 h-5 w-5 text-brand-accent" />
                <div>
                  <p className="text-sm font-medium">Hóspedes</p>
                  <p className="text-xs text-white/80">Adultos, crianças</p>
                </div>
              </div>
            </div>

            <div 
              className="bg-brand-accent/20 p-4 rounded-lg cursor-pointer hover:bg-brand-accent/30 transition-colors"
              onClick={() => setSearchActive(true)}
            >
              <div className="flex items-center text-white">
                <Bed className="mr-2 h-5 w-5 text-brand-accent" />
                <div>
                  <p className="text-sm font-medium">Tipo de Quarto</p>
                  <p className="text-xs text-white/80">Suite, Standard, etc.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar; 