
import React from "react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto animate-fade-up opacity-0">
          <h1 className="text-8xl font-bold mb-4 text-hotel-800 dark:text-hotel-200">404</h1>
          <p className="text-2xl text-hotel-600 dark:text-hotel-400 mb-8">
            Oops! Página não encontrada
          </p>
          <p className="text-hotel-500 dark:text-hotel-500 mb-8">
            A página que você está procurando pode ter sido removida, renomeada ou está temporariamente indisponível.
          </p>
          <Button 
            className="bg-hotel-800 hover:bg-hotel-700 text-white"
            onClick={() => window.location.href = '/'}
          >
            <Home className="mr-2 h-4 w-4" /> Voltar para a Home
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
