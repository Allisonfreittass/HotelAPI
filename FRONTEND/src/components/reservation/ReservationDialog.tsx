import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { CalendarIcon, Users, CreditCard, Mail, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface ReservationDialogProps {
  trigger?: React.ReactNode;
  onBeforeReserve?: () => boolean;
}

const ReservationDialog: React.FC<ReservationDialogProps> = ({ trigger, onBeforeReserve }) => {
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [roomType, setRoomType] = useState('');
  const [adults, setAdults] = useState('1');
  const [children, setChildren] = useState('0');
  const [phone, setPhone] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isCheckOutCalendarOpen, setIsCheckOutCalendarOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user, isLoggedIn } = useAuth();

  const handleOpenChange = (open: boolean) => {
    if (open) {
      // Se o dialog está abrindo, verificar se o usuário está logado
      if (onBeforeReserve && !onBeforeReserve()) {
        return;
      }
    }
    setIsDialogOpen(open);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulário
    if (!checkIn || !checkOut || !roomType || !phone) {
      toast({
        title: "Informações incompletas",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    // Enviar formulário
    toast({
      title: "Reserva enviada!",
      description: "Entraremos em contato em breve para confirmar sua reserva.",
    });

    // Fechar o diálogo
    setIsDialogOpen(false);
    
    // Limpar formulário
    setCheckIn(undefined);
    setCheckOut(undefined);
    setRoomType('');
    setAdults('1');
    setChildren('0');
    setPhone('');
  };

  const defaultTrigger = (
    <Button className="bg-brand-dark hover:bg-brand-dark/90 text-white">
      Reservar Agora
    </Button>
  );

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] overflow-y-auto max-h-[90vh] dark:bg-gray-800 dark:text-gray-200 border-brand-accent/30">
        <DialogHeader>
          <DialogTitle className="text-2xl text-brand-dark dark:text-brand-accent">Faça sua reserva</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">
            Preencha os dados abaixo para reservar seu quarto no Hotel Vitória.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Check-in date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-dark dark:text-brand-accent">Check-in</label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-brand-accent/30 dark:bg-gray-800 dark:text-white",
                      !checkIn && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkIn ? (
                      format(checkIn, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={checkIn}
                    onSelect={(date) => {
                      setCheckIn(date);
                      setIsCalendarOpen(false);
                    }}
                    initialFocus
                    disabled={(date) => date < new Date()}
                    className="dark:bg-gray-800 dark:text-white border-brand-accent/30"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Check-out date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-dark dark:text-brand-accent">Check-out</label>
              <Popover open={isCheckOutCalendarOpen} onOpenChange={setIsCheckOutCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-brand-accent/30 dark:bg-gray-800 dark:text-white",
                      !checkOut && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkOut ? (
                      format(checkOut, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={checkOut}
                    onSelect={(date) => {
                      setCheckOut(date);
                      setIsCheckOutCalendarOpen(false);
                    }}
                    initialFocus
                    disabled={(date) => !checkIn || date <= checkIn}
                    className="dark:bg-gray-800 dark:text-white border-brand-accent/30"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {/* Room type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-brand-dark dark:text-brand-accent">Tipo de Quarto</label>
            <Select value={roomType} onValueChange={setRoomType}>
              <SelectTrigger className="border-brand-accent/30 dark:bg-gray-800 dark:text-white focus:ring-brand-accent">
                <SelectValue placeholder="Selecione o tipo de quarto" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:text-white border-brand-accent/30">
                <SelectItem value="solteiro">Solteiro (R$110)</SelectItem>
                <SelectItem value="solteiro-ar">Solteiro com Ar Condicionado (R$150)</SelectItem>
                <SelectItem value="casal">Casal (R$190)</SelectItem>
                <SelectItem value="casal-ar">Casal com Ar Condicionado (R$220)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Guests */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-dark dark:text-brand-accent">Adultos</label>
              <Select value={adults} onValueChange={setAdults}>
                <SelectTrigger className="border-brand-accent/30 dark:bg-gray-800 dark:text-white focus:ring-brand-accent">
                  <SelectValue placeholder="Adultos" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:text-white border-brand-accent/30">
                  <SelectItem value="1">1 Adulto</SelectItem>
                  <SelectItem value="2">2 Adultos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-dark dark:text-brand-accent">Crianças</label>
              <Select value={children} onValueChange={setChildren}>
                <SelectTrigger className="border-brand-accent/30 dark:bg-gray-800 dark:text-white focus:ring-brand-accent">
                  <SelectValue placeholder="Crianças" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:text-white border-brand-accent/30">
                  <SelectItem value="0">0 Crianças</SelectItem>
                  <SelectItem value="1">1 Criança</SelectItem>
                  <SelectItem value="2">2 Crianças</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Informações do usuário - Nome e Email são preenchidos automaticamente */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-brand-dark dark:text-brand-accent">Nome completo</label>
            <div className="relative">
              <Input 
                placeholder="Seu nome completo" 
                value={user?.username || ''} 
                disabled 
                className="pl-10 border-brand-accent/30 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-dark dark:text-brand-accent">Email</label>
              <div className="relative">
                <Input 
                  type="email" 
                  value={user?.email || ''} 
                  disabled
                  placeholder="seu@email.com" 
                  className="pl-10 bg-muted"
                />
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-dark dark:text-brand-accent">Telefone</label>
              <div className="relative">
                <Input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="(00) 00000-0000" 
                  className="pl-10"
                  required
                />
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
          
          <DialogFooter className="pt-2">
            <Button type="submit" className="w-full bg-brand-dark hover:bg-brand-dark/90 text-white">
              Enviar Solicitação de Reserva
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReservationDialog;
