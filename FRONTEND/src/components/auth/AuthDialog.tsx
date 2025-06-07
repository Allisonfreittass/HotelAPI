import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { useAuth } from '@/hooks/use-auth';

type AuthView = 'login' | 'register';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultView?: AuthView;
  onLoginSuccess?: () => void;
  onRegisterSuccess?: () => void;
}

const AuthDialog: React.FC<AuthDialogProps> = ({
  open,
  onOpenChange,
  defaultView = 'login',
  onLoginSuccess,
  onRegisterSuccess
}) => {
  const [view, setView] = useState<AuthView>(defaultView);
  const { isLoggedIn } = useAuth();

  // Se o usuário já estiver logado, feche o diálogo
  React.useEffect(() => {
    if (isLoggedIn && open) {
      onOpenChange(false);
    }
  }, [isLoggedIn, open, onOpenChange]);

  const handleLoginSuccess = () => {
    if (onLoginSuccess) {
      onLoginSuccess();
    }
    onOpenChange(false);
  };

  const handleRegisterSuccess = () => {
    if (onRegisterSuccess) {
      onRegisterSuccess();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {view === 'login' ? 'Entrar na sua conta' : 'Criar uma conta'}
          </DialogTitle>
          <DialogDescription>
            {view === 'login' 
              ? 'Digite seu e-mail e senha para acessar sua conta'
              : 'Preencha os dados abaixo para criar sua conta'}
          </DialogDescription>
        </DialogHeader>
        {view === 'login' ? (
          <LoginForm 
            onLoginSuccess={handleLoginSuccess} 
            onRegisterClick={() => setView('register')} 
          />
        ) : (
          <RegisterForm 
            onRegisterSuccess={handleRegisterSuccess} 
            onLoginClick={() => setView('login')} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
