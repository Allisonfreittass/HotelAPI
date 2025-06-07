import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, MessageCircle, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { createReview, fetchReviews, deleteReview, clearAllReviews } from '@/services/api';
import AuthDialog from '@/components/auth/AuthDialog';

interface TestimonialProps {
  _id: string;
  quote: string;
  author: string;
  location?: string;
  rating: number;
  user?: {
    _id: string;
    username: string;
    email: string;
  };
  createdAt: string;
  image?: string;
}

const ReviewForm = ({ onClose, onReviewSubmitted }: { onClose: () => void; onReviewSubmitted: () => void }) => {
  const [review, setReview] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { toast } = useToast();
  const { user, isLoggedIn } = useAuth();

  useEffect(() => {
    if (isLoggedIn && user) {
      setName(user.username || '');
    }
  }, [isLoggedIn, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      setShowAuthDialog(true);
      return;
    }
    
    if (!review.trim() || !name.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha seu nome e sua avaliação.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const newReviewData = {
        author: name,
        location: location,
        quote: review,
        rating: rating,
      };

      await createReview(newReviewData);

      toast({
        title: "Avaliação enviada!",
        description: "Obrigado por compartilhar sua experiência conosco. Sua avaliação aparecerá em breve.",
      });
      
      onReviewSubmitted();
      onClose();
    } catch (error: any) {
      console.error('Erro ao enviar avaliação:', error);
      
      if (error.message.includes('sessão expirou') || error.message.includes('Não autorizado')) {
        setShowAuthDialog(true);
        toast({
          title: "Sessão expirada",
          description: "Por favor, faça login novamente para enviar sua avaliação.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro ao enviar avaliação",
          description: error.message || "Não foi possível enviar sua avaliação. Tente novamente.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLoggedIn && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Seu Nome*</label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
              disabled={isLoading}
            />
          </div>
        )}
        
        <div>
          <label htmlFor="rating" className="block text-sm font-medium mb-1">Avaliação</label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none"
                disabled={isLoading}
              >
                <Star 
                  size={24} 
                  className={star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} 
                />
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label htmlFor="location" className="block text-sm font-medium mb-1">Localização</label>
          <input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Cidade, País"
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label htmlFor="review" className="block text-sm font-medium mb-1">Sua Avaliação*</label>
          <Textarea
            id="review"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="w-full"
            rows={5}
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>Cancelar</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Enviar Avaliação
          </Button>
        </div>
      </form>

      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog}
        onLoginSuccess={() => {
          setShowAuthDialog(false);
          // Tentar enviar a avaliação novamente após o login
          handleSubmit(new Event('submit') as any);
        }}
      />
    </>
  );
};

const TestimonialsSection: React.FC = () => {
  const [reviews, setReviews] = useState<TestimonialProps[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadReviews = async () => {
    setLoadingReviews(true);
    try {
      const data = await fetchReviews();
      const formattedReviews: TestimonialProps[] = data.map((review: any) => ({
        _id: review._id,
        quote: review.quote,
        author: review.author || (review.user ? review.user.username : 'Anônimo'),
        location: review.location,
        rating: review.rating,
        user: review.user,
        createdAt: review.createdAt,
        image: review.image,
      }));
      setReviews(formattedReviews);
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
      toast({
        title: "Erro ao carregar avaliações",
        description: "Não foi possível carregar as avaliações no momento.",
        variant: "destructive"
      });
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteReview(reviewId);
      toast({
        title: "Avaliação removida",
        description: "A avaliação foi removida com sucesso.",
      });
      loadReviews();
    } catch (error: any) {
      toast({
        title: "Erro ao remover avaliação",
        description: error.message || "Não foi possível remover a avaliação.",
        variant: "destructive"
      });
    }
  };

  const handleClearAllReviews = async () => {
    if (!window.confirm('Tem certeza que deseja remover todas as avaliações?')) {
      return;
    }

    try {
      await clearAllReviews();
      toast({
        title: "Avaliações removidas",
        description: "Todas as avaliações foram removidas com sucesso.",
      });
      loadReviews();
    } catch (error: any) {
      toast({
        title: "Erro ao remover avaliações",
        description: error.message || "Não foi possível remover as avaliações.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  return (
    <section className="py-20 bg-hotel-800 text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="diagonalLines" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="40" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diagonalLines)" />
        </svg>
      </div>

      <div className="section-container relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            O Que Dizem Nossos Hóspedes
          </h2>
          <p className="text-hotel-300 max-w-xl mx-auto mb-8">
            Experiências autênticas compartilhadas por quem vivenciou a hospitalidade do Hotel Vitória.
          </p>
          
          <div className="flex justify-center gap-4">
            <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Deixe sua Avaliação
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Compartilhe sua Experiência</DialogTitle>
                  <DialogDescription>
                    Conte-nos como foi sua estadia no Hotel Vitória. Sua opinião é muito importante para nós!
                  </DialogDescription>
                </DialogHeader>
                <ReviewForm onClose={() => setIsReviewOpen(false)} onReviewSubmitted={loadReviews} />
              </DialogContent>
            </Dialog>

            {user?.isAdmin && (
              <Button 
                variant="destructive" 
                onClick={handleClearAllReviews}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/20"
              >
                Remover Todas as Avaliações
              </Button>
            )}
          </div>
        </div>

        {loadingReviews ? (
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-hotel-800 dark:text-hotel-200 mx-auto" />
            <p className="text-hotel-600 dark:text-hotel-400 mt-2">Carregando avaliações...</p>
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((testimonial) => (
              <Card key={testimonial._id} className="bg-hotel-900/30 backdrop-blur-sm p-8 rounded-xl border border-white/10 flex flex-col md:flex-row items-center gap-8">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden flex-shrink-0 border-2 border-hotel-400/20">
                  <img 
                    src={testimonial.image || '/images/sem-perfil.jpg'} 
                    alt={testimonial.author}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/sem-perfil.jpg';
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={18} 
                          className={i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-400"} 
                        />
                      ))}
                    </div>
                    {(user?.isAdmin || (user?._id === testimonial.user?._id)) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        onClick={() => handleDeleteReview(testimonial._id)}
                      >
                        <X size={16} />
                      </Button>
                    )}
                  </div>
                  <blockquote className="text-lg mb-4 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-hotel-300 text-sm">{testimonial.location}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600 dark:text-hotel-400">
            <p>Ainda não há avaliações. Seja o primeiro a compartilhar sua experiência!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
