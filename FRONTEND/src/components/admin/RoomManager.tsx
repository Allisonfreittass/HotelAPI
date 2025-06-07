import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { fetchRooms, createRoom, updateRoom, deleteRoom } from '@/services/api';
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon, Calendar, Lock, Unlock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import RoomFilters from './RoomFilters';
import RoomStats from './RoomStats';
import Notifications from './Notifications';
import { notificationService } from '@/services/notifications';

interface Room {
  _id: string;
  roomNumber: string;
  type: string;
  price: number;
  description: string;
  isAvailable: boolean;
  images: string[];
  amenities: string[];
  bookings?: Booking[];
}

interface Booking {
  _id: string;
  user: {
    _id: string;
    username: string;
    email: string;
    phone?: string;
    document?: string;
    address?: string;
  };
  checkInDate: string;
  checkOutDate: string;
  status: string;
  totalPrice: number;
  guests?: number;
  specialRequests?: string;
}

const RoomManager: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const { toast } = useToast();
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    roomNumber: '',
    type: '',
    price: '',
    description: '',
    isAvailable: true,
    amenities: [] as string[]
  });

  const loadRooms = async () => {
    try {
      setLoading(true);
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
  };

  useEffect(() => {
    loadRooms();
    // Carregar notificações
    const unsubscribe = notificationService.subscribe(setNotifications);
    return () => unsubscribe();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedImages(prev => [...prev, ...files]);
      
      // Criar URLs de preview
      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Iniciando envio do formulário:', formData);
      console.log('Imagens selecionadas:', selectedImages);

      const formDataToSend = new FormData();
      formDataToSend.append('roomNumber', formData.roomNumber);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('isAvailable', String(formData.isAvailable));
      formDataToSend.append('amenities', JSON.stringify(formData.amenities));

      selectedImages.forEach(image => {
        formDataToSend.append('images', image);
      });

      console.log('FormData preparado:', Object.fromEntries(formDataToSend.entries()));

      if (editingRoom) {
        console.log('Atualizando quarto existente:', editingRoom._id);
        await updateRoom(editingRoom._id, formDataToSend);
        toast({
          title: "Quarto atualizado",
          description: "O quarto foi atualizado com sucesso.",
        });
      } else {
        console.log('Criando novo quarto');
        await createRoom(formDataToSend);
        toast({
          title: "Quarto adicionado",
          description: "O quarto foi adicionado com sucesso.",
        });
      }
      setIsDialogOpen(false);
      loadRooms();
    } catch (error: any) {
      console.error('Erro ao salvar quarto:', error);
      toast({
        title: "Erro ao salvar quarto",
        description: error.message || "Não foi possível salvar o quarto.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      type: room.type,
      price: room.price.toString(),
      description: room.description,
      isAvailable: room.isAvailable,
      amenities: room.amenities || []
    });
    setPreviewUrls(room.images || []);
    setIsDialogOpen(true);
  };

  const handleDelete = async (roomId: string) => {
    if (!window.confirm('Tem certeza que deseja remover este quarto?')) {
      return;
    }

    try {
      await deleteRoom(roomId);
      toast({
        title: "Quarto removido",
        description: "O quarto foi removido com sucesso.",
      });
      loadRooms();
    } catch (error: any) {
      toast({
        title: "Erro ao remover quarto",
        description: error.message || "Não foi possível remover o quarto.",
        variant: "destructive"
      });
    }
  };

  const handleAddNew = () => {
    setEditingRoom(null);
    setFormData({
      roomNumber: '',
      type: '',
      price: '',
      description: '',
      isAvailable: true,
      amenities: []
    });
    setSelectedImages([]);
    setPreviewUrls([]);
    setIsDialogOpen(true);
  };

  const handleToggleAvailability = async (room: Room) => {
    try {
      const newStatus = !room.isAvailable;
      const message = newStatus 
        ? "Tem certeza que deseja liberar este quarto?" 
        : "Tem certeza que deseja marcar este quarto como ocupado?";

      if (!window.confirm(message)) {
        return;
      }

      await updateRoom(room._id, {
        ...room,
        isAvailable: newStatus
      });

      // Criar notificação
      if (newStatus) {
        notificationService.notifyCleaning(room.roomNumber, 'high');
      }

      toast({
        title: newStatus ? "Quarto liberado" : "Quarto ocupado",
        description: newStatus 
          ? "O quarto foi liberado com sucesso." 
          : "O quarto foi marcado como ocupado.",
      });

      loadRooms();
    } catch (error: any) {
      toast({
        title: "Erro ao alterar status",
        description: error.message || "Não foi possível alterar o status do quarto.",
        variant: "destructive"
      });
    }
  };

  const handleFilterChange = (filters: any) => {
    let filtered = [...rooms];

    if (filters.search) {
      filtered = filtered.filter(room => 
        room.roomNumber.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(room => room.type === filters.type);
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(room => 
        filters.status === 'available' ? room.isAvailable : !room.isAvailable
      );
    }

    if (filters.priceRange) {
      filtered = filtered.filter(room => 
        room.price >= filters.priceRange[0] && room.price <= filters.priceRange[1]
      );
    }

    setFilteredRooms(filtered);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Quartos</h2>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Quarto
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RoomStats rooms={rooms} />
          <RoomFilters onFilterChange={handleFilterChange} />
        </div>
        <div>
          <Notifications
            notifications={notifications}
            onMarkAsRead={notificationService.markAsRead}
            onDelete={notificationService.deleteNotification}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2">Carregando quartos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(filteredRooms.length > 0 ? filteredRooms : rooms).map((room) => (
            <Card key={room._id} className="border-brand-accent/30">
              <CardContent className="p-6">
                <div className="relative aspect-video mb-4 rounded-lg overflow-hidden">
                  {room.images && room.images.length > 0 ? (
                    <img
                      src={room.images[0]}
                      alt={`Quarto ${room.roomNumber}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{room.type}</h3>
                    <p className="text-sm text-gray-500">Quarto {room.roomNumber}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleAvailability(room)}
                      className={room.isAvailable ? "text-green-600 hover:text-green-700" : "text-red-600 hover:text-red-700"}
                      title={room.isAvailable ? "Marcar como ocupado" : "Liberar quarto"}
                    >
                      {room.isAvailable ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(room)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(room._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-gray-600 mb-2">{room.description}</p>
                <p className="text-lg font-semibold text-brand-accent">
                  R$ {room.price.toFixed(2)}/noite
                </p>

                <div className="mt-4">
                  <Tabs defaultValue="status">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="status">Status</TabsTrigger>
                      <TabsTrigger value="bookings">Reservas</TabsTrigger>
                    </TabsList>
                    <TabsContent value="status">
                      <div className="mt-2">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          room.isAvailable 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {room.isAvailable ? 'Disponível' : 'Ocupado'}
                        </span>
                      </div>
                    </TabsContent>
                    <TabsContent value="bookings">
                      <div className="mt-2 space-y-2">
                        {room.bookings && room.bookings.length > 0 ? (
                          room.bookings.map((booking) => (
                            <div key={booking._id} className="text-sm border rounded p-3 bg-white dark:bg-hotel-900">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-semibold text-hotel-800 dark:text-hotel-200">
                                    {booking.user.username}
                                  </h4>
                                  <p className="text-hotel-600 dark:text-hotel-400">
                                    {booking.user.email}
                                  </p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  booking.status === 'confirmed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : booking.status === 'cancelled'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {booking.status === 'confirmed' ? 'Confirmada' : 
                                   booking.status === 'cancelled' ? 'Cancelada' : 'Pendente'}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                <div>
                                  <p className="text-hotel-600 dark:text-hotel-400">
                                    <strong>Check-in:</strong> {format(new Date(booking.checkInDate), 'dd/MM/yyyy', { locale: ptBR })}
                                  </p>
                                  <p className="text-hotel-600 dark:text-hotel-400">
                                    <strong>Check-out:</strong> {format(new Date(booking.checkOutDate), 'dd/MM/yyyy', { locale: ptBR })}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-hotel-600 dark:text-hotel-400">
                                    <strong>Valor Total:</strong> R$ {booking.totalPrice.toFixed(2)}
                                  </p>
                                  {booking.guests && (
                                    <p className="text-hotel-600 dark:text-hotel-400">
                                      <strong>Hóspedes:</strong> {booking.guests}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {booking.user.phone && (
                                <p className="text-hotel-600 dark:text-hotel-400 mt-2">
                                  <strong>Telefone:</strong> {booking.user.phone}
                                </p>
                              )}
                              
                              {booking.user.document && (
                                <p className="text-hotel-600 dark:text-hotel-400">
                                  <strong>Documento:</strong> {booking.user.document}
                                </p>
                              )}
                              
                              {booking.user.address && (
                                <p className="text-hotel-600 dark:text-hotel-400">
                                  <strong>Endereço:</strong> {booking.user.address}
                                </p>
                              )}

                              {booking.specialRequests && (
                                <div className="mt-2 p-2 bg-hotel-50 dark:bg-hotel-800 rounded">
                                  <p className="text-hotel-600 dark:text-hotel-400">
                                    <strong>Solicitações Especiais:</strong>
                                  </p>
                                  <p className="text-hotel-600 dark:text-hotel-400 text-sm">
                                    {booking.specialRequests}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">Nenhuma reserva encontrada</p>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingRoom ? 'Editar Quarto' : 'Adicionar Novo Quarto'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Número do Quarto</label>
              <Input
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <Input
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Preço por Noite</label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fotos do Quarto</label>
              <div className="mt-2 flex flex-wrap gap-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-brand-accent">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Plus className="h-8 w-8 text-gray-400" />
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingRoom ? 'Salvar Alterações' : 'Adicionar Quarto'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomManager; 