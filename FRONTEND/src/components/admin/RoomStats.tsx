import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Bed, DollarSign, TrendingUp, Users } from 'lucide-react';

interface RoomStatsProps {
  rooms: any[];
}

const RoomStats: React.FC<RoomStatsProps> = ({ rooms }) => {
  const stats = React.useMemo(() => {
    const totalRooms = rooms.length;
    const availableRooms = rooms.filter(room => room.isAvailable).length;
    const occupiedRooms = totalRooms - availableRooms;
    const totalRevenue = rooms.reduce((sum, room) => sum + room.price, 0);
    const occupancyRate = (occupiedRooms / totalRooms) * 100;

    // Dados para o gráfico de ocupação por tipo
    const occupancyByType = rooms.reduce((acc, room) => {
      if (!acc[room.type]) {
        acc[room.type] = { available: 0, occupied: 0 };
      }
      if (room.isAvailable) {
        acc[room.type].available++;
      } else {
        acc[room.type].occupied++;
      }
      return acc;
    }, {});

    const chartData = Object.entries(occupancyByType).map(([type, data]: [string, any]) => ({
      type,
      available: data.available,
      occupied: data.occupied,
    }));

    return {
      totalRooms,
      availableRooms,
      occupiedRooms,
      totalRevenue,
      occupancyRate,
      chartData,
    };
  }, [rooms]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Quartos</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRooms}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.occupancyRate.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quartos Disponíveis</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.availableRooms}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ocupação por Tipo de Quarto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="available" name="Disponível" fill="#22c55e" />
                <Bar dataKey="occupied" name="Ocupado" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoomStats; 