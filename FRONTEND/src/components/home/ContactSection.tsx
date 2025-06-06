import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Phone, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const ContactSection: React.FC = () => {
  return (
    <section className="py-20 bg-brand-dark dark:bg-brand-dark text-white">
      <div className="section-container">
        <div className="text-center mb-16 animate-fade-up opacity-0">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Entre em Contato
          </h2>
          <p className="text-brand-accent max-w-xl mx-auto">
            Estamos à disposição para sanar dúvidas, receber sugestões ou ajudar com sua reserva.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="animate-fade-up opacity-0" style={{ animationDelay: '0.1s' }}>
            <div className="bg-white dark:bg-brand-dark rounded-xl shadow-sm p-8 border border-brand-accent/30">
              <h3 className="text-xl font-semibold mb-6 text-brand-dark dark:text-white">
                Envie-nos uma mensagem
              </h3>
              
              <form className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-brand-dark dark:text-brand-accent">
                      Nome completo
                    </label>
                    <Input 
                      id="name"
                      type="text"
                      placeholder="Seu nome"
                      className="w-full border-brand-accent/30 focus:ring-brand-accent dark:bg-brand-dark dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-brand-dark dark:text-brand-accent">
                      Email
                    </label>
                    <Input 
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      className="w-full border-brand-accent/30 focus:ring-brand-accent dark:bg-brand-dark dark:text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-brand-dark dark:text-brand-accent">
                    Assunto
                  </label>
                  <Input 
                    id="subject"
                    type="text"
                    placeholder="Como podemos ajudar?"
                    className="w-full border-brand-accent/30 focus:ring-brand-accent dark:bg-brand-dark dark:text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-brand-dark dark:text-brand-accent">
                    Mensagem
                  </label>
                  <Textarea 
                    id="message"
                    placeholder="Digite sua mensagem aqui..."
                    className="w-full h-32 border-brand-accent/30 focus:ring-brand-accent dark:bg-brand-dark dark:text-white"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-semibold"
                >
                  Enviar Mensagem
                </Button>
              </form>
            </div>
          </div>
          
          <div className="animate-fade-up opacity-0" style={{ animationDelay: '0.3s' }}>
            <div className="grid grid-cols-1 gap-8 h-full">
              <div className="bg-white dark:bg-brand-dark rounded-xl shadow-sm p-8 border border-brand-accent/30">
                <h3 className="text-xl font-semibold mb-6 text-brand-dark dark:text-white">
                  Informações de Contato
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-brand-accent/20 dark:bg-brand-accent/30 flex items-center justify-center text-brand-dark mr-4 flex-shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-brand-dark dark:text-white mb-1">Localização</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        Avenida princesa do Sul N°28, Jardim Andere<br />
                        Varginha - MG
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-brand-accent/20 dark:bg-brand-accent/30 flex items-center justify-center text-brand-dark mr-4 flex-shrink-0">
                      <Phone size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-brand-dark dark:text-white mb-1">Telefone</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        35 999822446
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-brand-dark rounded-xl shadow-sm p-8 border border-brand-accent/30 flex flex-col">
                <h3 className="text-xl font-semibold mb-4 text-brand-dark dark:text-white">
                  Horários de Atendimento
                </h3>
                
                <div className="flex-1">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Recepção:</span>
                      <span className="text-brand-dark dark:text-white font-medium">24 horas</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
