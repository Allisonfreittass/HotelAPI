
import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Instagram, Facebook, Twitter, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-hotel-50 dark:bg-hotel-950 border-t border-hotel-100 dark:border-hotel-800">
      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <Link to="/" className="block text-2xl font-semibold">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-hotel-800 to-hotel-600 dark:from-hotel-200 dark:to-hotel-400">
                Hotel Vitória
              </span>
            </Link>
            <p className="text-hotel-600 dark:text-hotel-400 max-w-xs">
              Um refúgio de tranquilidade e sofisticação, onde cada detalhe é pensado para proporcionar uma experiência excepcional.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-hotel-500 hover:text-hotel-700 dark:text-hotel-400 dark:hover:text-hotel-200 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-hotel-500 hover:text-hotel-700 dark:text-hotel-400 dark:hover:text-hotel-200 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-hotel-500 hover:text-hotel-700 dark:text-hotel-400 dark:hover:text-hotel-200 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-hotel-500 hover:text-hotel-700 dark:text-hotel-400 dark:hover:text-hotel-200 transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-hotel-800 dark:text-hotel-200">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={18} className="mt-1 mr-3 text-hotel-500 dark:text-hotel-400 flex-shrink-0" />
                <span className="text-hotel-600 dark:text-hotel-400">
                  Avenida princesa do Sul N°28, Jardim Andere<br />
                  Varginha - MG
                </span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-3 text-hotel-500 dark:text-hotel-400 flex-shrink-0" />
                <span className="text-hotel-600 dark:text-hotel-400">35 999822446</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-hotel-200 dark:border-hotel-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-hotel-500 dark:text-hotel-400 text-sm">
            © 2023 Hotel Vitória. Todos os direitos reservados.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/termos-de-uso" className="text-hotel-500 hover:text-hotel-700 dark:text-hotel-400 dark:hover:text-hotel-200 text-sm">
              Termos de Uso
            </Link>
            <Link to="/politica-de-privacidade" className="text-hotel-500 hover:text-hotel-700 dark:text-hotel-400 dark:hover:text-hotel-200 text-sm">
              Política de Privacidade
            </Link>
            <Link to="/cookies" className="text-hotel-500 hover:text-hotel-700 dark:text-hotel-400 dark:hover:text-hotel-200 text-sm">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
