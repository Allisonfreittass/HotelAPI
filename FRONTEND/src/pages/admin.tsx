import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import RoomManager from '@/components/admin/RoomManager';

const AdminPage: React.FC = () => {
  const { user } = useAuth();

  // Redirecionar se não for admin
  if (!user?.isAdmin) {
    return <Navigate to="/" />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Painel de Administração</h1>
      
      <div className="space-y-8">
        <section>
          <RoomManager />
        </section>
      </div>
    </div>
  );
};

export default AdminPage; 