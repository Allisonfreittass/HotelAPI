import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { fetchUserBookings, cancelBooking } from '@/services/api';
import { useNavigate } from 'react-router-dom';

const Reservas: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      if (user?.id) {
        setLoading(true);
        try {
          const data = await fetchUserBookings(user.id);
          setBookings(data);
        } catch (error) {
          toast({
            title: 'Erro ao buscar reservas',
            description: 'Não foi possível carregar suas reservas.',
            variant: 'destructive',
          });
        } finally {
          setLoading(false);
        }
      }
    };
    fetchBookings();
  }, [user?.id, toast]);

  const handleCancel = async (bookingId: string) => {
    if (!window.confirm('Tem certeza que deseja cancelar esta reserva?')) return;
    setCancelling(bookingId);
    try {
      await cancelBooking(bookingId);
      setBookings((prev) => prev.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b));
      toast({
        title: 'Reserva cancelada',
        description: 'Sua reserva foi cancelada com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao cancelar',
        description: error?.message || 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-brand-dark dark:text-brand-accent">Minhas Reservas</h1>
      </div>
      {loading ? (
        <p className="text-center text-gray-600 dark:text-gray-300">Carregando reservas...</p>
      ) : bookings.length === 0 ? (
        <Card className="border-brand-accent/30 dark:bg-brand-dark"><CardContent className="p-6 text-center text-gray-600 dark:text-gray-300">Nenhuma reserva encontrada.</CardContent></Card>
      ) : (
        bookings.map((booking) => (
          <Card key={booking._id} className="mb-4 border-brand-accent/30 dark:bg-brand-dark">
            <CardContent className="p-6 space-y-2 text-gray-800 dark:text-gray-200">
              <div><b className="text-brand-dark dark:text-brand-accent">Quarto:</b> {booking.room?.type || 'N/A'} ({booking.room?.roomNumber})</div>
              <div><b className="text-brand-dark dark:text-brand-accent">Check-in:</b> {new Date(booking.checkInDate).toLocaleDateString()}</div>
              <div><b className="text-brand-dark dark:text-brand-accent">Check-out:</b> {new Date(booking.checkOutDate).toLocaleDateString()}</div>
              <div><b className="text-brand-dark dark:text-brand-accent">Status:</b> <span className={booking.status === 'cancelled' ? 'text-red-600' : 'text-green-500 dark:text-green-400'}>{booking.status}</span></div>
              <div><b className="text-brand-dark dark:text-brand-accent">Valor total:</b> R$ {booking.totalPrice}</div>
              {booking.status !== 'cancelled' && (
                <Button variant="destructive" onClick={() => handleCancel(booking._id)} disabled={cancelling === booking._id} className="bg-red-600 hover:bg-red-700 text-white">
                  {cancelling === booking._id ? 'Cancelando...' : 'Cancelar Reserva'}
                </Button>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default Reservas; 