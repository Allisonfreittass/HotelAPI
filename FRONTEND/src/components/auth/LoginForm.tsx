import React, { useState } from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from "@/hooks/use-auth";
import { loginUser } from "@/services/api";

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

const formSchema = z.object({
  email: z.string().email({ message: "E-mail inválido" }),
  password: z.string()
    .min(8, { message: "A senha deve ter pelo menos 8 caracteres" })
    .regex(passwordRegex, {
      message: "A senha deve conter pelo menos uma letra, um número e um caractere especial"
    }),
});


interface LoginFormProps {
  onLoginSuccess?: () => void;
  onRegisterClick?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onRegisterClick }) => {
  const { toast } = useToast();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const result = await loginUser(values.email, values.password);
      localStorage.setItem('authToken', result.token);
      login(result.user);

      toast({
        title: "Login realizado!",
        description: "Você foi autenticado com sucesso.",
      });

      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: error?.message || "Verifique suas credenciais e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-1">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold text-brand-dark dark:text-brand-accent">
          Entrar na sua conta
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Digite seu e-mail e senha para acessar sua conta
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-brand-dark dark:text-brand-accent">E-mail</FormLabel>
                <FormControl>
                  <Input placeholder="seu@email.com" {...field} disabled={isLoading} className="border-brand-accent/30 focus:ring-brand-accent dark:bg-gray-800 dark:text-white" />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-brand-dark dark:text-brand-accent">Senha</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Sua senha" 
                      {...field} 
                      disabled={isLoading}
                      className="border-brand-accent/30 focus:ring-brand-accent dark:bg-gray-800 dark:text-white"
                    />
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-300"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full bg-brand-dark hover:bg-brand-dark/90 text-white" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </Form>
      
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Ainda não tem uma conta?{" "}
          <button
            onClick={onRegisterClick}
            className="text-brand-dark dark:text-brand-accent hover:underline font-medium"
            type="button"
          >
            Criar conta
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
