import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter } from 'lucide-react';

interface RoomFiltersProps {
  onFilterChange: (filters: any) => void;
}

const RoomFilters: React.FC<RoomFiltersProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = React.useState({
    search: '',
    type: 'all',
    status: 'all',
    priceRange: [0, 1000],
  });

  const handleChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar por número do quarto..."
                value={filters.search}
                onChange={(e) => handleChange('search', e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="w-full md:w-48">
            <Select
              value={filters.type}
              onValueChange={(value) => handleChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de quarto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Deluxe">Deluxe</SelectItem>
                <SelectItem value="Suite">Suite</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-48">
            <Select
              value={filters.status}
              onValueChange={(value) => handleChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="available">Disponível</SelectItem>
                <SelectItem value="occupied">Ocupado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-64">
            <div className="space-y-2">
              <label className="text-sm font-medium">Faixa de Preço</label>
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => handleChange('priceRange', value)}
                min={0}
                max={1000}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>R$ {filters.priceRange[0]}</span>
                <span>R$ {filters.priceRange[1]}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomFilters; 