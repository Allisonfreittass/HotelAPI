import { v4 as uuidv4 } from 'uuid';

export interface Notification {
  id: string;
  type: 'maintenance' | 'cleaning' | 'booking' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

class NotificationService {
  private static instance: NotificationService;
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];

  private constructor() {
    // Carregar notificações do localStorage
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      this.notifications = JSON.parse(savedNotifications).map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
    }
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private saveToLocalStorage() {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.notifications));
  }

  public subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false
    };

    this.notifications.unshift(newNotification);
    this.saveToLocalStorage();
    this.notifyListeners();

    // Notificação do sistema
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon.png'
      });
    }

    return newNotification;
  }

  public markAsRead(id: string) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.saveToLocalStorage();
      this.notifyListeners();
    }
  }

  public deleteNotification(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.saveToLocalStorage();
    this.notifyListeners();
  }

  public getNotifications() {
    return [...this.notifications];
  }

  public getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  public clearAll() {
    this.notifications = [];
    this.saveToLocalStorage();
    this.notifyListeners();
  }

  // Métodos auxiliares para criar notificações específicas
  public notifyMaintenance(roomNumber: string, issue: string, priority: 'low' | 'medium' | 'high' = 'medium') {
    return this.addNotification({
      type: 'maintenance',
      title: `Manutenção Necessária - Quarto ${roomNumber}`,
      message: issue,
      priority
    });
  }

  public notifyCleaning(roomNumber: string, priority: 'low' | 'medium' | 'high' = 'medium') {
    return this.addNotification({
      type: 'cleaning',
      title: `Limpeza Pendente - Quarto ${roomNumber}`,
      message: `O quarto ${roomNumber} precisa ser limpo.`,
      priority
    });
  }

  public notifyBooking(roomNumber: string, guestName: string) {
    return this.addNotification({
      type: 'booking',
      title: `Nova Reserva - Quarto ${roomNumber}`,
      message: `${guestName} fez uma reserva para o quarto ${roomNumber}.`,
      priority: 'low'
    });
  }

  public notifySystem(message: string, priority: 'low' | 'medium' | 'high' = 'low') {
    return this.addNotification({
      type: 'system',
      title: 'Notificação do Sistema',
      message,
      priority
    });
  }
}

export const notificationService = NotificationService.getInstance(); 