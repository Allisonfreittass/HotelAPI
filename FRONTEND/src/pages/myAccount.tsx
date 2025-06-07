import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { fetchCurrentUser, updateUser, fetchUserBookings } from '@/services/api';

const UserAccount: React.FC = () => {
  const { user, updateUser: updateAuthUser } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (user?._id) {
        try {
          setLoading(true);
          const userData = await fetchCurrentUser(user._id);
          setName(userData.username);
          setEmail(userData.email);
          const userBookings = await fetchUserBookings(user._id);
          setBookings(userBookings);
        } catch (error) {
          toast({
            title: 'Erro ao carregar dados',
            description: 'Não foi possível carregar seus dados. Tente novamente.',
            variant: 'destructive',
          });
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [user?._id, toast]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await updateUser(user._id, { username: name, email });
      updateAuthUser({ ...user, username: updated.username, email: updated.email });
      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram atualizadas com sucesso.',
      });
      setEditing(false);
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar perfil',
        description: error?.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!user?._id) {
    return <div className="text-center mt-10 text-gray-600 dark:text-gray-300">Faça login para ver sua conta.</div>;
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto py-8">
      <Card className="border-brand-accent/30 dark:bg-brand-dark">
        <CardContent className="space-y-4 p-6 text-gray-800 dark:text-gray-200">
          <div className="flex items-center space-x-4">
            <img
              src={profilePic || '/images/sem-perfil.jpg'}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-2 border-brand-accent"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/sem-perfil.jpg';
              }}
            />
            <div>
              <label className="block text-sm font-medium text-brand-dark dark:text-brand-accent mb-1">Trocar foto</label>
              <Input type="file" accept="image/*" onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setProfilePic(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }} className="border-brand-accent/30 focus:ring-brand-accent dark:bg-brand-dark dark:text-white" />
            </div>
          </div>
          {loading ? (
            <p className="text-center text-gray-600 dark:text-gray-300">Carregando...</p>
          ) : editing ? (
            <>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nome" className="border-brand-accent/30 focus:ring-brand-accent dark:bg-brand-dark dark:text-white" />
              <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="border-brand-accent/30 focus:ring-brand-accent dark:bg-brand-dark dark:text-white" />
              <div className="flex space-x-2">
                <Button onClick={handleSave} disabled={saving} className="bg-brand-dark hover:bg-brand-dark/90 text-white">{saving ? 'Salvando...' : 'Salvar'}</Button>
                <Button variant="outline" onClick={() => setEditing(false)} className="border-brand-dark text-brand-dark hover:bg-brand-dark/10">Cancelar</Button>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-sm text-brand-dark dark:text-brand-accent">Nome</p>
                <p className="font-semibold">{name}</p>
              </div>
              <div>
                <p className="text-sm text-brand-dark dark:text-brand-accent">Email</p>
                <p className="font-semibold">{email}</p>
              </div>
              <Button onClick={() => setEditing(true)} className="bg-brand-dark hover:bg-brand-dark/90 text-white">Editar</Button>
            </>
          )}
        </CardContent>
      </Card>
      <Card className="border-brand-accent/30 dark:bg-brand-dark">
        <CardContent className="p-6 space-y-2 text-gray-800 dark:text-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-brand-dark dark:text-brand-accent">Histórico de Reservas</h2>
          {loading ? (
            <p className="text-center text-gray-600 dark:text-gray-300">Carregando reservas...</p>
          ) : bookings.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-300">Nenhuma reserva encontrada.</p>
          ) : (
            <ul className="list-disc pl-4 text-gray-800 dark:text-gray-200">
              {bookings.map((booking) => (
                <li key={booking._id} className="mb-2">
                  Quarto: <b className="text-brand-dark dark:text-brand-accent">{booking.room?.type || 'N/A'}</b> - Check-in: {new Date(booking.checkInDate).toLocaleDateString()} - Check-out: {new Date(booking.checkOutDate).toLocaleDateString()} - Status: <b className={booking.status === 'cancelled' ? 'text-red-600' : 'text-green-500 dark:text-green-400'}>{booking.status}</b>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAccount;