import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Sun, Moon, UserCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ReservationDialog from "@/components/reservation/ReservationDialog";
import AuthDialog from "@/components/auth/AuthDialog";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Importar o logo (assumindo que está em public/logo.png)
import logo from '../home/images/logo.jpg'; 

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const { user, isLoggedIn, logout } = useAuth();
  const [profilePic, setProfilePic] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Carregar a foto de perfil do localStorage
  useEffect(() => {
    if (isLoggedIn && user?.email) {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const currentUser = users.find((u: any) => u.email === user.email);
      
      if (currentUser && currentUser.profilePic) {
        setProfilePic(currentUser.profilePic);
      } else {
        setProfilePic(null);
      }
    } else {
      setProfilePic(null);
    }
  }, [isLoggedIn, user?.email]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = () => {
    logout();
  };

  // Componente para Avatar do usuário (foto ou ícone)
  const UserAvatar = () => {
    if (profilePic) {
      return (
        <img 
          src={profilePic} 
          alt="Perfil" 
          className="w-7 h-7 rounded-full object-cover border border-gray-200"
          onError={(e) => {
            // Fallback para o ícone padrão se a imagem falhar
            setProfilePic(null);
          }}
        />
      );
    }
    
    return <UserCircle size={18} />;
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
        scrolled 
          ? "py-3 bg-white/80 backdrop-blur-lg shadow-sm dark:bg-hotel-950/80" 
          : "py-5 bg-transparent"
      )}
    >
      <div className="section-container">
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="text-2xl font-semibold tracking-tight transition-transform hover:scale-[1.02] relative flex items-center"
          >
            <img src={logo} alt="Logo do Hotel Vitória" className="h-8 w-auto mr-2" />
            <span className="text-gray-900 dark:text-white">
              Hotel Vitória Palace
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full bg-secondary/80 hover:bg-secondary transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            
            {isLoggedIn ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2 border-brand-accent text-brand-dark hover:bg-brand-accent/10">
                      <UserAvatar />
                      <span className="hidden sm:inline-block">
                        {user?.username || user?.email?.split('@')[0]}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {/* <Link to="/reservas">
                      <DropdownMenuItem>Minhas Reservas</DropdownMenuItem>
                    </Link> */}
                    <Link to="/myAccount">
                      <DropdownMenuItem>Minha Conta</DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4 text-brand-dark" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <ReservationDialog />
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAuthDialogOpen(true)}
                  className="text-brand-dark border-brand-accent hover:bg-brand-accent/10"
                >
                  Entrar
                </Button>
                <ReservationDialog 
                  onBeforeReserve={() => {
                    if (!isLoggedIn) {
                      setIsAuthDialogOpen(true);
                      return false;
                    }
                    return true;
                  }}
                />
              </>
            )}
          </div>

          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-hotel-600 hover:text-hotel-800 dark:text-hotel-300 dark:hover:text-hotel-100"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-50 bg-white/90 backdrop-blur-md dark:bg-hotel-950/90 transition-all duration-300 ease-in-out",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="flex flex-col items-center justify-center h-full space-y-8 p-4 animate-stagger">
          <div className="flex flex-col items-center space-y-4 animate-fade-up opacity-0 pt-6">
            <button 
              onClick={toggleTheme} 
              className="p-3 rounded-full bg-brand-dark/80 hover:bg-brand-dark text-white transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            
            {isLoggedIn ? (
              <>
                <div className="flex flex-col items-center gap-2 text-center mb-2">
                  {profilePic ? (
                    <img 
                      src={profilePic} 
                      alt="Perfil" 
                      className="w-12 h-12 rounded-full object-cover border border-gray-200"
                      onError={() => setProfilePic(null)}
                    />
                  ) : (
                    <UserCircle size={40} className="text-brand-dark" />
                  )}
                  <p className="text-brand-dark">
                    Olá, {user?.username || user?.email?.split('@')[0]}!
                  </p>
                </div>
                <Link to="/reservas" className="text-2xl font-semibold hover:text-brand-accent transition-colors">Minhas Reservas</Link>
                <Link to="/myAccount" className="text-2xl font-semibold hover:text-brand-accent transition-colors">Minha Conta</Link>
                <button 
                  onClick={handleLogout}
                  className="text-2xl font-semibold text-red-500 hover:text-red-700 transition-colors"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAuthDialogOpen(true);
                    setIsOpen(false);
                  }}
                  className="text-brand-dark border-brand-accent hover:bg-brand-accent/10 text-2xl font-semibold w-full"
                >
                  Entrar
                </Button>
              </>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-md text-hotel-600 hover:text-hotel-800 dark:text-hotel-300 dark:hover:text-hotel-100"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Auth Dialog */}
      <AuthDialog 
        open={isAuthDialogOpen} 
        onOpenChange={setIsAuthDialogOpen} 
      />
    </header>
  );
};

export default Header;