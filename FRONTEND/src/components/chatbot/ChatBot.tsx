import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { is } from 'date-fns/locale';
import { fetchRooms, createBooking, loginUser, fetchUserBookings, cancelBooking } from '@/services/api';
import { useAuth } from '@/hooks/use-auth';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Message = {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  options?: ChatOption[];
};

type ChatOption = {
  text: string;
  action: string;
};

const initialMessages: Message[] = [
  {
    id: '1',
    text: 'Olá! Sou o assistente virtual do Hotel Vitória. Como posso te ajudar hoje?',
    isBot: true,
    timestamp: new Date(),
    options: [
      { text: 'Quero fazer uma reserva', action: 'reserva' },
      { text: 'Verificar minhas reservas', action: 'duvida_reserva' },
      { text: 'Conhecer os serviços do hotel', action: 'servicos' },
      { text: 'Preciso de ajuda', action: 'suporte' },
      { text: 'Deixar um feedback', action: 'feedback' },
    ],
  },
];

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [currentBooking, setCurrentBooking] = useState<any>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isSelectingCheckIn, setIsSelectingCheckIn] = useState(true);
  const [bookingStep, setBookingStep] = useState<'initial' | 'dates' | 'room' | 'confirm'>('initial');

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      if (isSelectingCheckIn) {
        setCurrentBooking((prev: any) => ({ ...prev, checkInDate: date }));
        setIsSelectingCheckIn(false);
        setShowCalendar(true);
        
        // Adicionar mensagem do bot confirmando check-in
        const botMessage: Message = {
          id: Date.now().toString(),
          text: `Ótimo! Você selecionou o check-in para ${format(date, 'dd/MM/yyyy')}. Agora, selecione a data de check-out:`,
          isBot: true,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        setCurrentBooking((prev: any) => ({ ...prev, checkOutDate: date }));
        setShowCalendar(false);
        setBookingStep('room');
        
        // Adicionar mensagem do bot confirmando check-out e mostrando quartos
        const botMessage: Message = {
          id: Date.now().toString(),
          text: `Perfeito! Sua estadia será de ${format(currentBooking.checkInDate, 'dd/MM/yyyy')} até ${format(date, 'dd/MM/yyyy')}. Agora, vou mostrar os quartos disponíveis para essas datas:`,
          isBot: true,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMessage]);
        
        // Buscar e mostrar quartos disponíveis
        handleOptionClick('info_quartos');
      }
    }
  };

  const handleOptionClick = async (action: string) => {
    let userMessage: Message = {
      id: Date.now().toString(),
      text: messages.find(m => m.options?.some(opt => opt.action === action))?.options?.find(opt => opt.action === action)?.text || '',
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    let botResponse: Message = {
      id: (Date.now() + 1).toString(),
      text: '',
      isBot: true,
      timestamp: new Date(),
      options: [],
    };

    switch (action) {
      case 'reserva':
        if (!user) {
          botResponse.text = 'Para fazer uma reserva, você precisa estar logado. Deseja fazer login agora?';
          botResponse.options = [
            { text: 'Sim, fazer login', action: 'login' },
            { text: 'Não, voltar ao início', action: 'inicio' },
          ];
        } else {
          botResponse.text = 'Vamos fazer sua reserva! Primeiro, selecione a data de check-in:';
          setBookingStep('dates');
          setShowCalendar(true);
          setIsSelectingCheckIn(true);
          setCurrentBooking({});
        }
        break;

      case 'info_quartos':
        try {
          const rooms = await fetchRooms();
          if (rooms && rooms.length > 0) {
            botResponse.text = 'Temos as seguintes opções disponíveis:';
            botResponse.options = rooms.map((room: any) => ({ 
              text: `${room.type} - Quarto ${room.roomNumber} (R$ ${room.price}/noite)`, 
              action: `selecionar_quarto_${room._id}` 
            }));
          } else {
            botResponse.text = 'Desculpe, não há quartos disponíveis para as datas selecionadas. Gostaria de escolher outras datas?';
            botResponse.options = [
              { text: 'Sim, escolher outras datas', action: 'reserva' },
              { text: 'Não, voltar ao início', action: 'inicio' },
            ];
          }
        } catch (error) {
          botResponse.text = 'Desculpe, não consegui buscar os quartos no momento. Tente novamente mais tarde.';
          botResponse.options = [
            { text: 'Voltar ao início', action: 'inicio' },
          ];
        }
        break;

      case 'confirmar_reserva':
        if (currentBooking && currentBooking.room && currentBooking.checkInDate && currentBooking.checkOutDate) {
          try {
            const bookingData = {
              user: user._id,
              room: currentBooking.room,
              checkInDate: currentBooking.checkInDate,
              checkOutDate: currentBooking.checkOutDate,
            };
            const newBooking = await createBooking(bookingData);
            
            // Buscar os detalhes do quarto
            const roomDetails = await fetchRooms();
            const bookedRoom = roomDetails.find((room: any) => room._id === currentBooking.room);
            
            botResponse.text = `✅ Reserva confirmada com sucesso!\n\n📅 Check-in: ${format(currentBooking.checkInDate, 'dd/MM/yyyy')}\n📅 Check-out: ${format(currentBooking.checkOutDate, 'dd/MM/yyyy')}\n🏠 Quarto: ${bookedRoom?.type} (${bookedRoom?.roomNumber})\n💰 Valor total: R$ ${bookedRoom?.price}\n\nCódigo da reserva: ${newBooking._id}\n\nVocê receberá um e-mail com todos os detalhes. Posso ajudar com mais alguma coisa?`;
            botResponse.options = [
              { text: 'Não, obrigado', action: 'encerrar' },
              { text: 'Sim, tenho outra dúvida', action: 'inicio' },
            ];
            setCurrentBooking(null);
            setBookingStep('initial');
          } catch (error) {
            botResponse.text = 'Desculpe, não foi possível completar sua reserva. Por favor, tente novamente.';
            botResponse.options = [
              { text: 'Tentar novamente', action: 'reserva' },
              { text: 'Voltar ao início', action: 'inicio' },
            ];
          }
        } else {
          botResponse.text = 'Parece que faltam informações para a reserva. Vamos recomeçar?';
          botResponse.options = [
            { text: 'Sim, recomeçar', action: 'reserva' },
            { text: 'Não, voltar ao início', action: 'inicio' },
          ];
        }
        break;

      case 'duvida_reserva':
        if (!user) {
          botResponse.text = 'Você precisa estar logado para consultar suas reservas. Por favor, faça login primeiro.';
          botResponse.options = [
            { text: 'Fazer login', action: 'login' },
            { text: 'Voltar ao início', action: 'inicio' },
          ];
          break;
        }
        try {
          const userBookings = await fetchUserBookings(user._id);
          if (userBookings && userBookings.length > 0) {
            botResponse.text = 'Aqui estão suas reservas:';
            userBookings.forEach((booking: any) => {
              botResponse.text += `\n- Quarto: ${booking.room.roomNumber}, Check-in: ${new Date(booking.checkInDate).toLocaleDateString()}, Check-out: ${new Date(booking.checkOutDate).toLocaleDateString()}, Status: ${booking.status}`;
            });
          } else {
            botResponse.text = 'Você não tem reservas no momento.';
          }
          botResponse.options = [
            { text: 'Voltar ao início', action: 'inicio' },
          ];
        } catch (error) {
          botResponse.text = 'Desculpe, não consegui buscar suas reservas. Tente novamente mais tarde.';
          console.error('Erro ao buscar reservas:', error);
        }
        break;

      case 'info_reserva':
        botResponse.text = 'Obrigado! Aqui estão os detalhes da sua reserva: Quarto simples para 2 noites. Posso te ajudar com mais alguma coisa?';
        botResponse.options = [
          { text: 'Quero modificar minha reserva.', action: 'modificar_reserva' },
          { text: 'Quero cancelar minha reserva.', action: 'cancelar_reserva' },
          { text: 'Outra dúvida.', action: 'inicio' },
        ];
        break;

      case 'sem_codigo':
        botResponse.text = 'Sem problemas. Neste caso, sugiro entrar em contato com nossa recepção pelo telefone 35 999822446. Eles poderão ajudar com todas as informações sobre sua reserva.';
        botResponse.options = [
          { text: 'Entendi, obrigado.', action: 'encerrar' },
          { text: 'Tenho outra dúvida.', action: 'inicio' },
        ];
        break;

      case 'servicos':
        botResponse.text = 'Temos diversos serviços para tornar sua estadia mais confortável! Sobre qual serviço deseja saber mais?';
        botResponse.options = [
          { text: 'Café da Manhã', action: 'cafe_manha' },
          { text: 'Academia e Spa', action: 'academia_spa' },
          { text: 'Estacionamento', action: 'estacionamento' },
          { text: 'Outras informações', action: 'outras_infos' },
        ];
        break;

      case 'cafe_manha':
        botResponse.text = 'Nosso café da manhã é servido das 6h às 10h no restaurante principal. Oferecemos uma variedade de opções, incluindo frutas frescas, pães, queijos, frios, bolos, sucos naturais e café.';
        botResponse.options = [
          { text: 'Voltar aos serviços', action: 'servicos' },
          { text: 'Tenho outra dúvida', action: 'inicio' },
        ];
        break;

      case 'academia_spa':
        botResponse.text = 'Nossa academia está disponível 24 horas para os hóspedes. O spa oferece massagens e tratamentos de beleza, mediante agendamento prévio na recepção.';
        botResponse.options = [
          { text: 'Voltar aos serviços', action: 'servicos' },
          { text: 'Tenho outra dúvida', action: 'inicio' },
        ];
        break;

      case 'estacionamento':
        botResponse.text = 'Oferecemos estacionamento gratuito para todos os hóspedes, com segurança 24 horas.';
        botResponse.options = [
          { text: 'Voltar aos serviços', action: 'servicos' },
          { text: 'Tenho outra dúvida', action: 'inicio' },
        ];
        break;

      case 'suporte':
        botResponse.text = 'Entendi! Pode me informar qual problema está enfrentando?';
        botResponse.options = [
          { text: 'O Wi-Fi não está funcionando.', action: 'wifi_problema' },
          { text: 'Problema com TV a cabo.', action: 'tv_problema' },
          { text: 'Ar-condicionado não liga.', action: 'ar_problema' },
          { text: 'Outro problema.', action: 'outro_problema' },
        ];
        break;

      case 'wifi_problema':
        botResponse.text = 'Vamos resolver isso! Tente desconectar e conectar novamente à rede "Hotel_Vitoria". A senha é o número do seu quarto seguido de "guest". Caso o problema persista, vou encaminhar sua solicitação para nossa equipe de suporte.';
        botResponse.options = [
          { text: 'Funcionou, obrigado!', action: 'encerrar' },
          { text: 'Ainda não funciona', action: 'suporte_humano' },
        ];
        break;

      case 'feedback':
        botResponse.text = 'Adoraríamos ouvir sua opinião! Como você avalia sua experiência no nosso hotel?';
        botResponse.options = [
          { text: 'Excelente!', action: 'feedback_excelente' },
          { text: 'Boa, mas poderia melhorar.', action: 'feedback_bom' },
          { text: 'Não foi uma boa experiência.', action: 'feedback_ruim' },
        ];
        break;

      case 'feedback_excelente':
        botResponse.text = 'Que maravilha! Ficamos muito felizes em saber que sua experiência foi excelente. Obrigado pelo feedback positivo, ele é muito importante para nós! Esperamos recebê-lo novamente em breve.';
        botResponse.options = [
          { text: 'Tenho outra dúvida', action: 'inicio' },
          { text: 'Encerrar conversa', action: 'encerrar' },
        ];
        break;

      case 'encerrar':
        botResponse.text = 'Obrigado por falar comigo! Se precisar de mais alguma coisa, é só chamar. Tenha um ótimo dia! 😊';
        botResponse.options = [
          { text: 'Iniciar nova conversa', action: 'inicio' },
        ];
        break;

      case 'inicio':
        botResponse = {
          id: (Date.now() + 1).toString(),
          text: 'Como posso te ajudar hoje?',
          isBot: true,
          timestamp: new Date(),
          options: initialMessages[0].options,
        };
        break;

      case 'cancelar_reserva':
        if (!user) {
          botResponse.text = 'Você precisa estar logado para cancelar uma reserva. Por favor, faça login primeiro.';
          botResponse.options = [
            { text: 'Fazer login', action: 'login' },
            { text: 'Voltar ao início', action: 'inicio' },
          ];
          break;
        }
        try {
          const userBookings = await fetchUserBookings(user._id);
          if (userBookings && userBookings.length > 0) {
            botResponse.text = 'Qual reserva você gostaria de cancelar?';
            botResponse.options = userBookings.map((booking: any) => ({
              text: `Quarto ${booking.room.roomNumber} - Check-in: ${new Date(booking.checkInDate).toLocaleDateString()}`,
              action: `confirmar_cancelamento_${booking._id}`
            }));
            botResponse.options.push({ text: 'Voltar ao início', action: 'inicio' });
          } else {
            botResponse.text = 'Você não tem reservas ativas para cancelar.';
            botResponse.options = [
              { text: 'Voltar ao início', action: 'inicio' },
            ];
          }
        } catch (error) {
          botResponse.text = 'Desculpe, não consegui buscar suas reservas. Tente novamente mais tarde.';
          botResponse.options = [
            { text: 'Voltar ao início', action: 'inicio' },
          ];
        }
        break;

      case 'confirmar_cancelamento':
        const bookingId = action.replace('confirmar_cancelamento_', '');
        botResponse.text = 'Tem certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita.';
        botResponse.options = [
          { text: 'Sim, cancelar reserva', action: `executar_cancelamento_${bookingId}` },
          { text: 'Não, manter reserva', action: 'duvida_reserva' },
        ];
        break;

      case 'executar_cancelamento':
        const cancelBookingId = action.replace('executar_cancelamento_', '');
        try {
          await cancelBooking(cancelBookingId);
          botResponse.text = '✅ Sua reserva foi cancelada com sucesso! Você receberá um e-mail com a confirmação do cancelamento.';
          botResponse.options = [
            { text: 'Ver minhas reservas', action: 'duvida_reserva' },
            { text: 'Voltar ao início', action: 'inicio' },
          ];
        } catch (error) {
          botResponse.text = 'Desculpe, não foi possível cancelar sua reserva. Por favor, tente novamente mais tarde ou entre em contato com nossa recepção.';
          botResponse.options = [
            { text: 'Tentar novamente', action: 'cancelar_reserva' },
            { text: 'Voltar ao início', action: 'inicio' },
          ];
        }
        break;

      default:
        if (action.startsWith('selecionar_quarto_')) {
          const roomId = action.replace('selecionar_quarto_', '');
          setCurrentBooking((prev: any) => ({ ...prev, room: roomId }));
          setBookingStep('confirm');
          
          // Buscar detalhes do quarto selecionado
          const rooms = await fetchRooms();
          const selectedRoom = rooms.find((room: any) => room._id === roomId);
          
          botResponse.text = `Você selecionou o ${selectedRoom?.type} (Quarto ${selectedRoom?.roomNumber}).\n\nConfirme os detalhes da sua reserva:\n📅 Check-in: ${format(currentBooking.checkInDate, 'dd/MM/yyyy')}\n📅 Check-out: ${format(currentBooking.checkOutDate, 'dd/MM/yyyy')}\n💰 Valor total: R$ ${selectedRoom?.price}\n\nDeseja confirmar esta reserva?`;
          botResponse.options = [
            { text: 'Sim, confirmar reserva', action: 'confirmar_reserva' },
            { text: 'Não, escolher outro quarto', action: 'info_quartos' },
            { text: 'Não, recomeçar', action: 'reserva' },
          ];
        } else if (action.startsWith('confirmar_cancelamento_')) {
          handleOptionClick('confirmar_cancelamento');
        } else if (action.startsWith('executar_cancelamento_')) {
          handleOptionClick('executar_cancelamento');
        } else {
          botResponse.text = 'Desculpe, não entendi sua solicitação. Como posso te ajudar?';
          botResponse.options = initialMessages[0].options;
        }
        break;
    }

    setMessages((prev) => [...prev, botResponse]);
    setIsLoading(false);
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    let botResponse: Message = {
      id: (Date.now() + 1).toString(),
      text: '',
      isBot: true,
      timestamp: new Date(),
      options: [],
    };

    if (currentBooking && !currentBooking.checkInDate) {
      const dates = inputValue.split(',').map(date => date.trim());
      if (dates.length === 2 && Date.parse(dates[0]) && Date.parse(dates[1])) {
        setCurrentBooking((prev: any) => ({
          ...prev,
          checkInDate: new Date(dates[0]),
          checkOutDate: new Date(dates[1]),
        }));
        botResponse.text = 'Datas recebidas! Agora, por favor, me diga qual tipo de quarto você gostaria (Ex: Solteiro, Casal):';
      } else {
        botResponse.text = 'Formato de data inválido. Por favor, use (AAAA-MM-DD, AAAA-MM-DD).';
      }
    } else if (currentBooking && currentBooking.checkInDate && currentBooking.checkOutDate && !currentBooking.room) {
      const roomType = inputValue.trim().toLowerCase();
      try {
        const rooms = await fetchRooms();
        const selectedRoom = rooms.find((room: any) => room.type.toLowerCase().includes(roomType) && room.isAvailable);
        
        if (selectedRoom) {
          setCurrentBooking((prev: any) => ({ ...prev, room: selectedRoom._id }));
          botResponse.text = `Quarto ${selectedRoom.type} selecionado! Confirme os detalhes da reserva: Check-in: ${currentBooking.checkInDate.toLocaleDateString()}, Check-out: ${currentBooking.checkOutDate.toLocaleDateString()}, Quarto: ${selectedRoom.type}.`;
          botResponse.options = [
            { text: 'Confirmar reserva', action: 'confirmar_reserva' },
            { text: 'Alterar datas', action: 'fazer_reserva' },
            { text: 'Alterar quarto', action: 'info_quartos' },
          ];
        } else {
          botResponse.text = 'Desculpe, não encontramos um quarto disponível desse tipo. Gostaria de ver os quartos disponíveis novamente?';
          botResponse.options = [{ text: 'Ver quartos disponíveis', action: 'info_quartos' }];
        }
      } catch (error) {
        botResponse.text = 'Desculpe, não consegui buscar os quartos no momento. Tente novamente mais tarde.';
        console.error('Erro ao buscar quartos:', error);
      }
    } else {
      const lowerCaseMessage = userMessage.text.toLowerCase();
      
      const keywords = {
        reserva: ['reserva', 'reservar', 'quarto', 'agendar', 'marcar'],
        duvida: ['dúvida', 'duvida', 'reserva existente', 'confirmação'],
        servicos: ['serviço', 'servico', 'wifi', 'café', 'restaurante', 'spa'],
        suporte: ['problema', 'não funciona', 'quebrado', 'suporte', 'ajuda técnica'],
        feedback: ['feedback', 'opinião', 'avaliação', 'comentário', 'sugestão']
      };
      
      if (keywords.reserva.some(word => lowerCaseMessage.includes(word))) {
        handleOptionClick('reserva');
        setIsLoading(false);
        return;
      } else if (keywords.duvida.some(word => lowerCaseMessage.includes(word))) {
        handleOptionClick('duvida_reserva');
        setIsLoading(false);
        return;
      } else if (keywords.servicos.some(word => lowerCaseMessage.includes(word))) {
        handleOptionClick('servicos');
        setIsLoading(false);
        return;
      } else if (keywords.suporte.some(word => lowerCaseMessage.includes(word))) {
        handleOptionClick('suporte');
        setIsLoading(false);
        return;
      } else if (keywords.feedback.some(word => lowerCaseMessage.includes(word))) {
        handleOptionClick('feedback');
        setIsLoading(false);
        return;
      }
      
      botResponse.text = "Desculpe, não entendi completamente sua pergunta. Você pode escolher uma das opções abaixo para que eu possa te ajudar melhor.";
      botResponse.options = initialMessages[0].options;
    }

    setMessages((prev) => [...prev, botResponse]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed right-5 bottom-5 z-50 p-4 rounded-full shadow-lg transition-all duration-300",
          isOpen 
            ? "bg-hotel-100 text-hotel-800 hover:bg-hotel-200" 
            : "bg-hotel-800 text-white hover:bg-hotel-700"
        )}
        aria-label="Toggle chat"
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      <div
        className={cn(
          "fixed right-5 bottom-20 z-50 w-[90%] sm:w-[400px] h-[500px] rounded-2xl shadow-xl overflow-hidden transition-all duration-500 ease-in-out flex flex-col bg-white dark:bg-hotel-900 border border-hotel-100 dark:border-hotel-800",
          isOpen 
            ? "opacity-100 scale-100 translate-y-0" 
            : "opacity-0 scale-95 translate-y-8 pointer-events-none"
        )}
      >
        <div className="p-4 border-b border-hotel-100 dark:border-hotel-800 bg-hotel-50 dark:bg-hotel-950">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-hotel-800 flex items-center justify-center text-white mr-3 animate-subtle-float">
              <MessageCircle size={20} />
            </div>
            <div>
              <h3 className="font-medium text-hotel-900 dark:text-hotel-100">Assistente Hotel Vitória</h3>
              <p className="text-xs text-hotel-500 dark:text-hotel-400">Online • Resposta em instantes</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-end mb-4 animate-fade-up",
                  message.isBot ? "justify-start" : "justify-end"
                )}
              >
                {message.isBot && (
                  <div className="w-8 h-8 rounded-full bg-hotel-800 flex items-center justify-center text-white mr-2 flex-shrink-0">
                    <MessageCircle size={14} />
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 max-w-[85%]",
                    message.isBot
                      ? "bg-hotel-50 dark:bg-hotel-800 text-hotel-900 dark:text-hotel-100 rounded-bl-none"
                      : "bg-hotel-800 text-white rounded-br-none"
                  )}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-[10px] mt-1 opacity-60">
                    {new Intl.DateTimeFormat('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    }).format(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {messages.length > 0 && messages[messages.length - 1].options && messages[messages.length - 1].options!.length > 0 && (
              <div className="flex flex-col space-y-2 mt-4">
                {messages[messages.length - 1].options!.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionClick(option.action)}
                    className="text-sm bg-hotel-50 hover:bg-hotel-100 dark:bg-hotel-800 dark:hover:bg-hotel-700 text-hotel-800 dark:text-hotel-100 px-4 py-2 rounded-lg text-left transition-colors border border-hotel-200 dark:border-hotel-700"
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="flex items-end mb-4 justify-start animate-fade-up">
                <div className="w-8 h-8 rounded-full bg-hotel-800 flex items-center justify-center text-white mr-2 flex-shrink-0">
                  <MessageCircle size={14} />
                </div>
                <div className="rounded-2xl px-4 py-3 bg-hotel-50 dark:bg-hotel-800 text-hotel-900 dark:text-hotel-100 rounded-bl-none">
                  <div className="loading-dots">
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="p-4 border-t border-hotel-100 dark:border-hotel-800 bg-hotel-50 dark:bg-hotel-950">
          <div className="flex items-center">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem..."
              className="flex-1 p-3 rounded-l-lg border-y border-l border-hotel-200 dark:border-700 focus:outline-none focus:ring-1 focus:ring-hotel-500 bg-white dark:bg-hotel-900 dark:text-hotel-100 resize-none overflow-hidden max-h-[120px]"
              rows={1}
            />
            <Button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="rounded-l-none rounded-r-lg bg-hotel-800 hover:bg-hotel-700 h-full px-4"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </Button>
          </div>
          {showCalendar && (
            <div className="mt-4 p-4 bg-white dark:bg-hotel-900 rounded-lg shadow-lg">
              <h3 className="text-sm font-medium mb-2 text-hotel-800 dark:text-hotel-200">
                {isSelectingCheckIn ? 'Selecione a data de check-in' : 'Selecione a data de check-out'}
              </h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => {
                  if (isSelectingCheckIn) {
                    return date < new Date();
                  } else {
                    return date <= currentBooking.checkInDate;
                  }
                }}
                locale={ptBR}
                className="rounded-md border"
              />
            </div>
          )}
          <p className="text-xs text-hotel-500 dark:text-hotel-400 mt-2 text-center">
            Atendimento 24 horas para melhor atendê-lo
          </p>
        </div>
      </div>
    </>
  );
};

export default ChatBot;
