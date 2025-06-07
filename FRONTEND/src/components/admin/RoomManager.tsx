import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { fetchRooms, createRoom, updateRoom, deleteRoom } from '@/services/api';
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon, Calendar, Lock, Unlock, Mail, FileText, Printer, Phone, MessageSquare, Clock, History, Filter, BarChart2, Download, Share2, MoreHorizontal, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import RoomFilters from './RoomFilters';
import RoomStats from './RoomStats';
import Notifications from './Notifications';
import { notificationService } from '@/services/notifications';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';

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
  checkInCompleted?: boolean;
  checkOutCompleted?: boolean;
  receptionNotes?: string;
  history?: {
    date: string;
    action: string;
    user: string;
    details: string;
  }[];
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

  const handleSendConfirmationEmail = async (booking: Booking) => {
    try {
      await sendConfirmationEmail(booking._id);
      toast({
        title: "Email enviado",
        description: "O email de confirmação foi enviado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao enviar email",
        description: "Não foi possível enviar o email de confirmação.",
        variant: "destructive"
      });
    }
  };

  const handleGenerateReceipt = async (booking: Booking) => {
    try {
      const receipt = await generateReceipt(booking._id);
      window.open(receipt.url, '_blank');
    } catch (error) {
      toast({
        title: "Erro ao gerar comprovante",
        description: "Não foi possível gerar o comprovante.",
        variant: "destructive"
      });
    }
  };

  const handleToggleCheckIn = async (booking: Booking) => {
    try {
      await updateBookingStatus(booking._id, { checkInCompleted: !booking.checkInCompleted });
      loadRooms();
      toast({
        title: booking.checkInCompleted ? "Check-in desmarcado" : "Check-in realizado",
        description: booking.checkInCompleted 
          ? "O check-in foi desmarcado com sucesso."
          : "O check-in foi registrado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status do check-in.",
        variant: "destructive"
      });
    }
  };

  const handleToggleCheckOut = async (booking: Booking) => {
    try {
      await updateBookingStatus(booking._id, { checkOutCompleted: !booking.checkOutCompleted });
      loadRooms();
      toast({
        title: booking.checkOutCompleted ? "Check-out desmarcado" : "Check-out realizado",
        description: booking.checkOutCompleted 
          ? "O check-out foi desmarcado com sucesso."
          : "O check-out foi registrado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status do check-out.",
        variant: "destructive"
      });
    }
  };

  const handleAddReceptionNote = async (booking: Booking) => {
    const note = window.prompt('Adicione uma observação para esta reserva:');
    if (note) {
      try {
        await updateBookingStatus(booking._id, { receptionNotes: note });
        loadRooms();
        toast({
          title: "Observação adicionada",
          description: "A observação foi adicionada com sucesso.",
        });
      } catch (error) {
        toast({
          title: "Erro ao adicionar observação",
          description: "Não foi possível adicionar a observação.",
          variant: "destructive"
        });
      }
    }
  };

  const handleExportBookings = async (room: Room) => {
    try {
      const data = await exportRoomBookings(room._id);
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reservas-quarto-${room.roomNumber}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar as reservas.",
        variant: "destructive"
      });
    }
  };

  const handleViewStats = (room: Room) => {
    // Implementar visualização de estatísticas
    toast({
      title: "Em desenvolvimento",
      description: "Esta funcionalidade estará disponível em breve.",
    });
  };

  const handleFilterBookings = (room: Room) => {
    // Implementar filtros avançados
    toast({
      title: "Em desenvolvimento",
      description: "Esta funcionalidade estará disponível em breve.",
    });
  };

  const handleViewHistory = (room: Room) => {
    // Implementar histórico de alterações
    toast({
      title: "Em desenvolvimento",
      description: "Esta funcionalidade estará disponível em breve.",
    });
  };

  const handlePrintBooking = async (booking: Booking) => {
    try {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const content = `
          <html>
            <head>
              <title>Reserva #${booking._id}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .header { text-align: center; margin-bottom: 20px; }
                .details { margin-bottom: 20px; }
                .footer { text-align: center; margin-top: 40px; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Comprovante de Reserva</h1>
              </div>
              <div class="details">
                <p><strong>Hóspede:</strong> ${booking.user.username}</p>
                <p><strong>Email:</strong> ${booking.user.email}</p>
                <p><strong>Check-in:</strong> ${format(new Date(booking.checkInDate), 'dd/MM/yyyy', { locale: ptBR })}</p>
                <p><strong>Check-out:</strong> ${format(new Date(booking.checkOutDate), 'dd/MM/yyyy', { locale: ptBR })}</p>
                <p><strong>Valor Total:</strong> R$ ${booking.totalPrice.toFixed(2)}</p>
              </div>
              <div class="footer">
                <p>Hotel - Todos os direitos reservados</p>
              </div>
            </body>
          </html>
        `;
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (error) {
      toast({
        title: "Erro ao imprimir",
        description: "Não foi possível imprimir a reserva.",
        variant: "destructive"
      });
    }
  };

  const handleShareBooking = async (booking: Booking) => {
    try {
      const shareData = {
        title: 'Detalhes da Reserva',
        text: `Reserva de ${booking.user.username} - Check-in: ${format(new Date(booking.checkInDate), 'dd/MM/yyyy', { locale: ptBR })}`,
        url: window.location.href
      };
      await navigator.share(shareData);
    } catch (error) {
      toast({
        title: "Erro ao compartilhar",
        description: "Não foi possível compartilhar a reserva.",
        variant: "destructive"
      });
    }
  };

  const handleCallGuest = (booking: Booking) => {
    if (booking.user.phone) {
      window.location.href = `tel:${booking.user.phone}`;
    }
  };

  const handleSendMessage = (booking: Booking) => {
    // Implementar envio de mensagem
    toast({
      title: "Em desenvolvimento",
      description: "Esta funcionalidade estará disponível em breve.",
    });
  };

  const handleViewTimeline = (booking: Booking) => {
    // Implementar visualização de timeline
    toast({
      title: "Em desenvolvimento",
      description: "Esta funcionalidade estará disponível em breve.",
    });
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
                      <div className="mt-2 space-y-4">
                        <div className="flex flex-wrap justify-between items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportBookings(room)}
                            title="Exportar reservas"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewStats(room)}
                            title="Ver estatísticas"
                          >
                            <BarChart2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFilterBookings(room)}
                            title="Filtrar reservas"
                          >
                            <Filter className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewHistory(room)}
                            title="Ver histórico"
                          >
                            <History className="h-4 w-4" />
                          </Button>
                        </div>

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
                                <div className="flex items-center gap-1 flex-wrap">
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
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      title="Enviar email de confirmação"
                                      onClick={() => handleSendConfirmationEmail(booking)}
                                    >
                                      <Mail className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      title="Gerar comprovante"
                                      onClick={() => handleGenerateReceipt(booking)}
                                    >
                                      <FileText className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      title="Imprimir reserva"
                                      onClick={() => handlePrintBooking(booking)}
                                    >
                                      <Printer className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      title="Compartilhar reserva"
                                      onClick={() => handleShareBooking(booking)}
                                    >
                                      <Share2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                <div>
                                  <p className="text-hotel-600 dark:text-hotel-400">
                                    <strong>Check-in:</strong> {format(new Date(booking.checkInDate), 'dd/MM/yyyy', { locale: ptBR })}
                                    {booking.checkInCompleted && (
                                      <span className="ml-2 text-green-600">✓</span>
                                    )}
                                  </p>
                                  <p className="text-hotel-600 dark:text-hotel-400">
                                    <strong>Check-out:</strong> {format(new Date(booking.checkOutDate), 'dd/MM/yyyy', { locale: ptBR })}
                                    {booking.checkOutCompleted && (
                                      <span className="ml-2 text-green-600">✓</span>
                                    )}
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

                              {/* Informações de contato do hóspede */}
                              <div className="mt-2 space-y-1">
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
                              </div>

                              {/* Botões de Ação de Comunicação */}
                              <div className="flex gap-2 mt-4">
                                <Select onValueChange={(value) => {
                                  if (value === 'call') handleCallGuest(booking);
                                  else if (value === 'message') handleSendMessage(booking);
                                  else if (value === 'timeline') handleViewTimeline(booking);
                                }}>
                                  <SelectTrigger className="w-[120px] flex items-center justify-center gap-1">
                                    <MoreHorizontal className="h-4 w-4" />
                                    Ações
                                  </SelectTrigger>
                                  <SelectContent>
                                    {booking.user.phone && (
                                      <SelectItem value="call">
                                        <div className="flex items-center gap-2">
                                          <Phone className="h-4 w-4" /> Ligar
                                        </div>
                                      </SelectItem>
                                    )}
                                    <SelectItem value="message">
                                      <div className="flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4" /> Mensagem
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="timeline">
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" /> Timeline
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

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

                              {booking.receptionNotes && (
                                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                                  <p className="text-hotel-600 dark:text-hotel-400">
                                    <strong>Observações da Recepção:</strong>
                                  </p>
                                  <p className="text-hotel-600 dark:text-hotel-400 text-sm">
                                    {booking.receptionNotes}
                                  </p>
                                </div>
                              )}

                              <div className="mt-3 flex flex-wrap gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleCheckIn(booking)}
                                  disabled={booking.checkInCompleted}
                                  title={booking.checkInCompleted ? 'Check-in Realizado' : 'Realizar Check-in'}
                                >
                                  {booking.checkInCompleted ? <Check className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleCheckOut(booking)}
                                  disabled={booking.checkOutCompleted}
                                  title={booking.checkOutCompleted ? 'Check-out Realizado' : 'Realizar Check-out'}
                                >
                                  {booking.checkOutCompleted ? <Check className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAddReceptionNote(booking)}
                                  title="Adicionar observação"
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                              </div>
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