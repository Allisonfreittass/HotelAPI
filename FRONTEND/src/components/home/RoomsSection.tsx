import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Tv, Wifi, Bath, Wind } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReservationDialog from '../reservation/ReservationDialog';
import RoomsDisplayDialog from '../rooms/RoomsDisplayDialog';

// Importar imagens locais
import solteiroDuploImage from './images/solteiro-duplo.jpeg';
import casalImage from './images/casal.jpeg';

interface RoomProps {
  image: string;
  title: string;
  description: string;
  price: number;
  capacity: number;
  features: string[];
  delay: number;
}

const Room: React.FC<RoomProps> = ({ image, title, description, price, capacity, features, delay }) => {
  return (
    <div 
      className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 animate-fade-up opacity-0 bg-white dark:bg-hotel-900 border border-hotel-100 dark:border-hotel-800"
      style={{ animationDelay: `${delay * 0.1}s` }}
    >
      <div className="relative overflow-hidden h-60">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
        />
        <div className="absolute top-3 right-3 bg-hotel-800/90 text-white px-3 py-1 rounded-full text-sm font-medium">
          R$ {price}/noite
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center text-hotel-600 dark:text-hotel-400 mb-2">
          <Users size={16} className="mr-1" />
          <span className="text-sm">Até {capacity} pessoas</span>
        </div>
        <h3 className="text-xl font-semibold mb-2 text-hotel-800 dark:text-hotel-200">{title}</h3>
        <p className="text-hotel-600 dark:text-hotel-400 text-sm mb-4">{description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {features.map((feature, index) => (
            <span 
              key={index} 
              className="inline-flex items-center bg-hotel-50 dark:bg-hotel-800 text-hotel-700 dark:text-hotel-300 text-xs px-2 py-1 rounded-md"
            >
              {feature === 'TV' && <Tv size={12} className="mr-1" />}
              {feature === 'Wi-Fi' && <Wifi size={12} className="mr-1" />}
              {feature === 'Banheira' && <Bath size={12} className="mr-1" />}
              {feature === 'Ar-condicionado' && <Wind size={12} className="mr-1" />}
              {feature}
            </span>
          ))}
        </div>
        
        <ReservationDialog
          trigger={
            <Button 
              variant="outline" 
              className="w-full mt-2 border-hotel-300 dark:border-hotel-700 text-hotel-800 dark:text-hotel-200 hover:bg-hotel-50 dark:hover:bg-hotel-800"
            >
              Ver Detalhes <ArrowRight size={16} className="ml-1" />
            </Button>
          }
        />
      </div>
    </div>
  );
};

const RoomsSection: React.FC = () => {
  const [showRoomsDialog, setShowRoomsDialog] = useState(false);
  
  const rooms = [
    {
      image: solteiroDuploImage, // Usar imagem local
      title: "Solteiro",
      description: "Quarto confortável com cama de solteiro e banheiro privativo.",
      price: 110,
      capacity: 1,
      features: ["Wi-Fi", "TV", "Frigobar"]
    },
    {
      image: solteiroDuploImage, // Usar imagem local
      title: "Solteiro com Ar Condicionado",
      description: "Quarto individual com ar-condicionado e janela com vista para o jardim.",
      price: 150,
      capacity: 1,
      features: ["Wi-Fi", "TV", "Frigobar", "Ar-condicionado"]
    },
    {
      image: casalImage, // Usar imagem local
      title: "Casal",
      description: "Quarto espaçoso com cama de casal e amenidades para um casal.",
      price: 190,
      capacity: 2,
      features: ["Wi-Fi", "TV", "Frigobar", "Chuveiro duplo"]
    },
    {
      image: casalImage, // Usar imagem local
      title: "Casal com Ar Condicionado",
      description: "Quarto de casal premium com ar-condicionado e vista panorâmica.",
      price: 220,
      capacity: 2,
      features: ["Wi-Fi", "TV 4K", "Minibar", "Ar-condicionado"]
    },
  ];

  return (
    <section className="py-20">
      <div className="section-container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
          <div className="animate-fade-up opacity-0">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-hotel-800 dark:text-hotel-200">
              Acomodações
            </h2>
            <p className="text-hotel-600 dark:text-hotel-400 max-w-xl">
              Escolha entre nossos quartos e suítes cuidadosamente decorados para uma estadia perfeita.
            </p>
          </div>
          <Button 
            className="mt-4 md:mt-0 bg-hotel-800 hover:bg-hotel-700 text-white animate-fade-up opacity-0"
            style={{ animationDelay: '0.2s' }}
            onClick={() => setShowRoomsDialog(true)}
          >
            Ver Todas as Acomodações <ArrowRight size={16} className="ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {rooms.map((room, index) => (
            <Room 
              key={index}
              image={room.image}
              title={room.title}
              description={room.description}
              price={room.price}
              capacity={room.capacity}
              features={room.features}
              delay={index + 1}
            />
          ))}
        </div>
      </div>
      
      {/* Dialog for displaying all rooms */}
      <RoomsDisplayDialog 
        open={showRoomsDialog} 
        onOpenChange={setShowRoomsDialog} 
      />
    </section>
  );
};

export default RoomsSection;
