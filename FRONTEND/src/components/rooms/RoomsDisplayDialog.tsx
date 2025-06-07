import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Users, Tv, Wifi, Bath, Wind, Loader2, ImageIcon } from 'lucide-react';
import { fetchRooms } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface RoomsDisplayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Room {
  _id: string;
  roomNumber: string;
  type: string;
  price: number;
  description: string;
  isAvailable: boolean;
  images: string[];
  amenities: string[];
  bookings?: any[];
}

const RoomsDisplayDialog: React.FC<RoomsDisplayDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadAllRooms = async () => {
      if (open) {
        setLoading(true);
        try {
          const data = await fetchRooms();
          setRooms(data);
        } catch (error: any) {
          toast({
            title: "Erro ao carregar quartos",
            description: error.message || "Não foi possível carregar os quartos.",
            variant: "destructive"
          });
        } finally {
          setLoading(false);
        }
      }
    };
    loadAllRooms();
  }, [open, toast]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:text-gray-200 border-brand-accent/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-brand-dark dark:text-brand-accent">
            Nossas Acomodações
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">
            Explore todas as opções de quartos disponíveis em nosso hotel.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-brand-accent" />
            <p className="mt-2 text-brand-dark dark:text-brand-accent">Carregando acomodações...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhuma acomodação encontrada no momento.</p>
            <p>Por favor, tente novamente mais tarde.</p>
          </div>
        ) : (
          <div className="grid gap-6 mt-4">
            {rooms.map((room) => (
              <div key={room._id} className="flex flex-col md:flex-row gap-6 bg-white dark:bg-gray-900 p-4 rounded-xl border border-brand-accent/30">
                <div className="md:w-1/3 h-60 rounded-lg overflow-hidden flex-shrink-0">
                  {room.images && room.images.length > 0 ? (
                    <img
                      src={room.images[0]}
                      alt={room.type}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="md:w-2/3 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
                      <Users size={16} className="mr-1" />
                      <span className="text-sm">Até {room.guests || 2} pessoas</span> {/* Assumindo 2 hóspedes como padrão se não definido */}
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-brand-dark dark:text-brand-accent">{room.type} - Quarto {room.roomNumber}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{room.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {room.amenities.map((amenity, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center bg-brand-accent/10 dark:bg-brand-dark/50 text-brand-dark dark:text-brand-accent text-xs px-2 py-1 rounded-md"
                      >
                        {amenity === 'TV' && <Tv size={12} className="mr-1" />}
                        {amenity === 'Wi-Fi' && <Wifi size={12} className="mr-1" />}
                        {amenity === 'Banheira' && <Bath size={12} className="mr-1" />}
                        {amenity === 'Ar-condicionado' && <Wind size={12} className="mr-1" />}
                        {amenity}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mt-auto">
                    <div className="text-xl font-semibold text-brand-dark dark:text-brand-accent">
                      R$ {room.price.toFixed(2)}/noite
                    </div>
                    <Button 
                      variant="outline" 
                      className="border-hotel-300 dark:border-hotel-700 text-hotel-800 dark:text-hotel-200 hover:bg-hotel-50 dark:hover:bg-hotel-800"
                      disabled={!room.isAvailable}
                    >
                      {room.isAvailable ? 'Reservar' : 'Indisponível'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RoomsDisplayDialog;
